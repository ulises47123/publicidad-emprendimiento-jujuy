/* componentes.js: piezas gráficas propias (SVG/HTML) que comparten las imágenes y el video.
 * Todo se dibuja acá: no hay fotos ni logos de terceros.
 * window.CFG lo inyecta generar.py con el contenido de config.json.
 */
(function () {
  const CFG = window.CFG;
  const C = CFG.colores;

  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // *palabra* -> <em>palabra</em> (cursiva en color de acento)
  const rico = (s) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');

  function aplicarColores() {
    const r = document.documentElement.style;
    r.setProperty('--fondo', C.fondo); r.setProperty('--fondo-2', C.fondo_2);
    r.setProperty('--texto', C.texto); r.setProperty('--texto-suave', C.texto_suave);
    r.setProperty('--acento', C.acento); r.setProperty('--texto-sobre-acento', C.texto_sobre_acento);
    r.setProperty('--oro', C.oro); r.setProperty('--papel', C.papel); r.setProperty('--tinta', C.tinta);
    C.cerros.forEach((c, i) => r.setProperty('--cerro-' + i, c));
  }

  // ---------------- Íconos de línea (dibujados a mano, genéricos) ----------------
  const ICONOS = {
    video: '<rect x="2.5" y="6" width="13" height="12" rx="2.6"/><path d="M15.5 10.4 21 7.4v9.2l-5.5-3"/>',
    regalo: '<rect x="3.2" y="9" width="17.6" height="11.5" rx="2"/><path d="M3.2 13.2h17.6M12 9v11.5"/><path d="M12 9C10.6 6.2 7.2 5 6.3 6.8 5.5 8.4 8 9 12 9Zm0 0c1.4-2.8 4.8-4 5.7-2.2.8 1.6-1.7 2.2-5.7 2.2Z"/>',
    sobre: '<rect x="3" y="5.5" width="18" height="13" rx="2.6"/><path d="m3.6 7.2 8.4 6.3 8.4-6.3"/>',
    chat: '<path d="M4.5 5.5h15a2 2 0 0 1 2 2v8.6a2 2 0 0 1-2 2H11l-4.6 3.4v-3.4H4.5a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z"/><circle cx="8.2" cy="11.8" r=".4" fill="currentColor"/><circle cx="12" cy="11.8" r=".4" fill="currentColor"/><circle cx="15.8" cy="11.8" r=".4" fill="currentColor"/>',
    flecha: '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
    play: '<path d="M7 4.8v14.4L19 12Z" fill="currentColor" stroke="none"/>',
  };
  const icono = (n, extra = '') =>
    `<svg viewBox="0 0 24 24" class="icono-linea" aria-hidden="true" ${extra}>${ICONOS[n] || ICONOS.chat}</svg>`;

  // ---------------- Cerros en franjas (guiño al Cerro de los Siete Colores) ----------------
  let uid = 0;
  const g = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));
  function cerrosContenido({ frente = true, colorFrente = 'var(--fondo)', semilla = 0 } = {}) {
    const id = 'cl' + ++uid;
    const pasos = 50, W = 1000;
    const cresta = (x) => 300 - 170 * g(x, 250 + semilla * 40, 140) - 235 * g(x, 610 - semilla * 30, 150) - 130 * g(x, 900, 115) - 8 * Math.sin(x / 37);
    let sil = `M0,400 L0,${cresta(0).toFixed(1)}`;
    for (let i = 1; i <= pasos; i++) { const x = (W * i) / pasos; sil += ` L${x.toFixed(1)},${cresta(x).toFixed(1)}`; }
    sil += ' L1000,400 Z';
    const linea = (k) => (x) => 18 + k * 54 + 16 * Math.sin(x / 115 + k * 0.8 + semilla) + (x - 500) * 0.13;
    let bandas = '';
    const n = C.cerros.length;
    for (let k = 0; k < n; k++) {
      const a = linea(k), b = k === n - 1 ? () => 460 : linea(k + 1);
      let d = '';
      for (let i = 0; i <= pasos; i++) { const x = (W * i) / pasos; d += (i ? ' L' : 'M') + x.toFixed(1) + ',' + (k === 0 ? -40 : a(x)).toFixed(1); }
      for (let i = pasos; i >= 0; i--) { const x = (W * i) / pasos; d += ' L' + x.toFixed(1) + ',' + b(x).toFixed(1); }
      bandas += `<path d="${d} Z" fill="var(--cerro-${k})"/>`;
    }
    let fr = '';
    if (frente) {
      const yf = (x) => 400 - 70 * g(x, 120, 230) - 46 * g(x, 760, 240) - 20;
      let d = 'M0,400';
      for (let i = 0; i <= pasos; i++) { const x = (W * i) / pasos; d += ` L${x.toFixed(1)},${yf(x).toFixed(1)}`; }
      fr = `<path d="${d} L1000,400 Z" fill="${colorFrente}"/>`;
    }
    return `<defs><clipPath id="${id}"><path d="${sil}"/></clipPath></defs><g clip-path="url(#${id})">${bandas}</g>${fr}`;
  }
  const cerros = (opts = {}) =>
    `<svg viewBox="0 0 1000 400" preserveAspectRatio="${opts.par || 'none'}" class="${opts.clase || ''}" aria-hidden="true">${cerrosContenido(opts)}</svg>`;

  // Guarda de rombos (motivo textil andino) para separar
  function aguayo(n = 9, tam = 10) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const cx = tam + i * tam * 2.4;
      const col = `var(--cerro-${i % C.cerros.length})`;
      s += `<path d="M${cx},0 L${cx + tam},${tam} L${cx},${tam * 2} L${cx - tam},${tam} Z" fill="${col}"/>`;
    }
    const W = tam * 2 + (n - 1) * tam * 2.4;
    return `<svg viewBox="0 0 ${W} ${tam * 2}" aria-hidden="true" style="display:block">${s}</svg>`;
  }

  // Grano de papel (ruido SVG propio)
  const grano = () =>
    `<svg class="grano" aria-hidden="true"><filter id="fgr"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#fgr)"/></svg>`;

  // ---------------- Mockups ----------------
  function telefono(w = 260, clase = '') {
    const e = CFG.ejemplos.invitacion;
    return `<div class="tel mock ${clase}" style="--w:${w}px"><div class="tel-pantalla"><div class="inv">
      <div class="inv-arco"><svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs><linearGradient id="cielo${++uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--cerro-3)"/><stop offset="1" stop-color="var(--papel)"/></linearGradient></defs>
        <rect width="1000" height="560" fill="url(#cielo${uid})"/>
        <circle cx="560" cy="230" r="120" fill="var(--oro)" opacity=".9"/>
        <g transform="translate(0,160)">${cerrosContenido({ frente: true, colorFrente: 'var(--papel)', semilla: 1 })}</g></svg></div>
      <div class="inv-arriba anim-a">${esc(e.arriba)}</div>
      <div class="inv-grande anim-b">${esc(e.grande)}</div>
      <div class="inv-nombre anim-c">${esc(e.nombre)}</div>
      <div class="inv-sep anim-d">${aguayo(7, 10)}</div>
      <div class="inv-fecha anim-d">${esc(e.fecha)}</div>
      <div class="inv-boton anim-e">${esc(e.boton)}</div>
    </div></div></div>`;
  }

  function videoCard(w = 520, clase = '') {
    const clips = [[17, 0], [25, 2], [13, 4], [23, 1], [18, 5]];
    const pista = clips.map(([p, c]) => `<span class="clip" style="flex:${p};background:var(--cerro-${c})"></span>`).join('');
    let onda = '';
    for (let i = 0; i < 52; i++) {
      const h = 22 + 70 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.37)) + 8 * Math.sin(i * 2.3);
      onda += `<span style="height:${Math.max(14, Math.min(100, h)).toFixed(0)}%"></span>`;
    }
    const n = ++uid;
    return `<div class="vid mock ${clase}" style="--w:${w}px">
      <div class="vid-cuadro"><svg class="escena" viewBox="0 0 1000 625" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><linearGradient id="vc${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--cerro-6)"/><stop offset=".55" stop-color="var(--acento)"/><stop offset="1" stop-color="var(--oro)"/></linearGradient></defs>
        <rect width="1000" height="625" fill="url(#vc${n})"/>
        <circle class="vid-sol" cx="250" cy="190" r="78" fill="var(--papel)" opacity=".85"/>
        <g transform="translate(0,235)">${cerrosContenido({ frente: true, colorFrente: '#2A1633', semilla: 2 })}</g></svg>
        <div class="vid-rec"><i></i>REC</div>
        <div class="vid-play" style="color:var(--tinta)">${icono('play')}</div>
      </div>
      <div class="vid-linea"><div class="vid-pista">${pista}</div><div class="vid-onda">${onda}</div><div class="vid-cabezal"></div></div>
      <div class="vid-tiempo"><span>${esc(CFG.ejemplos.video.tiempo.split('/')[0].trim())}</span><span>${esc((CFG.ejemplos.video.tiempo.split('/')[1] || '').trim())}</span></div>
    </div>`;
  }

  // ---------------- Bloques de texto reutilizables ----------------
  // Cabecera: la marca si existe; si config.marca está vacío, el lugar (sin dejar hueco).
  const tieneMarca = () => !!String(CFG.marca || '').trim();
  const marca = () => tieneMarca()
    ? `<div class="marca t" data-fit="0"><span class="rombo"></span><span>${esc(CFG.marca)}</span></div>`
    : `<div class="marca marca-lugar t" data-fit="0"><span class="rombo"></span><span>${esc(CFG.ubicacion)}</span></div>`;
  const lugar = () => tieneMarca()
    ? `<div class="lugar t">${esc(CFG.ubicacion)}</div>`
    : `<div class="lugar t">${esc(CFG.nota_lugar || '')}</div>`;
  const listaServicios = (conDetalle = true) =>
    `<ul class="servicios">${CFG.servicios.map((s) => `<li class="servicio"><div class="ico">${icono(s.icono)}</div><div class="t"><b>${esc(s.titulo)}</b>${conDetalle ? `<span>${esc(s.detalle)}</span>` : ''}</div></li>`).join('')}</ul>`;
  const boton = (texto = CFG.contacto.cta) => `<div class="boton t" data-fit="0">${icono('chat')}<span>${esc(texto)}</span></div>`;
  const datos = () => {
    const ig = String(CFG.contacto.instagram || '').trim();
    return `<div class="datos t" data-fit="0"><span>WhatsApp <b>${esc(CFG.contacto.whatsapp)}</b></span>${ig ? `<span class="sep"></span><b>${esc(ig)}</b>` : ''}</div>`;
  };

  // ---------------- Ajuste automático de textos (por si el nombre o el número son largos) ----------------
  function ajustarTextos(root = document) {
    for (const el of root.querySelectorAll('[data-fit]')) {
      const maxH = parseFloat(el.dataset.fit) || 0;
      let fs = parseFloat(getComputedStyle(el).fontSize);
      const min = fs * 0.55;
      const excede = () => el.scrollWidth > el.clientWidth + 1 || (maxH > 0 && el.getBoundingClientRect().height > maxH + 1);
      while (excede() && fs > min) { fs -= 2; el.style.fontSize = fs + 'px'; }
    }
  }

  // ---------------- Control de calidad: textos fuera del lienzo, desbordados o pisados ----------------
  function revisar(lienzo, { margen = 30, arriba = 0, abajo = 0 } = {}) {
    const R = lienzo.getBoundingClientRect();
    const prob = [];
    const textos = [...lienzo.querySelectorAll('.t')].filter((e) => !e.closest('.mock') && e.offsetParent !== null);
    const nombre = (e) => (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    for (const e of textos) {
      const r = e.getBoundingClientRect();
      if (r.left < R.left + margen - 1 || r.right > R.right - margen + 1 || r.top < R.top + Math.max(margen, arriba) - 1 || r.bottom > R.bottom - Math.max(margen, abajo) + 1)
        prob.push(`fuera de zona segura: "${nombre(e)}" (${Math.round(r.left - R.left)},${Math.round(r.top - R.top)} - ${Math.round(r.right - R.left)},${Math.round(r.bottom - R.top)})`);
      if (e.scrollWidth > e.clientWidth + 1) prob.push(`texto desbordado: "${nombre(e)}"`);
    }
    for (let i = 0; i < textos.length; i++)
      for (let j = i + 1; j < textos.length; j++) {
        const a = textos[i], b = textos[j];
        if (a.contains(b) || b.contains(a)) continue;
        const p = a.getBoundingClientRect(), q = b.getBoundingClientRect();
        const sx = Math.min(p.right, q.right) - Math.max(p.left, q.left), sy = Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top);
        if (sx > 2 && sy > 2) prob.push(`textos superpuestos: "${nombre(a)}" / "${nombre(b)}"`);
      }
    // Mockups (celular y fotograma de video) que tapan algún texto
    const mocks = [...lienzo.querySelectorAll('.mock')].filter((m) => !m.parentElement.closest('.mock'));
    for (const m of mocks)
      for (const e of textos) {
        const p = m.getBoundingClientRect(), q = e.getBoundingClientRect();
        const sx = Math.min(p.right, q.right) - Math.max(p.left, q.left), sy = Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top);
        if (sx > 6 && sy > 6) prob.push(`un mockup tapa el texto "${nombre(e)}"`);
      }
    return prob;
  }

  // Achica el contenido de los contenedores .encajar para que entre en el espacio que les queda
  function encajar(root = document) {
    for (const caja of root.querySelectorAll('.encajar')) {
      const hijo = caja.firstElementChild; if (!hijo) continue;
      hijo.style.scale = '1';
      const c = caja.getBoundingClientRect(), h = hijo.getBoundingClientRect();
      const s = Math.min(1, c.height / h.height, c.width / h.width);
      if (s < 1) hijo.style.scale = s.toFixed(3);
    }
  }

  window.UI = { CFG, esc, rico, aplicarColores, icono, cerros, cerrosContenido, aguayo, grano, telefono, videoCard, marca, lugar, tieneMarca, listaServicios, boton, datos, ajustarTextos, encajar, revisar };
})();
