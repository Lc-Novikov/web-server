(() => {
  'use strict';

  const API = '';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const state = {
    crew: [],
    filter: 'all',
    crewLoaded: false,
    reviewsLoaded: false,
    currentNumber: null,
    qrSeen: false,
    startedAt: 0,
    pollQR: null,
    pollStatus: null,
    elapsedTimer: null,
  };

  const els = {
    net: $('#net'),
    netText: $('#netText'),
    heroCrew: $('#heroCrew'),
    connectForm: $('#connectForm'),
    number: $('#number'),
    numberField: $('#numberField'),
    generateBtn: $('#generateBtn'),
    formMsg: $('#formMsg'),
    scanEmpty: $('#scanEmpty'),
    scanLive: $('#scanLive'),
    scanDone: $('#scanDone'),
    qrImg: $('#qrImg'),
    scanStatus: $('#scanStatus'),
    scanText: $('#scanText'),
    scanElapsed: $('#scanElapsed'),
    scanNote: $('#scanNote'),
    crewList: $('#crewList'),
    crewState: $('#crewState'),
    crewCount: $('#crewCount'),
    manifestStats: $('#manifestStats'),
    updatedAt: $('#updatedAt'),
    countAll: $('#countAll'),
    countVip: $('#countVip'),
    countNormal: $('#countNormal'),
    refreshBtn: $('#refreshBtn'),
    reviews: $('#reviews'),
    reviewsState: $('#reviewsState'),
    reviewCount: $('#reviewCount'),
    reviewForm: $('#reviewForm'),
    reviewBtn: $('#reviewBtn'),
    revName: $('#revName'),
    revMsg: $('#revMsg'),
    reviewMsg: $('#reviewMsg'),
  };

  /* ---------- Utils ---------- */

  const escapeHTML = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));

  const cleanNumber = (value) => String(value ?? '').replace(/\D/g, '');
  const pad2 = (value) => String(value).padStart(2, '0');
  const timeNow = () =>
    new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const isImageSrc = (value) =>
    typeof value === 'string' &&
    (/^(https?:\/\/|data:image\/)/i.test(value) || /^(\/|\.{1,2}\/|assets\/)/i.test(value));

  const iconAnchor = `
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" aria-hidden="true">
      <circle cx="12" cy="5.2" r="2.1"/>
      <path d="M12 7.6V19"/>
      <path d="M8.1 10.4h7.8"/>
      <path d="M12 19c-3.3 0-5.5-2.3-5.9-5.3M12 19c3.3 0 5.5-2.3 5.9-5.3"/>
    </svg>`;

  const iconCrown = `
    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 8l4.5 3L12 5l4.5 6L21 8l-2 10H5L3 8Z"/>
    </svg>`;

  function stateBlock(title, sub, action = '') {
    return `<div class="state">
      ${iconAnchor}
      <p>${escapeHTML(title)}</p>
      <p class="state-sub">${escapeHTML(sub)}</p>
      ${action}
    </div>`;
  }

  async function api(path, options = {}) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(API + path, {
        cache: 'no-store',
        signal: controller.signal,
        ...options,
      });
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }
      if (!res.ok) {
        throw new Error((data && data.error) || `Respuesta ${res.status}`);
      }
      return data || {};
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function setNetwork(kind, label) {
    els.net.dataset.state = kind;
    els.netText.textContent = label;
  }

  /* ---------- Crew manifest ---------- */

  function setFilter(filter) {
    state.filter = filter;
    $$('.filters button').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    });
    renderCrew();
  }

  function crewRowHTML(member, index) {
    const name = String(member.name || 'Sub-Bot').trim() || 'Sub-Bot';
    const rawNumber = String(member.number || '').split('@')[0];
    const digits = cleanNumber(rawNumber);
    const initials =
      name.split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase().slice(0, 2) ||
      'SB';
    const isVip = Boolean(member.vip);
    const pic = isImageSrc(member.pic)
      ? `<img class="crew-photo" src="${escapeHTML(member.pic)}" alt="" loading="lazy" width="42" height="42">`
      : '';
    const contact = digits
      ? `<a class="crew-contact" href="https://wa.me/${digits}" target="_blank" rel="noopener noreferrer">wa.me/${escapeHTML(digits)}</a>`
      : '<span class="crew-contact">Sin número</span>';

    return `<li class="crew-row">
      <span class="crew-index">${pad2(index + 1)}</span>
      <div class="crew-id">
        <span class="crew-avatar">
          ${pic}
          <span class="crew-initials" aria-hidden="true">${escapeHTML(initials)}</span>
        </span>
        <span class="crew-name" title="${escapeHTML(name)}">${escapeHTML(name)}</span>
      </div>
      ${contact}
      <span class="badge ${isVip ? 'badge-vip' : 'badge-normal'}">${isVip ? iconCrown : ''}${isVip ? 'VIP' : 'Normal'}</span>
      <span class="crew-status"><span class="dot" aria-hidden="true"></span>A bordo</span>
    </li>`;
  }

  function renderCrew() {
    const all = state.crew;
    const vip = all.filter((member) => Boolean(member.vip));
    const normal = all.filter((member) => !member.vip);
    const filtered =
      state.filter === 'vip' ? vip : state.filter === 'normal' ? normal : all;

    els.countAll.textContent = all.length;
    els.countVip.textContent = vip.length;
    els.countNormal.textContent = normal.length;
    els.crewCount.textContent = pad2(all.length);
    els.heroCrew.textContent = pad2(all.length);

    if (!filtered.length) {
      els.crewList.innerHTML = '';
      els.crewState.hidden = false;
      if (!all.length) {
        els.crewState.innerHTML = stateBlock(
          'Todavía no hay nadie en cubierta.',
          'Tu nombre puede ser el primero en el manifiesto.',
          '<a class="state-link" href="#embarque">Empezar el embarque</a>'
        );
      } else {
        const label = state.filter === 'vip' ? 'VIP' : 'normales';
        els.crewState.innerHTML = stateBlock(
          `No hay sub-bots ${label} a bordo.`,
          'Prueba con otro filtro o actualiza el manifiesto.',
          '<button type="button" class="state-link" data-filter-reset>Todos los rangos</button>'
        );
      }
      return;
    }

    els.crewState.hidden = true;
    els.crewList.innerHTML = filtered.map(crewRowHTML).join('');
    $$('.crew-photo', els.crewList).forEach((image) => {
      image.addEventListener('error', () => image.classList.add('is-broken'), { once: true });
    });
  }

  async function loadCrew({ manual = false } = {}) {
    if (manual) {
      els.refreshBtn.disabled = true;
      els.refreshBtn.classList.add('is-loading');
    }
    els.crewList.setAttribute('aria-busy', 'true');

    try {
      const data = await api('/api/list');
      state.crew = Array.isArray(data.list) ? data.list : [];
      state.crewLoaded = true;
      els.manifestStats.hidden = false;
      setNetwork('ok', 'Red en línea');
      renderCrew();
      els.updatedAt.textContent = `Actualizado ${timeNow()}`;
    } catch {
      setNetwork('err', 'Sin señal');
      if (!state.crewLoaded) {
        els.crewState.hidden = false;
        els.crewState.innerHTML = stateBlock(
          'No se pudo abrir el manifiesto.',
          'Revisa tu conexión e inténtalo de nuevo.',
          '<button type="button" class="state-link" data-retry-crew>Reintentar</button>'
        );
        els.crewCount.textContent = '—';
        els.heroCrew.textContent = '—';
        els.countAll.textContent = '—';
        els.countVip.textContent = '—';
        els.countNormal.textContent = '—';
        els.manifestStats.hidden = true;
      } else {
        els.updatedAt.textContent = 'Sin conexión · mostrando la última lista';
      }
    } finally {
      els.crewList.removeAttribute('aria-busy');
      els.refreshBtn.disabled = false;
      els.refreshBtn.classList.remove('is-loading');
    }
  }

  $$('.filters button').forEach((button) => {
    button.addEventListener('click', () => setFilter(button.dataset.filter));
  });

  els.refreshBtn.addEventListener('click', () => loadCrew({ manual: true }));

  els.crewState.addEventListener('click', (event) => {
    if (event.target.closest('[data-retry-crew]')) {
      els.crewState.innerHTML = '<p class="is-loading">Pasando lista…</p>';
      loadCrew();
    }
    if (event.target.closest('[data-filter-reset]')) {
      setFilter('all');
    }
  });

  /* ---------- QR connection ---------- */

  function showScan(view) {
    els.scanEmpty.hidden = view !== 'empty';
    els.scanLive.hidden = view !== 'live';
    els.scanDone.hidden = view !== 'done';
  }

  function setFormMessage(message, kind = '') {
    els.formMsg.textContent = message;
    els.formMsg.classList.toggle('is-error', kind === 'error');
    els.formMsg.classList.toggle('is-ok', kind === 'ok');
  }

  function setScanStatus(message, mode = '') {
    els.scanText.textContent = message;
    els.scanStatus.classList.toggle('is-waiting', mode === 'waiting');
    els.scanStatus.classList.toggle('is-ok', mode === 'ok');
  }

  function updateElapsed() {
    const seconds = Math.max(0, Math.floor((Date.now() - state.startedAt) / 1000));
    els.scanElapsed.textContent = `${pad2(Math.floor(seconds / 60))}:${pad2(seconds % 60)}`;
  }

  function stopPolling() {
    if (state.pollQR) clearInterval(state.pollQR);
    if (state.pollStatus) clearInterval(state.pollStatus);
    if (state.elapsedTimer) clearInterval(state.elapsedTimer);
    state.pollQR = null;
    state.pollStatus = null;
    state.elapsedTimer = null;
  }

  function completeConnection(number) {
    if (state.currentNumber !== number) return;
    stopPolling();
    els.scanElapsed.hidden = true;
    showScan('done');
    setScanStatus('A bordo.', 'ok');
    els.scanNote.textContent =
      'Tu barco se reconecta solo si se cae. Ya apareces en el manifiesto.';
    setFormMessage('');
    loadCrew({ manual: true });
  }

  function startPolling(number) {
    stopPolling();
    state.currentNumber = number;
    state.qrSeen = false;
    state.startedAt = Date.now();
    els.scanElapsed.hidden = false;
    els.scanElapsed.textContent = '00:00';
    state.elapsedTimer = setInterval(updateElapsed, 1000);

    const fetchQR = async () => {
      if (state.currentNumber !== number) return;
      try {
        const data = await api(`/api/qr?number=${encodeURIComponent(number)}`);
        if (typeof data.qr === 'string' && data.qr && data.qr !== els.qrImg.getAttribute('src')) {
          els.qrImg.src = data.qr;
        }
        if (data.qr && !state.qrSeen) {
          state.qrSeen = true;
          els.scanElapsed.hidden = false;
          setScanStatus('Esperando escaneo', 'waiting');
          els.scanNote.textContent =
            'WhatsApp → Dispositivos vinculados → Vincular dispositivo. Mantén esta página abierta.';
        }
      } catch {
        /* el sondeo sigue en marcha */
      }
    };

    const checkStatus = async () => {
      if (state.currentNumber !== number) return;
      try {
        const data = await api(`/api/status?number=${encodeURIComponent(number)}`);
        if (data.connected) completeConnection(number);
      } catch {
        /* el sondeo sigue en marcha */
      }
    };

    fetchQR();
    checkStatus();
    state.pollQR = setInterval(fetchQR, 3000);
    state.pollStatus = setInterval(checkStatus, 3000);

    window.setTimeout(() => {
      if (state.currentNumber === number && !state.qrSeen) {
        els.scanNote.textContent =
          'El código está tardando más de lo normal. Si no aparece, genera uno nuevo.';
      }
    }, 22000);
  }

  els.connectForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const number = cleanNumber(els.number.value);
    els.numberField.classList.remove('has-error');
    setFormMessage('');

    if (number.length < 8 || number.length > 15) {
      els.numberField.classList.add('has-error');
      setFormMessage('Revisa el número: incluye el código de país y entre 8 y 15 dígitos.', 'error');
      els.number.focus();
      return;
    }

    stopPolling();
    state.currentNumber = null;
    els.generateBtn.disabled = true;
    els.generateBtn.setAttribute('aria-busy', 'true');
    els.scanElapsed.hidden = true;
    els.qrImg.removeAttribute('src');
    showScan('empty');
    setScanStatus('Preparando el código…', 'waiting');
    els.scanNote.textContent = 'Enseguida tendrás el código listo para escanear.';

    try {
      const data = await api('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number }),
      });
      if (data.error) throw new Error(data.error);

      showScan('live');
      setScanStatus('Esperando escaneo', 'waiting');
      els.scanNote.textContent =
        'Escanea en WhatsApp → Dispositivos vinculados. El código se renueva solo si caduca.';
      setFormMessage('Código generado. Escanéalo desde tu WhatsApp.', 'ok');
      startPolling(number);
    } catch {
      showScan('empty');
      setScanStatus('Sin conexión con la estación.');
      els.scanNote.textContent =
        'El código no pudo generarse. Revisa tu conexión y vuelve a intentarlo.';
      setFormMessage('No se pudo generar el código. Inténtalo de nuevo en unos segundos.', 'error');
    } finally {
      els.generateBtn.disabled = false;
      els.generateBtn.removeAttribute('aria-busy');
    }
  });

  els.qrImg.addEventListener('error', () => {
    if (els.scanLive.hidden) return;
    els.scanNote.textContent =
      'No se pudo mostrar el código. Genera uno nuevo para intentarlo otra vez.';
  });

  /* ---------- Logbook ---------- */

  function renderReviews(data) {
    const reviews = Array.isArray(data.reviews) ? data.reviews : [];
    els.reviewCount.textContent = pad2(reviews.length);

    if (!reviews.length) {
      els.reviews.innerHTML = '';
      els.reviewsState.hidden = false;
      els.reviewsState.innerHTML = stateBlock(
        'La bitácora está en blanco.',
        'Deja la primera entrada y cuéntanos cómo va tu barco.'
      );
      return;
    }

    els.reviewsState.hidden = true;
    els.reviews.innerHTML = reviews.map((review) => {
      const message = escapeHTML(review.message || '').replace(/\n/g, '<br>');
      const reply = review.reply
        ? `<div class="log-reply">
             <span class="log-reply-label">Respuesta del Owner</span>
             <p>${escapeHTML(review.reply).replace(/\n/g, '<br>')}</p>
           </div>`
        : '';

      return `<article class="log-entry">
        <header class="log-who">
          <span class="log-date">${escapeHTML(review.date || 'Sin fecha')}</span>
          <h3 class="log-author">${escapeHTML(review.name || 'Anónimo')}</h3>
        </header>
        <div class="log-body">
          <p class="log-message">${message}</p>
          ${reply}
        </div>
      </article>`;
    }).join('');
  }

  async function loadReviews() {
    try {
      const data = await api('/api/reviews');
      state.reviewsLoaded = true;
      renderReviews(data);
    } catch {
      if (state.reviewsLoaded) return;
      els.reviewsState.hidden = false;
      els.reviewsState.innerHTML = stateBlock(
        'No se pudo abrir la bitácora.',
        'Revisa tu conexión e inténtalo de nuevo.',
        '<button type="button" class="state-link" data-retry-reviews>Reintentar</button>'
      );
      els.reviewCount.textContent = '—';
    }
  }

  function setReviewStatus(message, kind = '') {
    els.reviewMsg.textContent = message;
    els.reviewMsg.classList.toggle('is-error', kind === 'error');
    els.reviewMsg.classList.toggle('is-ok', kind === 'ok');
  }

  els.reviewsState.addEventListener('click', (event) => {
    if (!event.target.closest('[data-retry-reviews]')) return;
    els.reviewsState.innerHTML = '<p class="is-loading">Abriendo la bitácora…</p>';
    loadReviews();
  });

  els.reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = els.revName.value.trim();
    const message = els.revMsg.value.trim();

    if (!message) {
      setReviewStatus('Escribe un mensaje antes de firmar.', 'error');
      els.revMsg.focus();
      return;
    }
    if (message.length > 500) {
      setReviewStatus('La entrada es demasiado larga. Usa menos de 500 caracteres.', 'error');
      return;
    }

    els.reviewBtn.disabled = true;
    setReviewStatus('Firmando la entrada…');

    try {
      await api('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || 'Anónimo', message }),
      });
      els.revMsg.value = '';
      setReviewStatus('Entrada firmada. Ya está en la bitácora.', 'ok');
      await loadReviews();
    } catch {
      setReviewStatus('No se pudo firmar la entrada. Inténtalo de nuevo.', 'error');
    } finally {
      els.reviewBtn.disabled = false;
    }
  });

  /* ---------- Boot ---------- */

  showScan('empty');
  loadCrew();
  loadReviews();

  window.setInterval(() => {
    if (document.visibilityState === 'visible') loadCrew();
  }, 20000);

  window.setInterval(() => {
    if (document.visibilityState === 'visible') loadReviews();
  }, 30000);
})();
