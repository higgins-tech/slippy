/* =========================================================
   SLIPPY — main.js (vanilla)
   ========================================================= */
(() => {
  'use strict';

  /* When true, every placeholder <img> tries to swap itself for the real file
     (data-src, or assets/characters-v2/<id>.png for characters) if it exists.
     Set to false once all real assets are wired directly into the HTML. */
  const AUTO_SWAP_ASSETS = true;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, cls = '', text = '') => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } }
  };
  const SITE_URL = 'https://slippy.club';
  const CA = '0xf0568863195770965a6d8abb0aa87f4314b80320';

  /* ---------- characters ---------- */
  const CHARS = [
    {
      n: 1, id: 'copium', color: '#c9952c', dot: '#f5a300', believes: 'totally fine. the chart is just resting.', quote: "it's fine. it's fine.", line: "it's fine. the chart is just resting.",
      note: 'Session 1: patient insists the chart will go up. Patient has not looked at the chart. Brought own oxygen.'
    },
    {
      n: 2, id: 'cowboy', color: '#8a5a3a', dot: '#b5651d', believes: 'a cowboy. the hat is load-bearing.', quote: 'yeehaw.', line: 'yeehaw. flat. no exclamation.',
      note: "Session 2: patient rode the chaise like a bronco for the full hour. Said 'yeehaw' 41 times. Flat. No exclamation."
    },
    {
      n: 3, id: 'gamer', color: '#c2185b', dot: '#d6338a', believes: 'a pro esports athlete, one match from going pro', quote: 'LETSGOOO / this game is rigged', line: 'LETSGOOO. this game is rigged.',
      note: 'Session 3: patient screamed LETSGOOO at 4:07am. There was no game visible.'
    },
    {
      n: 4, id: 'degen', color: '#2563b8', dot: '#3b82f6', believes: 'retired at 23. from what, unclear.', quote: 'probably nothing', line: 'probably nothing.',
      note: "Session 4: patient said 'probably nothing' 19 times, then bought it. Cannot say what."
    },
    {
      n: 5, id: 'professor', color: '#9ba07e', dot: '#6fcf3a', believes: 'tenured faculty. of what university, do not ask.', quote: 'Actually,', line: "Actually, it's a bit more nuanced.",
      note: "Session 5: patient began 14 sentences with 'Actually,'. Corrected the clock. The clock was fine."
    },
    {
      n: 6, id: 'rich', color: '#2ba3a0', dot: '#19c3c3', believes: 'generational wealth. the wallet is definitely his.', quote: 'We do not check prices.', line: 'we do not check prices.',
      note: 'Session 6: patient arrived in a car nobody saw. Did not check the bill. Tipped in tokens.'
    },
    {
      n: 7, id: 'gym', color: '#4a3a7a', dot: '#7c4dcc', believes: 'a bodybuilder in his bulk phase', quote: 'we go again tomorrow.', line: 'we go again tomorrow.',
      note: "Session 7: patient did 40 reps on the chaise and said 'we go again tomorrow.' It was already tomorrow."
    },
    {
      n: 8, id: 'wagie', color: '#a083d6', dot: '#a98be0', believes: 'assistant manager. of what is happening.', quote: 'welcome to the pit, please check your bags', line: 'management is watching. please check your bags.',
      note: 'Session 8: patient asked if anyone needed a bag checked at the door. There is no door.'
    },
    {
      n: 9, id: 'auntie', color: '#6b4630', dot: '#a8764f', believes: 'everyone\u2019s auntie. he has notes on your portfolio.', quote: 'did you eat?', line: 'did you eat? also, how much did you put in?',
      note: 'Session 9: patient asked whether anyone had eaten. Then asked how much everyone put in. In that order.'
    },
    {
      n: 10, id: 'rager', color: '#c45a12', dot: '#e0442a', believes: 'the only one who has read the chart. he is furious.', quote: 'WHO TOUCHED THE CHART', line: 'WHO TOUCHED THE CHART.',
      note: 'Session 10: patient shed an entire self mid-session. Cause: the chart. Chaise: damaged.'
    },
    {
      n: 11, id: 'robinhood', color: '#58c22a', dot: '#58c22a', believes: 'a hero of the retail chain. nobody has verified this.', quote: 'this is where I rob the whales.', line: 'he has never been photographed. he is out there.', hidden: true,
      note: 'Session 11: patient did not attend. Patient has never attended. One arrow was found in the chaise.'
    },
    {
      n: 12, id: 'rainbow', color: '#b8c4ff', dot: '#b8c4ff', believes: 'everyone, briefly.', quote: 'all your moods are still you.', line: 'all your moods are still you.',
      note: 'Session 12: all patients present. Nobody noticed. The chaise sat very still.'
    }
  ];
  const byId = Object.fromEntries(CHARS.map((c) => [c.id, c]));

  /* ---------- character PNG lookup ---------- */
  const CHAR_PNG = {
    copium: 'img/copiumsnake.png',
    cowboy: 'img/cowboysnake.png',
    gamer: 'img/gamersnake.png',
    degen: 'img/pfpsnake.png',
    professor: 'img/professorsnake.png',
    rich: 'img/richsnake.png',
    gym: 'img/gymsnake.png',
    wagie: 'img/pfpsnake.png',
    auntie: 'img/auntiesnake.png',
    rager: 'img/ragersnake.png',
    robinhood: 'img/robinhoodsnake.png',
    rainbow: 'img/rainbowsnake.png'
  };
  const charPng = (id) => CHAR_PNG[id] || null;
  const SWATCH_LABEL = { robinhood: 'lime' };
  const upper = (s) => s.toUpperCase();

  /* ---------- placeholder art (inline svg, tinted per character) ---------- */
  const shade = (hex, f) => {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * f))));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  };
  const uri = (svg) => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  const coilSVG = (f) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240"><g stroke="#14100b" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="100" cy="198" rx="80" ry="32" fill="${shade(f, .7)}"/><ellipse cx="100" cy="190" rx="78" ry="29" fill="${f}"/><ellipse cx="100" cy="152" rx="58" ry="25" fill="${f}"/><path d="M78 150V70a24 24 0 0 1 48 0v80" fill="${f}"/><ellipse cx="100" cy="62" rx="37" ry="30" fill="${f}"/><path d="M160 152c10-12 8-26 14-34" fill="none" stroke-width="12"/></g><g fill="#14100b"><circle cx="88" cy="56" r="5"/><circle cx="112" cy="56" r="5"/></g><path d="M84 76q16 10 32 0" stroke="#e8628a" stroke-width="8" fill="none" stroke-linecap="round"/><ellipse cx="78" cy="172" rx="30" ry="6" fill="#fff" opacity=".28"/></svg>`;
  const snakeURI = (color) => uri(coilSVG(color));

  /* bigger bodies for the PFP / meme canvases (viewBox 600) */
  const faceSVG = (x, y) => `<g fill="#14100b"><circle cx="${x - 22}" cy="${y - 10}" r="9"/><circle cx="${x + 22}" cy="${y - 10}" r="9"/></g><path d="M${x - 34} ${y + 22}q34 24 68 0" stroke="#e8628a" stroke-width="16" fill="none" stroke-linecap="round"/>`;
  const bodySVG = (pos, f) => {
    const O = '#14100b', d = shade(f, .72), hi = 'rgba(255,255,255,.28)';
    let g;
    if (pos === 'tower') {
      g = `<g stroke="${O}" stroke-width="12" stroke-linejoin="round"><ellipse cx="300" cy="510" rx="170" ry="58" fill="${d}"/><ellipse cx="300" cy="440" rx="150" ry="52" fill="${f}"/><ellipse cx="300" cy="360" rx="128" ry="46" fill="${f}"/><ellipse cx="300" cy="282" rx="104" ry="40" fill="${f}"/><ellipse cx="300" cy="190" rx="88" ry="76" fill="${f}"/></g>${faceSVG(300, 190)}<ellipse cx="236" cy="440" rx="40" ry="8" fill="${hi}"/>`;
    } else if (pos === 'slither') {
      const p = 'M170 480C170 340 300 372 330 440C362 512 470 504 470 392C470 292 400 262 424 168';
      g = `<path d="${p}" stroke="${O}" stroke-width="124" fill="none" stroke-linecap="round"/><path d="${p}" stroke="${f}" stroke-width="100" fill="none" stroke-linecap="round"/><path d="M200 470C200 380 270 380 300 420" stroke="${hi}" stroke-width="14" fill="none" stroke-linecap="round"/><ellipse cx="424" cy="150" rx="66" ry="52" fill="${f}" stroke="${O}" stroke-width="12"/>${faceSVG(424, 150)}`;
    } else {
      g = `<g stroke="${O}" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="300" cy="500" rx="200" ry="70" fill="${d}"/><ellipse cx="300" cy="480" rx="196" ry="64" fill="${f}"/><ellipse cx="300" cy="390" rx="140" ry="54" fill="${f}"/><path d="M236 390V220a64 64 0 0 1 128 0v170" fill="${f}"/><ellipse cx="300" cy="190" rx="92" ry="74" fill="${f}"/><path d="M470 420c28-30 24-64 40-90" fill="none" stroke-width="30"/></g>${faceSVG(300, 190)}<ellipse cx="230" cy="470" rx="70" ry="12" fill="${hi}"/>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">${g}</svg>`;
  };

  /* ---------- asset hydration ---------- */
  function upgrade(img, src) {
    if (!AUTO_SWAP_ASSETS || !src) return;
    const t = new Image();
    t.onload = () => { img.src = src; img.classList.add('is-real'); };
    t.src = src;
  }
  function hydrate(root = document) {
    $$('img[data-char]', root).forEach((img) => {
      const c = byId[img.dataset.char];
      if (!c) return;
      img.src = snakeURI(c.color);
      upgrade(img, img.dataset.src || `assets/characters-v2/${c.id}.png`);
    });
    $$('img[data-src]:not([data-char])', root).forEach((img) => upgrade(img, img.dataset.src));
  }

  /* ---------- toast + copy ---------- */
  const toastEl = $('#toast');
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-show'), 2200);
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = el('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0'; document.body.append(ta); ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      ta.remove();
    }
  }
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    const label = b.textContent;
    await copyText(b.dataset.copy);
    b.textContent = 'copied!';
    toast('copied. paste responsibly.');
    setTimeout(() => { b.textContent = label; }, 1500);
  }));

  /* ---------- dates, daily slippy ---------- */
  const DAY = 864e5;
  const WD = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const MO = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const epochDay = (d) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);
  const ANCHOR = Date.UTC(2026, 0, 1) / DAY;
  const hash = (n) => { n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) | 0; n ^= n >>> 4; n = Math.imul(n, 0x27d4eb2d); n ^= n >>> 15; return n >>> 0; };
  const SEQ = [];
  for (let k = 0; k < 900; k++) {
    let i = hash(ANCHOR + k) % 12;
    if (k && i === SEQ[k - 1]) i = (i + 1 + (hash(ANCHOR + k + 5000) % 11)) % 12;
    SEQ.push(i);
  }
  const slippyOn = (off) => CHARS[SEQ[(((epochDay(today) + off - ANCHOR) % SEQ.length) + SEQ.length) % SEQ.length]];
  const dateOf = (off) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + off);
  const dayN = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / DAY);

  $('#navDate').textContent = `${WD[today.getDay()].toUpperCase()} ${today.getDate()} ${MO[today.getMonth()]}`;
  $$('.dayN').forEach((n) => { n.textContent = dayN; });
  $('#yesterdayName').textContent = slippyOn(-1).id;

  /* ---------- agenda ---------- */
  const agenda = $('#agenda');
  for (let off = -1; off <= 30; off++) {
    const d = dateOf(off), c = slippyOn(off);
    const b = el('button', 'day connect-button');
    b.type = 'button';
    b.dataset.off = off;
    b.style.setProperty('--dot', c.dot);
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', `${WD[d.getDay()]} ${d.getDate()} — wake this day's slippy`);
    if (off === 0) b.classList.add('is-today');
    if (c.hidden) b.classList.add('is-unseen');
    b.innerHTML = `<small>${off === 0 ? 'today' : WD[d.getDay()]}</small><b>${d.getDate()}</b><i></i>`;
    agenda.append(b);
  }

  /* ---------- the tank ---------- */
  const tank = $('#tank'), openBtn = $('#openBtn'), openLabel = $('span', openBtn), hint = $('#tankHint');
  const petWrap = $('#tankPet'), petImg = $('#tankPetImg'), dayTag = $('#tankDay');
  const todayName = $('#todayName'), todayLine = $('#todayLine'), sendBtn = $('#sendBtn');
  let sel = null, wakeT = null;

  function setAgenda(off) {
    $$('.day', agenda).forEach((b) => b.setAttribute('aria-pressed', String(sel !== null && Number(b.dataset.off) === off)));
  }
  function closeTank() {
    clearTimeout(wakeT);
    sel = null;
    tank.classList.remove('is-open', 'is-waking');
    openLabel.textContent = 'open the tank';
    hint.textContent = 'something is asleep in there.';
    dayTag.hidden = true;
    todayName.textContent = '???';
    todayLine.textContent = 'lift the lid to find out.';
    sendBtn.disabled = true;
    setAgenda(null);
  }
  function wake(off) {
    clearTimeout(wakeT);
    sel = off;
    setAgenda(off);
    tank.classList.remove('is-open');
    tank.classList.add('is-waking');
    openLabel.textContent = 'waking one of them up…';
    wakeT = setTimeout(() => {
      const c = slippyOn(off);
      petImg.src = snakeURI(c.color);
      upgrade(petImg, charPng(c.id));
      petWrap.classList.toggle('is-unseen', !!c.hidden);
      tank.classList.remove('is-waking');
      tank.classList.add('is-open');
      openLabel.textContent = 'close the tank';
      dayTag.textContent = `${c.id} day`;
      dayTag.hidden = false;
      todayName.textContent = c.hidden ? '???' : c.id;
      todayLine.textContent = c.line;
      sendBtn.disabled = false;
    }, reduce ? 50 : 1000);
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  openBtn.addEventListener('click', (e) => { e.stopPropagation(); if (tank.classList.contains('is-open')) closeTank(); else wake(0); });
  agenda.addEventListener('click', (e) => {
    const b = e.target.closest('.day');
    if (!b) return;
    const off = Number(b.dataset.off);
    if (sel === off && tank.classList.contains('is-open')) closeTank(); else wake(off);
  });
  $('.tank-glass').addEventListener('click', (e) => {
    if (e.target.closest('button') || tank.classList.contains('is-open')) return;
    tank.classList.remove('is-tapped'); void tank.offsetWidth; tank.classList.add('is-tapped');
    setTimeout(() => tank.classList.remove('is-tapped'), 2200);
  });
  sendBtn.addEventListener('click', () => {
    if (sel === null) return;
    const c = slippyOn(sel);
    const text = c.hidden ? "today's slippy: the one nobody has seen." : `today's slippy: ${c.id}. ${c.line}`;
  });

  /* ---------- nav drawer ---------- */
  const burger = $('#burger'), drawer = $('#drawer'), drawerClose = $('#drawerClose');
  function openDrawer() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
    drawerClose.focus({ preventScroll: true });
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }
  burger.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', () => { closeDrawer(); burger.focus({ preventScroll: true }); });
  drawer.addEventListener('click', (e) => { if (e.target.closest('a')) closeDrawer(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeDrawer(); closeEgg(); } });
  matchMedia('(min-width:1321px)').addEventListener('change', (m) => { if (m.matches) closeDrawer(); });

  /* ---------- sound ---------- */
  let sound = false;
  const soundBtn = $('#soundToggle');
  soundBtn.addEventListener('click', () => {
    sound = !sound;
    soundBtn.textContent = `SOUND: ${sound ? 'ON' : 'OFF'}`;
    soundBtn.setAttribute('aria-pressed', String(sound));
    if (!sound) $$('video').forEach((v) => { v.muted = true; });
    $$('.phone-sound').forEach((b) => { b.textContent = 'SOUND: OFF'; });
  });

  /* ---------- chapter two: the swarm ---------- */
  const WORDS = [
    ['new notification', 50.4, 5, 14, '#8a3b32'], ['ngmi', 47.5, 15.8, 17, '#9a3f35'], ['(99+)', 44.4, 18.8, 14, '#3f7a46'],
    ["she didn't text back", 21.4, 28, 21, '#4a3d93'], ['chart go down', 20.7, 36, 18, '#8a5a2a'], ['one more game', 66.7, 36, 24, '#5d4a85'],
    ['few understand', 76.6, 40, 24, '#3d7a3a'], ['ratio', 28.4, 70.7, 26, '#a1731d'], ['gm', 34.9, 68, 13, '#a1731d'],
    ['yeehaw?', 31.6, 73.9, 21, '#2f5a98'], ['LFG', 64.9, 71, 24, '#5a7a20'], ['wen', 76.9, 70, 21, '#8a2a5a'],
    ['group chat (3am)', 80.9, 79, 19, '#8a2a5a'], ['4:03am', 24.6, 90, 26, '#2a4a8a'], ['chart go up', 53, 93, 14, '#6a4a2a'], ['REPLY ALL', 49, 96, 19, '#1a7a7a']
  ];
  const swarm = $('#swarm');
  WORDS.forEach(([txt, x, y, fs, c], i) => {
    const w = el('span', 'w', txt);
    w.style.cssText = `left:${x}%;top:${y}%;--fs:${fs};--c:${c};--dx:${(Math.random() * 18 - 9).toFixed(1)}px;--dy:${(Math.random() * 18 - 9).toFixed(1)}px;--dur:${(5 + Math.random() * 5).toFixed(1)}s;--delay:-${(Math.random() * 6).toFixed(1)}s`;
    w.setAttribute('aria-hidden', 'true');
    swarm.append(w);
  });

  /* ---------- the session ---------- */
  const session = $('#session');
  const lines = [$('.sl1'), $('.sl2'), $('.sl3')];
  function sessionProgress() {
    const r = session.getBoundingClientRect();
    const total = r.height - innerHeight;
    const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
    const step = innerWidth <= 720 ? 3 : p > .3 ? 3 : p > .08 ? 2 : r.top < innerHeight * .6 ? 1 : 0;
    lines.forEach((l, i) => l.classList.toggle('is-on', i < step));
  }
  let sIdx = 0;
  const note = $('#clipNote'), count = $('#clipCount');
  function showSession(i) {
    sIdx = (i + CHARS.length) % CHARS.length;
    note.classList.add('is-swap');
    setTimeout(() => { note.textContent = CHARS[sIdx].note; note.classList.remove('is-swap'); count.textContent = `session ${sIdx + 1} / 12`; }, reduce ? 0 : 180);
    const cs = $('.chair-snake');
    if (cs) { cs.src = snakeURI(CHARS[sIdx].color); upgrade(cs, charPng(CHARS[sIdx].id)); }
  }
  $('#sPrev').addEventListener('click', () => showSession(sIdx - 1));
  $('#sNext').addEventListener('click', () => showSession(sIdx + 1));
  showSession(0);

  /* evidence tape text */
  $$('.tape-track').forEach((t) => {
    const s = t.dataset.text || '';
    t.innerHTML = Array(2).fill(`<span>${Array(10).fill(s).join('\u00a0\u00a0\u2022\u00a0\u00a0')}\u00a0\u00a0\u2022\u00a0\u00a0</span>`).join('');
  });

  /* tapes: sound pills (one phone at a time) */
  $$('.phone-sound').forEach((b) => b.addEventListener('click', () => {
    const on = b.textContent.trim() !== 'SOUND: ON';
    $$('.phone-sound').forEach((o) => { o.textContent = 'SOUND: OFF'; });
    $$('.screen video').forEach((v) => { v.muted = true; });
    const v = $('video', b.closest('.phone'));
    if (on) { b.textContent = 'SOUND: ON'; if (v) { v.muted = false; v.play().catch(() => { }); } }
  }));
  $$('.screen video').forEach((v) => {
    if (v.dataset.src && AUTO_SWAP_ASSETS) {
      v.addEventListener('loadeddata', () => v.classList.add('is-ready'));
      v.addEventListener('error', () => v.removeAttribute('src'));
      v.src = v.dataset.src;
    } else if (v.getAttribute('src')) {
      /* video has a static src in HTML — mark ready immediately so opacity:0 is lifted */
      v.addEventListener('loadeddata', () => v.classList.add('is-ready'));
      v.addEventListener('error', () => v.classList.add('is-ready')); /* show placeholder bg on error */
      /* if already loaded (cached), mark immediately */
      if (v.readyState >= 2) v.classList.add('is-ready');
    }
  });

  /* ---------- chapter four: personality files ---------- */
  const files = $('#files');
  CHARS.filter((c) => c.n <= 11).forEach((c) => {
    const a = el('article', 'file' + (c.hidden ? ' file--hidden' : ''));
    a.style.setProperty('--dot', c.dot);
    a.innerHTML = `<div class="file-top"><span>personality file</span><b>No.${c.n}</b></div>
    <div class="file-img"><img data-char="${c.id}" alt="${c.hidden ? 'silhouette, never photographed' : c.id + ' slippy'}">${c.hidden ? '<span class="np">never photographed</span>' : ''}</div>
    <h3><i></i>${upper(SWATCH_LABEL[c.id] === 'lime' ? 'robinhood' : c.id)}</h3>
    <p class="b-label">believes he is</p><p class="b-text">${c.believes}</p><hr><p class="quote">"${c.quote}"</p>`;
    files.append(a);
  });
  hydrate(files);
  const cards = $$('.file', files);
  let activeCard = -1, userMoved = false;
  function centerCard(i, smooth = true) {
    const c = cards[i];
    files.scrollTo({ left: c.offsetLeft - (files.clientWidth - c.offsetWidth) / 2, behavior: smooth && !reduce ? 'smooth' : 'auto' });
  }
  function markActive() {
    const mid = files.scrollLeft + files.clientWidth / 2;
    let best = 0, dist = Infinity;
    cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < dist) { dist = d; best = i; } });
    if (best !== activeCard) { activeCard = best; cards.forEach((c, i) => c.classList.toggle('is-active', i === best)); }
  }
  let ticking = false;
  files.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { markActive(); ticking = false; }); } }, { passive: true });
  let drag = null;
  files.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; drag = { x: e.clientX, l: files.scrollLeft }; userMoved = true; });
  addEventListener('pointermove', (e) => { if (!drag) return; files.classList.add('is-drag'); files.scrollLeft = drag.l - (e.clientX - drag.x); });
  addEventListener('pointerup', () => { if (drag) { drag = null; files.classList.remove('is-drag'); centerCard(activeCard); } });
  files.addEventListener('touchstart', () => { userMoved = true; }, { passive: true });
  files.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') centerCard(Math.min(cards.length - 1, activeCard + 1)); if (e.key === 'ArrowLeft') centerCard(Math.max(0, activeCard - 1)); });
  files.tabIndex = 0;
  let inView = false, autoT;
  new IntersectionObserver(([en]) => { inView = en.isIntersecting; }, { threshold: .35 }).observe(files);
  if (!reduce) autoT = setInterval(() => { if (inView && !userMoved) centerCard((activeCard + 1) % cards.length); }, 3600);
  requestAnimationFrame(() => { centerCard(0, false); markActive(); });

  /* ---------- hatchery: PFP creator + meme studio ---------- */
  const OPTS = {
    pos: ['classic', 'slither', 'tower'],
    bg: ['cream', 'navy', 'sunflower', 'teal', 'bubblegum', 'lime', 'lavender', 'ink', 'rainbow-day', 'chart-up'],
    skin: ['none', 'anchor', 'barbed', 'candle', 'gsss', 'momheart', 'ouroboros'],
    back: ['none', 'quiver', 'tank'],
    neck: ['none', 'chain', 'headset', 'pearls'],
    face: ['none', 'horn', 'mask', 'tongue'],
    eyes: ['none', 'goggles', 'nerd', 'reading', 'shades'],
    head: ['none', 'beanie', 'bucket', 'cowboy', 'crown', 'feather', 'party', 'sunhat', 'sweatband', 'visor'],
    held: ['none', 'buybutton', 'champagne', 'coins', 'controller', 'cup', 'phone']
  };
  const GROUPS = [['pos', '0 · position'], ['who', '1 · who woke up'], ['bg', '2 · background'], ['skin', '· skin'], ['back', '· back'], ['neck', '· neck'], ['face', '· face'], ['eyes', '· eyes'], ['head', '· headwear'], ['held', '· held']];
  const LAYER_ORDER = ['back', 'skin', 'neck', 'face', 'eyes', 'head', 'held'];
  const BG_FILL = { cream: '#f5e9d3', navy: '#14213d', sunflower: '#f7b500', teal: '#1fa6a0', bubblegum: '#ff9ecb', lime: '#8fe04b', lavender: '#b7a3ea', ink: '#14100b', 'rainbow-day': null, 'chart-up': '#0e1628' };
  const HELD_ADJ = { buybutton: 'BUY-THE-DIP', champagne: 'CELEBRATING', coins: 'LOADED', controller: 'GAMING', cup: 'CAFFEINATED', phone: 'CHRONICALLY ONLINE' };
  const HEAD_ADJ = { beanie: 'COZY', bucket: 'BUCKET-HATTED', cowboy: 'RODEO', crown: 'ROYAL', feather: 'OUTLAW', party: 'FESTIVE', sunhat: 'VACATIONING', sweatband: 'SWEATY', visor: 'SPORTY' };

  function buildGroup(parent, key, label, values, state, onChange) {
    const isSw = key === 'who';
    const g = el('div', 'opt-group');
    g.append(el('h3', 'opt-h', label));
    const list = el('div', isSw ? 'sw-grid' : 'chips');
    values.forEach((v) => {
      const id = isSw ? v.id : v;
      const b = el('button', (isSw ? 'sw' : 'chip') + ' connect-button');
      b.type = 'button';
      b.dataset.v = id;
      if (isSw) { b.style.setProperty('--c', v.color); b.append(el('span', '', SWATCH_LABEL[id] || id)); b.setAttribute('aria-label', SWATCH_LABEL[id] || id); }
      else b.textContent = id;
      b.addEventListener('click', () => { state[key] = id; g.sync(); onChange(key); });
      list.append(b);
    });
    g.append(list);
    g.sync = () => $$('button', list).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === state[key])));
    g.sync();
    parent.append(g);
    return g;
  }

  /* canvas helpers */
  function paintBg(g, bg, size) {
    if (bg === 'rainbow-day') {
      const gr = g.createLinearGradient(0, 0, size, size);
      ['#ff7bc8', '#ffb04a', '#c7d857', '#5fe085', '#5fb8f0', '#a99bea'].forEach((c, i, a) => gr.addColorStop(i / (a.length - 1), c));
      g.fillStyle = gr;
    } else g.fillStyle = BG_FILL[bg] || '#f5e9d3';
    g.fillRect(0, 0, size, size);
    if (bg === 'chart-up') {
      g.strokeStyle = '#1b8f55'; g.lineWidth = size * .0046;
      [[24, 507, 24, 77], [81, 530, 25, 60], [252, 399, 24, 42], [366, 312, 24, 47], [596, 170, 24, 60]].forEach(([x, y, w, h]) => g.strokeRect(x / 650 * size, y / 650 * size, w / 650 * size, h / 650 * size));
    }
  }
  const loadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  function saveCanvas(cv, name) {
    cv.toBlob((b) => {
      const a = el('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, 'image/png');
  }
  const shareX = (text) => window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(SITE_URL)}`, '_blank', 'noopener');

  /* --- PFP --- */
  const P = { pos: 'slither', who: 'degen', bg: 'chart-up', skin: 'none', back: 'none', neck: 'none', face: 'none', eyes: 'shades', head: 'none', held: 'controller' };
  const pfpStage = $('#pfpStage'), pfpBody = $('.pfp-body', pfpStage), pfpGroups = [];
  const layerEls = {};
  LAYER_ORDER.forEach((k) => {
    const i = el('img', 'pfp-layer is-missing');
    i.alt = ''; i.dataset.layer = k;
    i.addEventListener('load', () => i.classList.remove('is-missing'));
    i.addEventListener('error', () => i.classList.add('is-missing'));
    layerEls[k] = i; pfpStage.append(i);
  });
  function renderPFP() {
    pfpStage.dataset.bg = P.bg;
    pfpBody.innerHTML = bodySVG(P.pos, byId[P.who].color);
    LAYER_ORDER.forEach((k) => {
      const i = layerEls[k];
      if (P[k] === 'none') { i.removeAttribute('src'); i.classList.add('is-missing'); return; }
      i.classList.add('is-missing');
      i.src = `assets/pfp/${k}/${P[k]}.png`;
    });
    const adj = HELD_ADJ[P.held] || HEAD_ADJ[P.head] || 'PLAIN';
    $('#pfpTitle').textContent = `${adj} ${upper(P.who === 'robinhood' ? 'robinhood' : P.who)}`;
  }
  GROUPS.forEach(([k, label]) => pfpGroups.push(buildGroup($('#pfpOptions'), k, label, k === 'who' ? CHARS : OPTS[k], P, renderPFP)));
  renderPFP();
  $('#pfpWake').addEventListener('click', () => {
    Object.keys(OPTS).forEach((k) => {
      const pool = OPTS[k];
      P[k] = (k === 'pos' || k === 'bg') ? rand(pool) : (Math.random() < .35 ? 'none' : rand(pool));
    });
    P.who = rand(CHARS).id;
    pfpGroups.forEach((g) => g.sync());
    renderPFP();
  });
  $('#pfpDownload').addEventListener('click', async () => {
    const size = 1080, cv = el('canvas'); cv.width = cv.height = size;
    const g = cv.getContext('2d');
    paintBg(g, P.bg, size);
    const body = await loadImg(uri(bodySVG(P.pos, byId[P.who].color)));
    if (body) g.drawImage(body, 0, 0, size, size);
    LAYER_ORDER.forEach((k) => { const i = layerEls[k]; if (i.complete && i.naturalWidth && !i.classList.contains('is-missing')) g.drawImage(i, 0, 0, size, size); });
    if ($('#pfpWm').checked) { g.font = '800 34px Nunito, sans-serif'; g.fillStyle = 'rgba(255,255,255,.88)'; g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 5; g.textAlign = 'right'; g.strokeText('slippy.club', size - 36, size - 34); g.fillText('slippy.club', size - 36, size - 34); }
    saveCanvas(cv, `slippy-${P.who}.png`);
  });
  $('#pfpShare').addEventListener('click', () => shareX(`I woke up ${$('#pfpTitle').textContent.toLowerCase()} today. build yours:`));

  /* --- meme studio --- */
  const CAPTIONS = ['probably nothing', 'we go again tomorrow', 'we do not check prices', 'it\u2019s fine. it\u2019s fine.', 'WHO TOUCHED THE CHART', 'Actually,', 'still no arms', 'yeehaw. flat.'];
  const M = { who: 'copium', bg: 'navy', top: 'probably', bottom: 'nothing' };
  const memeStage = $('#memeStage'), memeGroups = [];
  function renderMeme() {
    memeStage.dataset.bg = M.bg;
    const mSnake = $('.meme-snake', memeStage);
    mSnake.src = snakeURI(byId[M.who].color);
    upgrade(mSnake, charPng(M.who));
    $('.meme-text.top', memeStage).textContent = M.top;
    $('.meme-text.bottom', memeStage).textContent = M.bottom;
  }
  const memeOpts = $('#memeOptions');
  memeGroups.push(buildGroup(memeOpts, 'who', '1 · who woke up', CHARS, M, renderMeme));
  memeGroups.push(buildGroup(memeOpts, 'bg', '2 · background', OPTS.bg, M, renderMeme));
  [['top', '· top text'], ['bottom', '· bottom text']].forEach(([k, label]) => {
    const g = el('div', 'opt-group'); g.append(el('h3', 'opt-h', label));
    const f = el('input', 'field'); f.type = 'text'; f.maxLength = 40; f.value = M[k]; f.setAttribute('aria-label', label.replace('· ', ''));
    f.addEventListener('input', () => { M[k] = f.value; renderMeme(); });
    g.append(f); memeOpts.append(g); g.input = f; memeGroups.push(g);
  });
  renderMeme();
  $('#memeWake').addEventListener('click', () => {
    M.who = rand(CHARS).id; M.bg = rand(OPTS.bg);
    const cap = rand(CAPTIONS).split(' ');
    const mid = Math.ceil(cap.length / 2);
    M.top = cap.slice(0, mid).join(' '); M.bottom = cap.slice(mid).join(' ');
    memeGroups.forEach((g) => { if (g.sync) g.sync(); if (g.input) g.input.value = M[g.input.getAttribute('aria-label').startsWith('top') ? 'top' : 'bottom']; });
    renderMeme();
  });
  $('#memeDownload').addEventListener('click', async () => {
    const size = 1080, cv = el('canvas'); cv.width = cv.height = size;
    const g = cv.getContext('2d');
    try { await document.fonts.load('400 90px "Bagel Fat One"'); } catch { /* font optional */ }
    paintBg(g, M.bg, size);
    const body = await loadImg(uri(bodySVG('classic', byId[M.who].color)));
    if (body) g.drawImage(body, size * .19, size * .19, size * .62, size * .62);
    g.textAlign = 'center'; g.textBaseline = 'top'; g.lineJoin = 'round'; g.font = '400 96px "Bagel Fat One", Impact, sans-serif';
    const draw = (txt, y) => { const t = txt.toUpperCase(); g.lineWidth = 16; g.strokeStyle = '#14100b'; g.strokeText(t, size / 2, y, size * .9); g.fillStyle = '#fff'; g.fillText(t, size / 2, y, size * .9); };
    draw(M.top, 44); draw(M.bottom, size - 150);
    if ($('#memeWm').checked) { g.font = '800 30px Nunito, sans-serif'; g.textAlign = 'right'; g.fillStyle = 'rgba(255,255,255,.88)'; g.fillText('slippy.club', size - 30, size - 52); }
    saveCanvas(cv, 'slippy-meme.png');
  });
  $('#memeShare').addEventListener('click', () => shareX(`${M.top} ${M.bottom}`.trim()));

  /* tabs */
  const tabs = $$('.tab');
  function setTab(name) {
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === name)));
    $('#panel-pfp').hidden = name !== 'pfp';
    $('#panel-meme').hidden = name !== 'meme';
  }
  tabs.forEach((t) => t.addEventListener('click', () => setTab(t.dataset.tab)));
  $$('[data-tab-link]').forEach((a) => a.addEventListener('click', () => setTab(a.dataset.tabLink)));

  /* ---------- egg modal ---------- */
  const eggBtn = $('#eggBtn'), eggModal = $('#eggModal'), originVid = $('#originVideo'), originPlay = $('#originPlay'), originTime = $('#originTime');
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  function openEgg() { eggModal.hidden = false; document.body.classList.add('no-scroll'); $('.modal-close', eggModal).focus({ preventScroll: true }); }
  function closeEgg() {
    if (eggModal.hidden) return;
    eggModal.hidden = true; document.body.classList.remove('no-scroll'); originVid.pause(); originPlay.textContent = '▶'; eggBtn.focus({ preventScroll: true });
  }
  eggBtn.addEventListener('click', openEgg);
  eggModal.addEventListener('click', (e) => { if (e.target === eggModal || e.target.closest('.modal-close')) closeEgg(); });
  if (originVid.dataset.src && AUTO_SWAP_ASSETS) {
    originVid.addEventListener('loadeddata', () => originVid.classList.add('is-ready'));
    originVid.addEventListener('error', () => originVid.removeAttribute('src'));
    originVid.src = originVid.dataset.src;
  }
  originPlay.addEventListener('click', () => {
    if (!originVid.getAttribute('src')) { toast('video coming soon.'); return; }
    if (originVid.paused) { originVid.play().catch(() => { }); originPlay.textContent = '❚❚'; } else { originVid.pause(); originPlay.textContent = '▶'; }
  });
  originVid.addEventListener('timeupdate', () => { originTime.textContent = `${fmt(originVid.currentTime)} / ${fmt(originVid.duration || 0)}`; });
  originVid.addEventListener('ended', () => { originPlay.textContent = '▶'; });

  /* ---------- cookie notice ---------- */
  const cookie = $('#cookie');
  if (store.get('slippy-cookie')) cookie.hidden = true;
  $('#cookieOk').addEventListener('click', () => { cookie.hidden = true; store.set('slippy-cookie', '1'); });

  /* ---------- boot ---------- */
  hydrate();
  addEventListener('scroll', sessionProgress, { passive: true });
  addEventListener('resize', sessionProgress);
  sessionProgress();
})();
