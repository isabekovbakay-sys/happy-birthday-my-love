(() => {
  const C = window.CONFIG;
  const $ = (s) => document.querySelector(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = innerWidth, H = innerHeight;

  function fitCanvas(cv) {
    cv.width = W * DPR; cv.height = H * DPR;
    const ctx = cv.getContext('2d');
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return ctx;
  }

  // ================= МУЗЫКА =================
  const musicBtn = $('#music');
  const audio = new Audio(C.music);
  audio.loop = true;
  audio.addEventListener('error', () => musicBtn.classList.add('off'));
  function playMusic() {
    audio.play().then(() => musicBtn.classList.add('playing')).catch(() => {});
  }
  musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audio.paused) playMusic();
    else { audio.pause(); musicBtn.classList.remove('playing'); }
  });

  // ================= ЗВЁЗДЫ =================
  const starsCv = $('#stars');
  let sctx = fitCanvas(starsCv);
  let stars = [];
  function makeStars() {
    const n = Math.round((W * H) / 4500);
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.3 + 0.3,
      p: Math.random() * Math.PI * 2,
      s: Math.random() * 0.02 + 0.005,
      v: Math.random() * 0.08 + 0.01,
    }));
  }
  makeStars();
  let starsOn = false;
  function drawStars() {
    if (starsOn) {
      sctx.fillStyle = '#070512';
      sctx.fillRect(0, 0, W, H);
      const g = sctx.createRadialGradient(W / 2, H * 0.55, 0, W / 2, H * 0.55, Math.max(W, H) * 0.45);
      g.addColorStop(0, 'rgba(70,60,110,0.22)');
      g.addColorStop(1, 'rgba(7,5,18,0)');
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, W, H);
      for (const s of stars) {
        s.p += s.s; s.y -= s.v;
        if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W; }
        sctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(s.p));
        sctx.fillStyle = '#fff';
        sctx.beginPath(); sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); sctx.fill();
      }
      sctx.globalAlpha = 1;
    }
    requestAnimationFrame(drawStars);
  }
  requestAnimationFrame(drawStars);

  // ================= МАТРИЦА =================
  const mCv = $('#matrix');
  let mctx = fitCanvas(mCv);
  const CHARS = 'HAPPYBIRTHDAY0123456789♥';
  const FS = 15;
  let drops = [];
  const resetDrops = () => { drops = Array.from({ length: Math.ceil(W / FS) }, () => Math.random() * -H / FS); };
  resetDrops();
  let matrixTimer = null;
  function matrixStep() {
    mctx.fillStyle = 'rgba(7,5,18,0.12)';
    mctx.fillRect(0, 0, W, H);
    mctx.font = `bold ${FS}px monospace`;
    for (let i = 0; i < drops.length; i++) {
      const ch = CHARS[(Math.random() * CHARS.length) | 0];
      const y = drops[i] * FS;
      mctx.fillStyle = Math.random() > 0.96 ? '#ffd1ec' : '#ff2fa0';
      mctx.fillText(ch, i * FS, y);
      if (y > H && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 1;
    }
  }

  // ================= ТЕКСТ ИЗ ЧАСТИЦ =================
  const pCv = $('#particles');
  let pctx = fitCanvas(pCv);
  const P_COUNT = W < 700 ? 2200 : 3800;
  const parts = Array.from({ length: P_COUNT }, () => ({
    x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, tx: W / 2, ty: H / 2,
  }));
  let partsOn = false, partsAlpha = 1;

  function targetsFor(text) {
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const c = off.getContext('2d');
    c.fillStyle = '#fff';
    if (text === '♥') {
      const s = Math.min(W, H) * 0.017;
      c.save(); c.translate(W / 2, H / 2 + s * 2);
      c.beginPath();
      for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.02) {
        const x = 16 * Math.sin(t) ** 3;
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        c.lineTo(x * s, y * s);
      }
      c.fill(); c.restore();
    } else {
      let size = Math.min(H * 0.32, W * 0.3);
      c.font = `900 ${size}px Montserrat, 'Arial Black', sans-serif`;
      const w = c.measureText(text).width;
      if (w > W * 0.82) { size *= (W * 0.82) / w; c.font = `900 ${size}px Montserrat, 'Arial Black', sans-serif`; }
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(text, W / 2, H / 2);
    }
    const data = c.getImageData(0, 0, W, H).data;
    const gap = W < 700 ? 3 : 4;
    const pts = [];
    for (let y = 0; y < H; y += gap)
      for (let x = 0; x < W; x += gap)
        if (data[(y * W + x) * 4 + 3] > 128) pts.push([x, y]);
    for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    return pts;
  }

  function morphTo(text) {
    const pts = targetsFor(text);
    if (!pts.length) return;
    parts.forEach((p, i) => {
      const t = pts[i % pts.length];
      p.tx = t[0] + (Math.random() - 0.5) * 1.5;
      p.ty = t[1] + (Math.random() - 0.5) * 1.5;
      p.vx += (Math.random() - 0.5) * 8;
      p.vy += (Math.random() - 0.5) * 8;
    });
  }

  function drawParticles() {
    if (!partsOn) return;
    pctx.clearRect(0, 0, W, H);
    pctx.globalAlpha = partsAlpha;
    pctx.fillStyle = '#ff6ad0';
    for (const p of parts) {
      p.vx = (p.vx + (p.tx - p.x) * 0.03) * 0.82;
      p.vy = (p.vy + (p.ty - p.y) * 0.03) * 0.82;
      p.x += p.vx; p.y += p.vy;
      pctx.fillRect(p.x - 1.6, p.y - 1.6, 3.2, 3.2);
    }
    requestAnimationFrame(drawParticles);
  }

  // ================= ЛЕТАЮЩИЕ СЕРДЕЧКИ =================
  const heartsLayer = $('#hearts-layer');
  let heartsTimer = null;
  function spawnHeart() {
    const h = document.createElement('span');
    h.className = 'float-heart';
    h.textContent = '♥';
    h.style.left = Math.random() * 100 + 'vw';
    h.style.fontSize = 8 + Math.random() * 10 + 'px';
    h.style.setProperty('--dx', (Math.random() - 0.5) * 120 + 'px');
    h.style.animationDuration = 7 + Math.random() * 6 + 's';
    if (Math.random() > 0.5) h.style.color = '#ff7eb6';
    heartsLayer.appendChild(h);
    h.addEventListener('animationend', () => h.remove());
  }

  // ================= КОТИК: свечи-буквы =================
  (function buildCandles() {
    const g = $('.candles');
    const colors = ['#ffd23f', '#ff6fa8', '#5ec8ff', '#7be07b', '#ff9a3c', '#c48bff'];
    const rows = [['HAPPY', 40], ['BIRTHDAY', 80]];
    let k = 0;
    let svg = '';
    for (const [word, y] of rows) {
      const step = word.length > 5 ? 22 : 24;
      const x0 = 110 - ((word.length - 1) * step) / 2;
      [...word].forEach((ch, i) => {
        const x = x0 + i * step;
        const yy = y + Math.sin((i / (word.length - 1)) * Math.PI) * -6;
        const col = colors[k++ % colors.length];
        svg += `<rect x="${x - 1.5}" y="${yy - 30}" width="3" height="10" rx="1" fill="#fff" stroke="#3a2b2b" stroke-width=".8"/>`;
        svg += `<path class="flame" style="animation-delay:${(i * 0.07).toFixed(2)}s" d="M${x} ${yy - 42} q5 7 0 11 q-5 -4 0 -11z" fill="#ffb627"/>`;
        svg += `<text class="letter" x="${x}" y="${yy}" text-anchor="middle" font-size="24" fill="${col}">${ch}</text>`;
      });
    }
    g.innerHTML = svg;
  })();

  // ================= КНИГА =================
  const book = $('#book');
  const msgBox = $('#message');
  const msgText = $('#message-text');
  const hint = $('#hint');

  const coverSVG = `
    <svg viewBox="0 0 100 70" fill="none" stroke="#c9a9a0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M50 30 C42 22 34 26 38 33 C41 38 50 44 50 44 C50 44 59 38 62 33 C66 26 58 22 50 30Z" fill="#f2697a" stroke="#d94d60"/>
      <path d="M6 66 C10 56 18 48 28 46 C33 45 37 47 41 50 M28 46 C26 41 29 38 33 40 L44 47 M33 40 C33 35 37 34 40 37 L46 44 M41 50 C45 52 48 51 49 48"/>
      <path d="M94 66 C90 56 82 48 72 46 C67 45 63 47 59 50 M72 46 C74 41 71 38 67 40 L56 47 M67 40 C67 35 63 34 60 37 L54 44 M59 50 C55 52 52 51 51 48"/>
    </svg>`;

  const faces = [{ cover: true }, ...C.photos.map((src) => ({ src }))];
  if (faces.length % 2) faces.push({ blank: true });
  const leaves = [];
  const faceHTML = (f) =>
    f.cover ? `<div class="cover">${coverSVG}</div>` :
    f.blank ? '' : `<img src="${f.src}" alt="" draggable="false">`;

  for (let i = 0; i < faces.length; i += 2) {
    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    leaf.innerHTML =
      `<div class="face front ${faces[i].cover ? 'cover-face' : ''}">${faceHTML(faces[i])}</div>` +
      `<div class="face back">${faceHTML(faces[i + 1])}</div>`;
    leaves.push(leaf);
  }
  const base = document.createElement('div');
  base.className = 'base-page';
  base.textContent = C.lastPage;
  book.appendChild(base);
  leaves.forEach((l) => book.appendChild(l));

  const L = leaves.length;
  let flipped = 0, busy = false, bookActive = false;
  function setZ() {
    leaves.forEach((l, i) => { l.style.zIndex = i < flipped ? i + 1 : L - i + 1; });
  }
  setZ();
  leaves.forEach((l) => (l.style.transform = 'perspective(2200px) rotateY(0deg)'));

  let typeTimer = null;
  function typeMessage(text) {
    clearInterval(typeTimer);
    msgBox.classList.remove('done');
    msgText.textContent = '';
    const chars = [...text];
    let i = 0;
    typeTimer = setInterval(() => {
      msgText.textContent += chars[i++];
      if (i >= chars.length) { clearInterval(typeTimer); msgBox.classList.add('done'); }
    }, 55);
  }

  async function flip(dir) {
    if (busy) return;
    if (dir > 0 && flipped >= L) return endBook();
    if (dir < 0 && flipped <= 1) return;
    busy = true;
    const idx = dir > 0 ? flipped : flipped - 1;
    const leaf = leaves[idx];
    leaf.style.zIndex = 100;
    leaf.style.transform = `perspective(2200px) rotateY(${dir > 0 ? -180 : 0}deg)`;
    if (flipped === 0) {
      book.classList.add('open');
      hint.textContent = 'tap to turn the page';
      setTimeout(() => msgBox.classList.add('show'), 500);
    }
    flipped += dir;
    setTimeout(() => typeMessage(C.messages[(flipped - 1) % C.messages.length] || ''), flipped === 1 ? 900 : 300);
    await sleep(1000);
    setZ();
    busy = false;
  }

  book.addEventListener('click', (e) => {
    if (!bookActive) return;
    // левая половина открытой книги — назад, правая — вперёд
    const r = book.getBoundingClientRect();
    const back = flipped > 0 && e.clientX < r.left + r.width / 2;
    flip(back ? -1 : 1);
  });

  let sparkTimer = null;
  function sparkle() {
    if (flipped === 0) return;
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 70 + '%';
    s.style.zIndex = 200;
    book.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }

  async function endBook() {
    if (busy) return;
    busy = true; bookActive = false;
    clearInterval(typeTimer); clearInterval(sparkTimer);
    msgBox.classList.remove('show');
    hint.classList.add('off');
    book.classList.add('vanish');
    await sleep(1300);
    $('#scene-book').classList.add('hidden');
    await sleep(600);
    $('#scene-book').classList.add('gone');
    showHeart();
  }

  // ================= СЕРДЦЕ ИЗ ФОТО =================
  const heart3d = $('#heart3d');
  const lightbox = $('#lightbox');
  function showHeart() {
    const scene = $('#scene-heart');
    scene.classList.remove('hidden');
    const size = Math.min(W * 0.82, H * 0.68);
    const ts = size * (W < 600 ? 0.15 : 0.13);
    heart3d.style.setProperty('--ts', ts + 'px');
    const N = 32;
    const k = size / 34;
    const tiles = [];
    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2;
      const x = 16 * Math.sin(t) ** 3 * k;
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * k - 2.5 * k;
      const z = (Math.random() - 0.5) * 90;
      const src = C.photos[i % C.photos.length];
      const el = document.createElement('div');
      el.className = 'tile';
      el.innerHTML = `<img src="${src}" alt="" draggable="false">`;
      el.addEventListener('click', () => {
        lightbox.querySelector('img').src = src;
        lightbox.classList.add('show');
      });
      heart3d.appendChild(el);
      tiles.push({ el, x, y, z, r: (Math.random() - 0.5) * 16 });
    }
    // сначала стопка в центре, потом разлетаются в сердце
    requestAnimationFrame(() => tiles.forEach((t) => {
      t.el.style.opacity = 1;
      t.el.style.transform = `translate3d(0,0,${t.z}px) scale(.7) rotate(${t.r}deg)`;
    }));
    setTimeout(() => tiles.forEach((t, i) => setTimeout(() => {
      t.el.style.transform = `translate3d(${t.x}px,${t.y}px,${t.z}px) rotate(${t.r / 2}deg)`;
    }, i * 55)), 1100);
  }
  lightbox.addEventListener('click', () => lightbox.classList.remove('show'));
  $('#replay').addEventListener('click', () => location.reload());

  // ================= СЦЕНАРИЙ =================
  async function run() {
    // 1. матрица + отсчёт
    matrixTimer = setInterval(matrixStep, 40);
    await sleep(1400);
    partsOn = true; drawParticles();
    const words = ['3', '2', '1', ...C.words];
    for (const w of words) {
      morphTo(w);
      await sleep(w === '♥' ? 2200 : w.length > 2 ? 1700 : 1150);
    }
    // рассыпаем частицы и гасим матрицу
    parts.forEach((p) => { p.tx = Math.random() * W; p.ty = Math.random() * H; });
    starsOn = true; starsCv.classList.add('on');
    $('#scene-matrix').classList.add('hidden');
    await sleep(1100);
    clearInterval(matrixTimer); partsOn = false;
    $('#scene-matrix').classList.add('gone');

    // 2. котик
    heartsTimer = setInterval(spawnHeart, 900);
    $('#scene-cat').classList.remove('hidden');
    await sleep(4800);
    $('#scene-cat').classList.add('hidden');
    await sleep(1000);
    $('#scene-cat').classList.add('gone');

    // 3. открытка
    $('#scene-book').classList.remove('hidden');
    bookActive = true;
    sparkTimer = setInterval(sparkle, 350);
  }

  $('#start').addEventListener('click', async () => {
    playMusic();
    $('#start').classList.add('out');
    try { await document.fonts.load("900 40px Montserrat"); } catch (e) {}
    await sleep(600);
    run();
  }, { once: true });

  addEventListener('resize', () => {
    W = innerWidth; H = innerHeight;
    sctx = fitCanvas(starsCv); mctx = fitCanvas(mCv); pctx = fitCanvas(pCv);
    makeStars(); resetDrops();
  });
})();
