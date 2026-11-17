/* video.js: escenas del video vertical + motor de tiempo determinista.
 * Idea tomada del motor.js del video de ProjectPilot: seek(t) pausa todas las animaciones CSS
 * y les fija currentTime, así cada cuadro sale idéntico sin depender del reloj.
 * Acá todas las animaciones usan tiempo global: animation-delay = inicio de escena + data-in.
 */
(function () {
  const U = window.UI, CFG = U.CFG, { esc, rico } = U;
  const V = CFG.video.escenas;
  // Duración de cada escena (segundos): gancho 3,4 s, cada servicio 3,6 s, cierre 4,4 s.
  const DUR = V.map((_, i) => (i === 0 ? 3.4 : i === V.length - 1 ? 4.4 : 3.6));
  const ESC = []; let acc = 0;
  DUR.forEach((d) => { ESC.push({ s: acc, d }); acc += d; });
  const TOTAL = +acc.toFixed(3);
  const CRUCE = 0.3;

  const A = (anim, t, extra = '') => `data-anim="${anim}" data-in="${t}" ${extra}`;
  const etq = (txt, num) => `<div class="v-etq"><div class="etiqueta t" ${A('pop', 0.05)}>${num ? `<span class="num">${num}</span>` : ''}${esc(txt)}</div></div>`;
  const tit = (txt, t = 0.25) => `<h1 class="titular v-tit t" data-fit="240" ${A('sube', t)}>${rico(txt)}</h1>`;
  const chips = (lista, t0) => lista.map((c, i) => `<span class="chip t" ${A('izq', (t0 + i * 0.16).toFixed(2))}>${esc(c)}</span>`).join('');

  // Primera escena = gancho, última = cierre; las del medio muestran un servicio (visual: video | invitacion).
  const gancho = (e) => `<div class="v-centro e0-ante antetitulo t" ${A('sube', 0.15)}>${esc(e.antetitulo)}</div>
           <h1 class="titular e0-tit t" data-fit="420" ${A('sube', 0.8)}>${rico(e.titular)}</h1>
           <div class="e0-aguayo" ${A('aparece', 1.5)}>${U.aguayo(12, 12)}</div>`;
  const servicio = (e, n) => {
    const num = String(n).padStart(2, '0');
    if (e.visual === 'invitacion')
      return `${etq(e.etiqueta, num)}${tit(e.titular)}
           <div class="e2-tel" ${A('escala', 0.3)}>${U.telefono(360)}</div>
           <div class="e2-chips"><div class="chips">${chips(e.chips || [], 1.1)}</div></div>`;
    return `${etq(e.etiqueta, num)}${tit(e.titular)}
           <div class="e1-vid" ${A('escala', 0.35)}>${U.videoCard(800)}</div>
           ${e.detalle ? `<div class="v-centro e1-det t" ${A('sube', 1.2)}>${esc(e.detalle)}</div>` : ''}`;
  };
  const cierre = (e) => `<h1 class="titular e4-tit t" data-fit="330" ${A('sube', 0.1)}>${rico(e.titular)}</h1>
           <div class="e4-cta">
             <div ${A('pop', 0.6)}><div ${A('pulso', 1.3)}>${U.boton()}</div></div>
             <div class="e4-num t" data-fit="0" ${A('sube', 1.0)}><span>WhatsApp</span>${esc(CFG.contacto.whatsapp)}</div>
             ${String(CFG.contacto.instagram || '').trim() ? `<div class="e4-lugar t" ${A('sube', 1.2)}><b>${esc(CFG.contacto.instagram)}</b></div>` : ''}
             <div class="e4-lugar t" ${A('sube', 1.3)}>${esc([CFG.ubicacion, CFG.nota_lugar].filter(Boolean).join(' · '))}</div>
           </div>
           <div class="e4-serv">${CFG.servicios.map((s, i) => `<div class="ico" ${A('pop', (1.6 + i * 0.12).toFixed(2))}>${U.icono(s.icono)}</div>`).join('')}</div>`;
  const escenas = V.map((e, i) => () => (i === 0 ? gancho(e) : i === V.length - 1 ? cierre(e) : servicio(e, i)));

  U.aplicarColores();
  document.getElementById('raiz').innerHTML = `<div class="lienzo video" style="width:1080px;height:1920px">
      <div class="fondo-deco"></div>${U.grano()}
      <div class="banda" data-anim="banda" data-in="0" data-global="1">${U.cerros()}</div>
      <header class="cab" data-anim="aparece" data-in="0.1" data-global="1">${U.marca()}${U.lugar()}</header>
      ${escenas.map((f, i) => `<section class="esc" data-i="${i}">${f()}</section>`).join('')}
    </div>`;
  const lienzo = document.querySelector('.lienzo');
  const secciones = [...document.querySelectorAll('.esc')];

  // Delays absolutos
  for (const el of document.querySelectorAll('[data-in]')) {
    const sc = el.closest('.esc');
    const base = sc ? ESC[+sc.dataset.i].s : 0;
    el.style.animationDelay = (base + parseFloat(el.dataset.in)).toFixed(3) + 's';
  }
  secciones.forEach((sc, i) => {
    const s = ESC[i].s;
    sc.querySelectorAll('.vid-cabezal').forEach((e) => (e.style.animationDelay = (s + 1.0) + 's'));
    sc.querySelectorAll('.vid-pista .clip').forEach((e, k) => (e.style.animationDelay = (s + 0.6 + k * 0.1).toFixed(2) + 's'));
    ['a', 'b', 'c', 'd', 'e'].forEach((x, k) => sc.querySelectorAll('.tel .anim-' + x).forEach((e) => (e.style.animationDelay = (s + 0.7 + k * 0.17).toFixed(2) + 's')));
  });

  const clamp = (x) => Math.min(1, Math.max(0, x));
  window.seek = function (t) {
    for (const a of document.getAnimations()) { a.pause(); a.currentTime = t * 1000; }
    secciones.forEach((sc, i) => {
      const { s, d } = ESC[i];
      const loc = t - s, ultima = i === secciones.length - 1;
      const fin = ultima ? d : d + CRUCE;
      const vis = loc >= -0.0005 && loc < fin;
      let op = 1;
      if (i > 0) op = Math.min(op, clamp(loc / CRUCE));
      if (!ultima) op = Math.min(op, clamp((d + CRUCE - loc) / CRUCE));
      sc.style.visibility = vis ? 'visible' : 'hidden';
      sc.style.opacity = vis ? op.toFixed(3) : '0';
      const salida = !ultima && loc > d ? clamp((loc - d) / CRUCE) : 0;
      const zoom = 1 + 0.02 * clamp(loc / d);
      sc.style.transform = `translateY(${(-50 * salida).toFixed(1)}px) scale(${zoom.toFixed(4)})`;
    });
  };

  // Revisión de calidad por escena (en el momento en que todo ya entró)
  function revisarTodo() {
    const prob = [];
    secciones.forEach((sc, i) => {
      secciones.forEach((o) => (o.style.display = o === sc ? '' : 'none'));
      window.seek(ESC[i].s + ESC[i].d - 0.05);
      U.revisar(lienzo, { margen: 30, arriba: 250, abajo: 380 }).forEach((p) => prob.push(`escena ${i + 1}: ${p}`));
    });
    secciones.forEach((o) => (o.style.display = ''));
    window.seek(0);
    return [...new Set(prob)];
  }

  window.MOTOR = { listo: false, total: TOTAL, escenas: ESC, revisarTodo };
  (async () => {
    await document.fonts.ready;
    U.ajustarTextos(lienzo);
    window.seek(0);
    window.MOTOR.listo = true;
    // Vista previa en el navegador (sin generar.py): reproduce en bucle
    if (!window.__RENDER__) {
      const t0 = performance.now();
      const paso = () => { window.seek(((performance.now() - t0) / 1000) % TOTAL); requestAnimationFrame(paso); };
      document.body.style.cssText = 'margin:0;overflow:hidden;background:#111';
      const esc = Math.min(innerWidth / 1080, innerHeight / 1920);
      lienzo.style.transformOrigin = '0 0'; lienzo.style.transform = `scale(${esc})`;
      requestAnimationFrame(paso);
    }
  })();
})();
