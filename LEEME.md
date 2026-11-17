# Publicidad: edición de videos y fotos, videos personalizados e invitaciones digitales

## Qué hay en esta carpeta

| Archivo | Para qué sirve |
|---|---|
| `post_feed_1080x1350.png` | Pieza principal para el feed de Instagram o Facebook (4:5). |
| `story_estado_1080x1920.png` | Historia de Instagram o estado de WhatsApp (9:16). |
| `carrusel_1.png` … `carrusel_4.png` | Carrusel: portada, videos y edición, invitaciones digitales y cierre con contacto (1080x1350). |
| `promo_vertical.mp4` | Video de 15 s para Reels, estados o TikTok (1080x1920, 30 fps, H.264, con un sonido suave generado por código). |
| `config.json` | Todos los textos, el contacto y los colores. |
| `generar.py` | Vuelve a hacer todas las piezas desde `config.json`. |
| `plantillas/` | Diseño en HTML, CSS y JS: componentes, piezas y video. |
| `fuentes/` | Gloock, Instrument Serif y Outfit, de Google Fonts, con sus licencias OFL. |
| `filosofia_diseno.md` | Concepto visual, según el método de la skill canvas-design. |
| `control/` | Capturas de control del video. Se puede borrar. |

Datos usados: WhatsApp **388 000-0000** (número de ejemplo: poné el tuyo en `config.json`), Jujuy, entregas a coordinar. No hay marca ni Instagram: el diseño no deja huecos para esos campos. Servicios (3): edición de videos y fotos, videos personalizados e invitaciones digitales. Si más adelante se suma otro servicio, se agrega en `servicios` y, si querés una lámina propia, en `carrusel.laminas`.

## Cómo cambiar los datos y regenerar

1. Abrí `config.json` con el Bloc de notas o VS Code.
2. Cambiá lo que necesites:
   - `"marca"`: si algún día hay un nombre, escribilo acá. Aparece arriba a la izquierda en todas las piezas. Vacío, se muestra "Jujuy".
   - `"contacto"`: `whatsapp`, `instagram` (vacío = no se muestra) y `cta` (el texto del botón).
   - Titulares: en `post`, `story`, `carrusel` y `video`. Lo que va entre `*asteriscos*` sale en cursiva color coral.
   - `"colores"`: la paleta. `cerros` son las 7 franjas de color.
   - `"ejemplos"`: los textos de muestra que aparecen dentro del celular y del fotograma de video, como "Mis 15 · Sofía".
3. En una terminal, ejecutá:
   ```
   python generar.py
   ```
   - Con `--solo-imagenes` regenera solo las imágenes (unos 10 s). Con `--solo-video` regenera solo el video (cerca de 1 min). Con `--control` también guarda capturas del video en `control/`.
   - El script revisa cada pieza solo. Avisa si un texto quedó fuera de la zona segura, cortado, pisado por otro o tapado por un mockup. Si un nombre o un número es largo, la letra se achica sola hasta entrar.
   - Requisitos: Python con `playwright` (`python -m playwright install chromium`) y `ffmpeg` en el PATH.
4. Vista previa sin Python: abrí `plantillas/pieza.html?p=post` (o `story`, `carrusel_1`, etc.) o `plantillas/video.html` en Chrome. Usan `config_vista_previa.js`, que se actualiza cada vez que corrés `generar.py`.

## Lo que se investigó

