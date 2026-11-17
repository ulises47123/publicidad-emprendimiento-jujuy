"""Genera toda la publicidad a partir de config.json.

Uso (desde cualquier carpeta):
  python generar.py                 # imágenes + video
  python generar.py --solo-imagenes
  python generar.py --solo-video
  python generar.py --control       # además guarda cuadros sueltos del video en control/

Requisitos: Python 3.10+, playwright (python -m playwright install chromium) y ffmpeg en el PATH.
Las imágenes se hacen en HTML+CSS (carpeta plantillas/) y se capturan con Chromium.
El video se captura cuadro a cuadro (determinista) y se codifica con ffmpeg en H.264.
"""
import argparse, json, math, pathlib, struct, subprocess, sys, time, wave
from playwright.sync_api import sync_playwright

BASE = pathlib.Path(__file__).resolve().parent
PLANT = BASE / "plantillas"
FPS = 30

ap = argparse.ArgumentParser()
ap.add_argument("--solo-imagenes", action="store_true")
ap.add_argument("--solo-video", action="store_true")
ap.add_argument("--control", action="store_true", help="guarda cuadros de control del video en control/")
ap.add_argument("--config", default=str(BASE / "config.json"))
a = ap.parse_args()

cfg = json.loads(pathlib.Path(a.config).read_text(encoding="utf-8"))
cfg_js = json.dumps(cfg, ensure_ascii=False)
# Copia para abrir las plantillas a mano en el navegador (vista previa sin Python)
(BASE / "config_vista_previa.js").write_text("window.CFG = " + cfg_js + ";\n", encoding="utf-8")

NOMBRES = {"post": "post_feed_1080x1350.png", "story": "story_estado_1080x1920.png"}
avisos = []


def abrir(browser, html, w, h, extra=""):
    page = browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
    page.add_init_script(f"window.CFG = {cfg_js}; {extra}")
    errores = []
    page.on("pageerror", lambda e: errores.append(str(e)))
    page.on("console", lambda m: errores.append(m.text) if m.type == "error" else None)
    page.goto((PLANT / html).as_uri())
    return page, errores


def imagenes(browser):
    page, _ = abrir(browser, "pieza.html", 1080, 1350, "window.PIEZA = '';")
    page.wait_for_function("window.PIEZAS_DISPONIBLES")
    lista = page.evaluate("window.PIEZAS_DISPONIBLES")
    page.close()
    for p in lista:
        nombre = NOMBRES.get(p["id"], p["id"] + ".png")
        page, errores = abrir(browser, "pieza.html", p["w"], p["h"], f"window.PIEZA = '{p['id']}';")
        page.wait_for_function("window.LISTO === true", timeout=30000)
        probs = page.evaluate("window.PROBLEMAS") + errores
        page.locator(".lienzo").screenshot(path=str(BASE / nombre))
        page.close()
        estado = "OK" if not probs else "REVISAR"
        print(f"  [{estado}] {nombre}")
        for x in probs:
            print("        -", x); avisos.append(f"{nombre}: {x}")


def sonido(ruta, escenas, total, sr=48000):
    """Campanitas suaves en cada cambio de escena + un colchón muy bajo. Generado por código (sin música de terceros)."""
    n = int(total * sr)
    buf = [0.0] * n
    def nota(t0, f, dur=1.8, vol=0.22):
        i0 = int(t0 * sr)
        for i in range(int(dur * sr)):
            if i0 + i >= n: break
            t = i / sr
            env = min(1.0, t / 0.006) * math.exp(-t * 3.2)
            s = math.sin(2 * math.pi * f * t) + 0.35 * math.sin(2 * math.pi * f * 2.01 * t) * math.exp(-t * 6) + 0.12 * math.sin(2 * math.pi * f * 3.02 * t) * math.exp(-t * 9)
            buf[i0 + i] += vol * env * s
    escala = [659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.5, 1567.98]
    for k, t0 in enumerate(escenas):
        nota(t0 + 0.05, escala[k % len(escala)])
        nota(t0 + 0.20, escala[(k + 2) % len(escala)], vol=0.12)
    final = escenas[-1]
    for j, f in enumerate([1046.5, 1318.5, 1567.98, 2093.0]):
        nota(final + 1.0 + j * 0.11, f, dur=2.2, vol=0.10)
    # colchón: acorde grave muy suave con entrada y salida
    acordes = [(130.81, 164.81, 196.0), (110.0, 130.81, 164.81), (146.83, 174.61, 220.0), (130.81, 164.81, 196.0), (130.81, 164.81, 196.0)]
    for i in range(n):
        t = i / sr
        k = 0
        for j, t0 in enumerate(escenas):
            if t >= t0: k = j
        fade = min(1.0, t / 1.2, (total - t) / 1.5)
        buf[i] += 0.035 * fade * sum(math.sin(2 * math.pi * f * t) for f in acordes[k % len(acordes)])
    pico = max(1e-9, max(abs(x) for x in buf))
    g = 0.7 / pico if pico > 0.7 else 1.0
    with wave.open(str(ruta), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, x * g)) * 32767)) for x in buf))


