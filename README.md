# Publicidad para emprendimiento (Jujuy)

Generador de piezas publicitarias para redes a partir de un único archivo, `config.json`: post para el feed
(1080x1350), historia/estado (1080x1920), carrusel de 4 láminas y un video vertical de 15 s con sonido generado
por código. El diseño está hecho en HTML + CSS + JS (`plantillas/`) y se captura con Chromium (Playwright); el
video se arma cuadro a cuadro y se codifica con ffmpeg.

El número de WhatsApp de este repositorio (**388 000-0000**) es **de ejemplo**: poné el tuyo en `config.json`.

## Uso

```bash
pip install playwright
python -m playwright install chromium
# ffmpeg tiene que estar en el PATH
python generar.py                  # imágenes + video
python generar.py --solo-imagenes
python generar.py --solo-video
python generar.py --control        # además guarda cuadros del video en control/
```

El script revisa cada pieza y avisa si algún texto quedó cortado, pisado o fuera de la zona segura.
Vista previa sin Python: abrí `plantillas/pieza.html?p=post` o `plantillas/video.html` en Chrome.

Más detalles (decisiones de diseño, investigación y consejos para publicar) en [`LEEME.md`](LEEME.md).

Fuentes incluidas (Gloock, Instrument Serif, Outfit) bajo licencia SIL OFL; ver `fuentes/`.