- **Medidas.** Para el feed, 1080x1350 (4:5) es la medida vertical más segura. Para historias y estados, 1080x1920 (9:16). En historias y estados, la interfaz tapa unos 250 px arriba y entre 250 y 400 px abajo, según la app y el teléfono. Por eso todo el texto de la story y del video queda entre los 250 px de arriba y los 380 px de abajo, y la franja inferior es solo decorativa. Hay que comprobarlo en un teléfono real, porque las guías no coinciden. Además, WhatsApp convierte los PNG a JPG, así que todas las piezas tienen fondo sólido.
  Fuentes: [Tiendanube: tamaño de historias 2026](https://www.tiendanube.com/blog/historia-instagram-tamano/), [Tiendanube: tamaño de post 2026](https://www.tiendanube.com/blog/tamano-post-instagram/), [Metricool](https://metricool.com/es/tamano-de-fotos-instagram/), [Chatarmin: tamaños para WhatsApp](https://chatarmin.com/en/blog/whats-app-image-size-guide), [imresizer: WhatsApp 2026](https://imresizer.com/blog/whatsapp-image-sizes-2026-complete-guide).
- **Jerarquía y llamada a la acción.** Hay que definir un mensaje principal y dos secundarios, y ordenarlos por tamaño, posición y contraste. Conviene una estructura simple, aire alrededor de cada bloque y una sola acción clara al final, porque después de leer la gente se pregunta "¿y ahora qué hago?". Por eso todas las piezas siguen el mismo orden: gancho, ejemplo visual, servicios y un único botón de WhatsApp.
  Fuentes: [Platzi: jerarquía visual](https://platzi.com/cursos/diseno-marketing/jerarquia-visual-en-diseno-de-campanas/), [QuillBot: cómo hacer un flyer](https://quillbot.com/es/blog/diseno-grafico/flyer/), [Design Pickle: 7 consejos para flyers](https://designpickle.com/7-tips-for-designing-promotional-flyers/), [Paperlust: diseño, jerarquía y CTA](https://printshop.paperlust.co/blog?p=2598).
- **Emprendimientos chicos en Argentina.**
  - En los primeros segundos de un video va el gancho, con texto en pantalla porque muchos lo miran sin sonido.
  - Los Reels conviene que duren de 15 a 45 s.
  - Un carrusel funciona con una promesa en la primera lámina, una idea por lámina y una última lámina que diga qué hacer.
  - Conviene poner un solo link en la bio (WhatsApp) y publicar historias todos los días.
  - Sirve armar destacadas con precios, opiniones y preguntas frecuentes, y responder en la primera hora.
  - Como mínimo, publicar 3 veces por semana.
  - WhatsApp es el canal de venta de la mayoría de las pymes: según Mercado, lo usa el 73 %.

  Fuentes: [Coderhouse: crecer en redes sin publicidad](https://www.coderhouse.com/ar/coderlibrary/crecer-redes-sociales-sin-publicidad-tacticas-organicas), [Mercado: WhatsApp y redes en los negocios](https://mercado.com.ar/finanzas/whatsapp-y-redes-sociales-aliados-en-los-negocios-digitales).
- **Competencia en invitaciones.** En Mercado Libre hay cientos de invitaciones digitales para 15 años y casamientos. Para diferenciarse sirve mostrar el estilo propio, la versión animada o en video y la atención personalizada.
  Fuentes: [Mercado Libre: invitaciones de 15](https://listado.mercadolibre.com.ar/invitaciones-digitales-15anos), [InfoNegocios: "Quiero invitar"](https://infonegocios.info/amp/infotecnologia/venis-a-mi-fiestita-quiero-invitar-una-plataforma-facil).

## Skill descargada y qué se tomó de ella

- **canvas-design**, del repositorio oficial [anthropics/skills](https://github.com/anthropics/skills/tree/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/canvas-design), commit `e4bb5d9`. Está guardada en `C:\Users\Usuario\Downloads\skills_publicidad\canvas-design\`, con un `ORIGEN.txt`. No trae scripts, solo `SKILL.md`, la licencia y fuentes OFL. No se instaló en `~/.claude/skills`.
- De la skill se tomó lo siguiente:
  1. Escribir antes una filosofía visual: "Estratos de fiesta", en `filosofia_diseno.md`.
  2. Una referencia sutil al tema: los cerros en franjas de Purmamarca y los rombos del aguayo.
  3. Una paleta limitada y coherente, con formas y patrones que se repiten.
  4. Nada se pisa ni se corta y todo tiene margen. Esto se convirtió en el control automático de `generar.py`.
  5. Usar las fuentes de su carpeta `canvas-fonts`: Gloock, Instrument Serif y Outfit.
  6. Para el carrusel, láminas distintas que cuentan una historia, y en el pulido final refinar lo que ya está en lugar de agregar más elementos.
- Se adaptó una cosa: la skill está pensada para "arte" con 90 % de imagen. Una publicidad necesita servicios y contacto legibles, así que el texto es breve pero claro.

## Decisiones de diseño

- **Paleta.** Fondo ciruela (#2A1633), texto crema, acento coral para la acción y oro para los antetítulos. Contrastes WCAG: texto/fondo 15,2:1, oro/fondo 9,9:1, coral/fondo 7,2:1 y botón 7,2:1. Todos pasan el nivel AA, con margen de sobra.
- **Tipografía.** Los titulares van de 92 a 172 px y el texto secundario no baja de 27 px en 1080 de ancho, así que se lee en el celular sin hacer zoom.
- **Imágenes propias.** Celular con una invitación de muestra y fotograma de video con línea de tiempo, todo dibujado en SVG y CSS. No hay fotos, logos ni marcas de terceros. El ícono de chat es genérico.
- **Identidad sin marca.** Como no hay nombre, la identidad está en el número de WhatsApp, que es grande en el cierre y en el video, y en el motivo de los cerros, que aparece en todas las piezas.
- **Video.** Tiene 4 escenas: gancho, videos y edición, invitaciones digitales y contacto. Las transiciones son fundidos con un zoom lento, y el cierre dura 4,4 s para que dé tiempo a anotar el número. El sonido son campanitas y un acorde suave sintetizados por código, sin música con derechos.

## Consejos para publicar

- **Orden sugerido:**
  1. Día 1: el carrusel en el feed.
  2. Día 2 o 3: el video como Reel.
  3. Después, el post principal.
  4. La story o estado conviene repetirla 2 o 3 veces por semana en WhatsApp, que es donde está la clientela del barrio.
- **Horarios.** No hay un estudio específico de Argentina para 2026. Los datos globales apuntan a martes a jueves, entre el mediodía y las 19 h, y los domingos de 18 a 21 h. Después de 2 o 3 semanas, mirá en Estadísticas de Instagram a qué hora está activa tu gente y ajustá. Fuentes: [Buffer](https://buffer.com/es/resources/mejor-hora-publicar-instagram), [Tiendanube](https://www.tiendanube.com/blog/consejo-rapido-mejor-horario-instagram/), [Iconosquare](https://www.iconosquare.com/es/blog/la-mejor-hora-para-publicar-en-instagram-y-como-encontrarla), [Metricool](https://metricool.com/es/mejores-horas-instagram/).
- **Hashtags.** Usá de 5 a 10, mezclando locales y de rubro:
  `#Jujuy #SanSalvadorDeJujuy #JujuyArgentina #EmprendedoresJujuy #HechoEnJujuy #InvitacionesDigitales #Mis15 #XVAños #CasamientoJujuy #EdicionDeVideo #VideosPersonalizados`
  Sumá la ciudad o localidad concreta si atendés más en una zona, por ejemplo #Palpalá, #Perico o #LibertadorGeneralSanMartín.
- **Descripción de ejemplo** (lista para copiar):
  > ¿Se viene un cumple, tus 15, un casamiento o un bautismo?
  > Hacemos invitaciones digitales, videos personalizados y edición de fotos y videos.
  > Escribinos y te armamos un presupuesto: WhatsApp 388 000-0000 (wa.me/5493880000000)
  > Jujuy · Entregas a coordinar
- **Otros consejos:**
  - En el estado de WhatsApp, agregá el texto "Respondé este estado y te paso info".
  - En la historia de Instagram, poné un sticker de enlace a `wa.me/5493880000000`.
  - Fijá el carrusel arriba de todo en el perfil.
  - Armá destacadas con Trabajos, Precios y Opiniones.
  - Cuando tengas trabajos reales con permiso del cliente, reemplazá los mockups de muestra por esos ejemplos: lo que más vende es la prueba social.
