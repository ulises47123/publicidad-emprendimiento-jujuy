/* piezas.js: arma cada imagen (post, story, carrusel) con los componentes y el texto de config.json.
 * generar.py define window.CFG y window.PIEZA antes de cargar la página.
 */
(function () {
  const U = window.UI, CFG = U.CFG, { esc, rico } = U;
  const opc = (txt, html) => (String(txt || '').trim() ? html : '');
  const deco = () => `<div class="fondo-deco"></div>${U.grano()}`;
  const cab = (derecha = '') => `<header class="cab">${U.marca()}${derecha || U.lugar()}</header>`;
  const desliza = (txt = 'Deslizá') => `<div class="desliza t">${esc(txt)}${U.icono('flecha')}</div>`;
  const total = CFG.carrusel.laminas.length + 2;
  const contador = (i) => `<div class="contador t">${i}<span>/${total}</span></div>`;

  const PIEZAS = {
    post: { w: 1080, h: 1350, html: () => `
      ${deco()}
      ${cab()}
      <div class="p-hero">
        <h1 class="titular t" data-fit="300">${rico(CFG.post.titular)}</h1>
        ${opc(CFG.post.bajada, `<p class="bajada t" data-fit="90">${esc(CFG.post.bajada)}</p>`)}
      </div>
      <div class="p-servicios">${U.listaServicios(true)}</div>
      <div class="p-collage">
        <div class="pc-tel">${U.telefono(232)}</div>
        <div class="pc-vid">${U.videoCard(310)}</div>
      </div>
      <div class="p-cta">${U.boton()}${U.datos()}</div>
      <div class="banda">${U.cerros()}</div>` },

    story: { w: 1080, h: 1920, seguro: { arriba: 250, abajo: 380 }, html: () => `
      ${deco()}
      ${cab()}
      <div class="s-hero">
        <div class="antetitulo t">${esc(CFG.story.antetitulo)}</div>
        <h1 class="titular t" data-fit="270">${rico(CFG.story.titular)}</h1>
        ${opc(CFG.story.bajada, `<p class="bajada t" data-fit="96">${esc(CFG.story.bajada)}</p>`)}
      </div>
      <div class="s-collage">
        <div class="sc-vid">${U.videoCard(410)}</div>
        <div class="sc-tel">${U.telefono(176)}</div>
      </div>
      <div class="s-servicios">${CFG.servicios.map((s) => `<div class="s-serv"><div class="ico">${U.icono(s.icono)}</div><b class="t" data-fit="0">${esc(s.titulo)}</b></div>`).join('')}</div>
      <div class="s-cta">${U.boton()}${U.datos()}</div>
      <div class="banda banda-alta">${U.cerros()}</div>` },
  };

  // ---- Carrusel: portada + una lámina por servicio + cierre ----
  const P = CFG.carrusel.portada;
  PIEZAS.carrusel_1 = { w: 1080, h: 1350, html: () => `
    ${deco()}
    ${cab(contador(1))}
    <div class="c1-hero">
      <div class="antetitulo t">${esc(P.antetitulo)}</div>
      <h1 class="titular t" data-fit="290">${rico(P.titular)}</h1>
    </div>
    <div class="c1-collage">
      <div class="c1-vid">${U.videoCard(500)}</div>
      <div class="c1-tel">${U.telefono(250)}</div>
    </div>
    <div class="c-pie">${desliza(P.pie)}</div>
    <div class="banda banda-fina">${U.cerros()}</div>` };

  const visual = (tipo, l) => {
    if (tipo === 'invitacion') return `<div class="cv-inv"><div class="cv-tel">${U.telefono(214)}</div>
        <div class="cv-chips"><div class="cv-chips-tit t">Para cada ocasión</div><div class="chips chips-col">${(l.chips || []).map((c) => `<span class="chip t">${esc(c)}</span>`).join('')}</div></div></div>`;
    return `<div class="cv-video">${U.videoCard(560)}</div>`;
  };
  CFG.carrusel.laminas.forEach((l, i) => {
    PIEZAS['carrusel_' + (i + 2)] = { w: 1080, h: 1350, html: () => `
      ${deco()}
      ${cab(contador(i + 2))}
      <div class="cs-col">
        <div class="etiqueta t"><span class="num">${esc(l.numero)}</span>${esc(l.etiqueta)}</div>
        <h1 class="titular cs-tit t" data-fit="250">${rico(l.titular)}</h1>
        <div class="cs-visual encajar">${visual(l.visual, l)}</div>
        <ul class="items cs-items">${l.items.map((x) => `<li class="t">${esc(x)}</li>`).join('')}</ul>
      </div>
      <div class="c-pie">${desliza()}</div>
      <div class="banda banda-fina">${U.cerros()}</div>` };
  });

  const Z = CFG.carrusel.cierre;
  PIEZAS['carrusel_' + total] = { w: 1080, h: 1350, html: () => `
    ${deco()}
    ${cab(contador(total))}
    <div class="cz-hero">
      <h1 class="titular t" data-fit="270">${rico(Z.titular)}</h1>
      ${opc(Z.bajada, `<p class="bajada t" data-fit="96">${esc(Z.bajada)}</p>`)}
    </div>
    <div class="cz-cta">
      ${U.boton()}
      <div class="cz-num t" data-fit="0"><span>WhatsApp</span>${esc(CFG.contacto.whatsapp)}</div>
      ${opc(CFG.contacto.instagram, `<div class="cz-ig t">${esc(CFG.contacto.instagram)}</div>`)}
      <div class="cz-lugar t">${esc([CFG.ubicacion, CFG.nota_lugar].filter(Boolean).join(' · '))}</div>
    </div>
    <div class="banda banda-cierre">${U.cerros()}</div>` };

  window.PIEZAS_DISPONIBLES = Object.keys(PIEZAS).map((k) => ({ id: k, w: PIEZAS[k].w, h: PIEZAS[k].h }));

  async function montar(id) {
    const p = PIEZAS[id];
    if (!p) throw new Error('No existe la pieza ' + id);
    U.aplicarColores();
    const raiz = document.getElementById('raiz');
    raiz.innerHTML = `<div class="lienzo ${id.replace(/_\d+$/, '')} ${id}" style="width:${p.w}px;height:${p.h}px">${p.html()}</div>`;
    await document.fonts.ready;
    U.ajustarTextos(raiz);
    U.encajar(raiz);
    const s = p.seguro || {};
    window.PROBLEMAS = U.revisar(raiz.firstElementChild, { margen: 30, arriba: s.arriba || 0, abajo: s.abajo || 0 });
    window.LISTO = true;
  }
  if (window.PIEZA) montar(window.PIEZA).catch((e) => { window.PROBLEMAS = ['ERROR: ' + e.message]; window.LISTO = true; });
})();