def video(browser):
    page, errores = abrir(browser, "video.html", 1080, 1920, "window.__RENDER__ = true;")
    page.wait_for_function("window.MOTOR && window.MOTOR.listo === true", timeout=30000)
    total = page.evaluate("window.MOTOR.total")
    inicios = page.evaluate("window.MOTOR.escenas.map(e => e.s)")
    probs = page.evaluate("window.MOTOR.revisarTodo()")
    for x in probs:
        print("        -", x); avisos.append("video: " + x)
    if a.control:
        (BASE / "control").mkdir(exist_ok=True)
        escs = page.evaluate("window.MOTOR.escenas")
        tiempos = sorted({round(e["s"] + x, 2) for e in escs for x in (0.5, 1.6)} | {round(e["s"] + e["d"] - 0.1, 2) for e in escs})
        for t in tiempos:
            page.evaluate("t => seek(t)", t)
            page.screenshot(path=str(BASE / "control" / f"video_t{t:05.2f}.png"))
    mudo = BASE / "_video_mudo.mp4"
    ff = subprocess.Popen(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "mjpeg", "-framerate", str(FPS), "-i", "-",
                           "-vf", "scale=in_range=pc:out_range=tv,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                           "-profile:v", "high", "-color_range", "tv", "-g", str(FPS * 2), str(mudo)], stdin=subprocess.PIPE)
    nf = round(total * FPS); t0 = time.time()
    for i in range(nf):
        page.evaluate("t => seek(t)", i / FPS)
        ff.stdin.write(page.screenshot(type="jpeg", quality=93))
        if i % (FPS * 3) == 0: print(f"    cuadro {i}/{nf}  ({time.time() - t0:.0f} s)", flush=True)
    ff.stdin.close(); ff.wait()
    page.close()
    for e in errores: avisos.append("video consola: " + e)
    out = BASE / "promo_vertical.mp4"
    dur = nf / FPS
    if cfg.get("video", {}).get("sonido", True):
        wav = BASE / "_sonido.wav"
        sonido(wav, inicios, dur)
        subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(mudo), "-i", str(wav), "-map", "0:v", "-map", "1:a",
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-t", f"{dur:.3f}", "-movflags", "+faststart", str(out)], check=True)
        wav.unlink(missing_ok=True)
    else:
        subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(mudo), "-c:v", "copy", "-movflags", "+faststart", str(out)], check=True)
    mudo.unlink(missing_ok=True)
    print(f"  [OK] promo_vertical.mp4  ({nf} cuadros, {dur:.1f} s, {time.time() - t0:.0f} s de render)")


with sync_playwright() as p:
    browser = p.chromium.launch(args=["--force-color-profile=srgb", "--font-render-hinting=none", "--disable-lcd-text", "--hide-scrollbars"])
    if not a.solo_video:
        print("Imágenes:"); imagenes(browser)
    if not a.solo_imagenes:
        print("Video:"); video(browser)
    browser.close()

print("\nListo." if not avisos else f"\nListo, con {len(avisos)} aviso(s) para revisar (arriba).")
