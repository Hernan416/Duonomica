const STORAGE_KEY = 'duonomica_state_v1';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function defaultState() {
  return { xp: 0, streak: 0, lastActiveDate: null, lessons: {}, readModules: {}, solvedQuickChecks: {}, companyCapital: INITIAL_COMPANY_CAPITAL };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) {
    return defaultState();
  }
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

function isLessonUnlocked(idx) {
  if (idx === 0) return true;
  const lvl = SIM_LEVELS[idx];
  const prev = SIM_LEVELS[idx - 1];
  const prevDone = !!(state.lessons[prev.id] && state.lessons[prev.id].completed);
  if (!prevDone) return false;
  if (lvl && lvl.isBoss) {
    return (state.companyCapital || 0) >= BOSS_MIN_CAPITAL;
  }
  return true;
}

function starsForMistakes(mistakes) {
  if (mistakes === 0) return 3;
  if (mistakes === 1) return 2;
  return 1;
}

function registerStreak() {
  const today = todayStr();
  if (state.lastActiveDate === today) return false;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = y.toISOString().slice(0, 10);
  state.streak = state.lastActiveDate === yesterday ? state.streak + 1 : 1;
  state.lastActiveDate = today;
  return true;
}

function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

let toastTimer = null;
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = el('div', 'toast');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

const state = loadState();
const root = document.getElementById('app');
let session = null;
let activeTab = 'learn';
let learnFilter = 'all';
let activeModuleId = null;
let activeModuleStep = 0;

/* ===================== HOME / NAVIGATION ===================== */

function econingLogoSVG() {
  return (
    '<svg class="econing-logo-svg" viewBox="0 0 40 40" width="36" height="36" aria-hidden="true">' +
    '<defs>' +
    '<linearGradient id="ecGrad" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#4F46E5" />' +
    '<stop offset="100%" stop-color="#0D9488" />' +
    '</linearGradient>' +
    '</defs>' +
    '<rect x="1" y="1" width="38" height="38" rx="11" fill="url(#ecGrad)" />' +
    '<rect x="1.5" y="1.5" width="37" height="37" rx="10.5" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1" />' +
    '<path d="M10 27 L17 20 L22 23.5 L29.5 13.5" fill="none" stroke="#FFFFFF" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" />' +
    '<path d="M25.5 13.5 H29.5 V17.5" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />' +
    '<circle cx="17" cy="20" r="2.1" fill="#A5B4FC" />' +
    '<circle cx="29.5" cy="13.5" r="2.6" fill="#F59E0B" />' +
    '</svg>'
  );
}

function renderHeader() {
  const readCount = STUDY_MODULES.filter((m) => state.readModules && state.readModules[m.id]).length;

  const shell = el('div', 'island-header-wrap');
  const header = el('header', 'app-header');

  const brand = el('div', 'brand');
  brand.innerHTML = econingLogoSVG() + '<div class="brand-text"><span>Econing</span><small>Ing. Económica</small></div>';

  const nav = el('nav', 'main-nav');
  nav.setAttribute('aria-label', 'Secciones principales');

  const learnBtn = el('button', 'main-nav-btn' + (activeTab === 'learn' ? ' active' : ''));
  learnBtn.innerHTML = '<span>Aprender</span><span class="nav-badge">' + readCount + '/' + STUDY_MODULES.length + '</span>';
  learnBtn.addEventListener('click', () => {
    activeTab = 'learn';
    activeModuleId = null;
    renderHome();
  });

  const practiceBtn = el('button', 'main-nav-btn' + (activeTab === 'practice' ? ' active' : ''));
  practiceBtn.innerHTML = '<span>Practicar</span>';
  practiceBtn.addEventListener('click', () => {
    activeTab = 'practice';
    activeModuleId = null;
    renderHome();
  });

  nav.appendChild(learnBtn);
  nav.appendChild(practiceBtn);

  const stats = el('div', 'stat-pills');
  stats.innerHTML =
    '<div class="stat-pill xp"><span class="emoji">✦</span><span>' + state.xp + '</span><small>XP</small></div>' +
    '<div class="stat-pill streak"><span class="emoji">🔥</span><span>' + state.streak + '</span></div>';

  header.appendChild(brand);
  header.appendChild(nav);
  header.appendChild(stats);
  shell.appendChild(header);
  root.appendChild(shell);
}

function renderHome() {
  root.innerHTML = '';
  if (activeTab === 'learn' && activeModuleId) {
    const mod = STUDY_MODULES.find((m) => m.id === activeModuleId);
    if (mod) {
      renderModuleReader(mod);
      return;
    }
    activeModuleId = null;
  }

  renderHeader();

  if (activeTab === 'learn') {
    renderLearn();
    return;
  }

  const path = el('main', 'path-screen');

  const completedCount = SIM_LEVELS.filter((l) => state.lessons[l.id] && state.lessons[l.id].completed).length;
  const practicePct = Math.round((completedCount / SIM_LEVELS.length) * 100);
  const rankNames = [
    'Startup Inicial', 'Empresa en Crecimiento', 'PyME Sólida', 'Escala Regional',
    'Capital Eficiente', 'Tesorería Pro', 'Gestor de Tasas', 'Control de Costos',
    'Manufactura Rentable', 'Holding Evaluador', 'Grupo Inversionista', '👑 Imperio CFO',
  ];
  const currentRank = rankNames[Math.min(completedCount, rankNames.length - 1)];
  const currentCapital = state.companyCapital !== undefined ? state.companyCapital : INITIAL_COMPANY_CAPITAL;

  const hero = el('section', 'learn-hero practice-hero');
  hero.innerHTML =
    '<div class="learn-hero-top">' +
    '<div><div class="learn-kicker">Modo Simulación · ' + currentRank + '</div><h1>Camino al Boss Final</h1></div>' +
    '<div class="learn-pct">💰 $' + fmt(currentCapital, 0) + '</div>' +
    '</div>' +
    '<p class="learn-hero-desc">El capital de tu empresa sube o baja con cada decisión. Reúne al menos <strong>$' + fmt(BOSS_MIN_CAPITAL, 0) + '</strong> para desbloquear el Boss Final.</p>' +
    '<div class="learn-progress-track"><div class="learn-progress-fill" style="width:' + practicePct + '%"></div></div>';
  path.appendChild(hero);

  TEMAS.forEach((tema) => {
    const banner = el('div', 'tema-banner');
    banner.innerHTML = '<div class="tema-kicker">' + tema.title + '</div><h2>' + tema.subtitle + '</h2>';
    path.appendChild(banner);

    const roadmap = el('div', 'roadmap-grid');
    SIM_LEVELS.filter((l) => l.temaId === tema.id).forEach((lvl) => {
      const globalIdx = SIM_LEVELS.indexOf(lvl);
      const prevDone = globalIdx === 0 || !!(state.lessons[SIM_LEVELS[globalIdx - 1].id] && state.lessons[SIM_LEVELS[globalIdx - 1].id].completed);
      const unlocked = isLessonUnlocked(globalIdx);
      const progress = state.lessons[lvl.id];
      const isDone = !!(progress && progress.completed);
      const isNext = unlocked && !isDone;
      const bossNeedsCapital = lvl.isBoss && prevDone && currentCapital < BOSS_MIN_CAPITAL;

      const card = el('button', 'roadmap-card' + (lvl.isBoss ? ' boss-card' : '') + (!unlocked ? ' locked' : isDone ? ' done' : ' current'));
      card.type = 'button';
      card.disabled = !unlocked;

      const statusHtml = !unlocked
        ? '<span class="rm-status locked">' + (bossNeedsCapital ? '💰 Requiere $' + fmt(BOSS_MIN_CAPITAL, 0) : '🔒 Bloqueado') + '</span>'
        : isDone
          ? '<span class="rm-status done">' + '⭐'.repeat(progress.stars) + '☆'.repeat(3 - progress.stars) + '</span>'
          : '<span class="rm-status current">' + (lvl.isBoss ? 'Desafiar Boss →' : 'Jugar 5 rondas →') + '</span>';

      card.innerHTML =
        '<div class="rm-top">' +
        '<span class="rm-num' + (lvl.isBoss ? ' boss' : '') + '">' + lvl.number + '</span>' +
        '<span class="rm-icon">' + lvl.icon + '</span>' +
        statusHtml +
        '</div>' +
        '<div class="rm-title">' + lvl.title + '</div>' +
        '<div class="rm-sub">' + lvl.subtitle + '</div>' +
        '<div class="rm-meta">' + (lvl.isBoss ? 'Mínimo requerido: $' + fmt(BOSS_MIN_CAPITAL, 0) + ' · ' : '') + '5 rondas' + (isNext ? ' · Siguiente' : '') + '</div>';

      card.addEventListener('click', () => { if (unlocked) startLesson(lvl.id); });
      roadmap.appendChild(card);
    });
    path.appendChild(roadmap);
  });
  root.appendChild(path);
}

/* ===================== LEARN / CONTENIDOS ===================== */

function renderLearn() {
  const main = el('main', 'learn-screen');
  const readCount = STUDY_MODULES.filter((m) => state.readModules && state.readModules[m.id]).length;
  const pct = Math.round((readCount / STUDY_MODULES.length) * 100);

  const hero = el('section', 'learn-hero');
  hero.innerHTML =
    '<div class="learn-hero-top">' +
    '<div><div class="learn-kicker">Contenidos del curso</div><h1>Guía de Ingeniería Económica</h1></div>' +
    '<div class="learn-pct">' + pct + '%</div>' +
    '</div>' +
    '<p class="learn-hero-desc">Estudia la teoría, fórmulas y ejemplos resueltos de cada tema antes de ponerlos a prueba en la ruta de práctica.</p>' +
    '<div class="learn-progress-track"><div class="learn-progress-fill" style="width:' + pct + '%"></div></div>';
  main.appendChild(hero);

  const filters = el('div', 'learn-filters');
  [
    { id: 'all', label: 'Todos (' + STUDY_MODULES.length + ')' },
    { id: 't1', label: 'Tema I' },
    { id: 't2', label: 'Tema II' },
    { id: 't3', label: 'Tema III' },
    { id: 't4', label: 'Tema IV' },
    { id: 't5', label: 'Tema V' },
    { id: 't6', label: 'Tema VI' },
  ].forEach((f) => {
    const btn = el('button', 'filter-pill' + (learnFilter === f.id ? ' active' : ''));
    btn.textContent = f.label;
    btn.addEventListener('click', () => {
      learnFilter = f.id;
      renderHome();
    });
    filters.appendChild(btn);
  });
  main.appendChild(filters);

  TEMAS.filter((t) => learnFilter === 'all' || learnFilter === t.id).forEach((tema) => {
    const banner = el('div', 'tema-banner');
    banner.innerHTML = '<div class="tema-kicker">' + tema.title + '</div><h2>' + tema.subtitle + '</h2>';
    main.appendChild(banner);

    const grid = el('div', 'study-grid');
    STUDY_MODULES.filter((m) => m.temaId === tema.id).forEach((mod) => {
      const isRead = !!(state.readModules && state.readModules[mod.id]);
      const card = el('button', 'study-card' + (isRead ? ' read' : ''));
      card.innerHTML =
        '<div class="study-card-icon">' + mod.icon + '</div>' +
        '<div class="study-card-body">' +
        '<div class="study-card-title">' + mod.title + '</div>' +
        '<div class="study-card-sub">' + mod.subtitle + '</div>' +
        '<div class="study-card-meta">' +
        '<span class="meta-time">⏱ ' + mod.readMinutes + ' min</span>' +
        '<span class="meta-status ' + (isRead ? 'done' : '') + '">' + (isRead ? '✓ Leído' : 'Leer tema →') + '</span>' +
        '</div>' +
        '</div>';
      card.addEventListener('click', () => {
        activeModuleId = mod.id;
        activeModuleStep = 0;
        renderHome();
        window.scrollTo(0, 0);
      });
      grid.appendChild(card);
    });
    main.appendChild(grid);
  });

  root.appendChild(main);
}

function renderCashFlowDiagramSVG() {
  return (
    '<svg class="cf-svg" viewBox="0 0 600 220" role="img" aria-label="Diagrama de flujo de efectivo Ejemplo 2.6">' +
    '<line x1="50" y1="115" x2="555" y2="115" stroke="#0F172A" stroke-width="2.5" />' +
    '<text x="565" y="119" font-size="12" font-weight="700" fill="#475569">Años</text>' +
    /* t=0 inversion */
    '<line x1="70" y1="115" x2="70" y2="188" stroke="#E11D48" stroke-width="2.5" />' +
    '<polygon points="70,196 65,184 75,184" fill="#E11D48" />' +
    '<text x="70" y="212" text-anchor="middle" font-size="12" font-weight="700" fill="#E11D48">-$10,000</text>' +
    '<text x="70" y="104" text-anchor="middle" font-size="12" font-weight="700" fill="#0F172A">0</text>' +
    /* t=1..5 */
    [1, 2, 3, 4, 5].map((yr) => {
      const x = 70 + yr * 92;
      const topY = yr === 5 ? 24 : 46;
      const topLabel = yr === 5 ? '+$7,310' : '+$5,310';
      return (
        '<line x1="' + x + '" y1="115" x2="' + x + '" y2="' + (topY + 8) + '" stroke="#0D9488" stroke-width="2.5" />' +
        '<polygon points="' + x + ',' + topY + ' ' + (x - 5) + ',' + (topY + 12) + ' ' + (x + 5) + ',' + (topY + 12) + '" fill="#0D9488" />' +
        '<text x="' + x + '" y="' + (topY - 6) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0D9488">' + topLabel + '</text>' +
        '<line x1="' + x + '" y1="115" x2="' + x + '" y2="162" stroke="#E11D48" stroke-width="2" />' +
        '<polygon points="' + x + ',170 ' + (x - 4.5) + ',159 ' + (x + 4.5) + ',159" fill="#E11D48" />' +
        '<text x="' + x + '" y="184" text-anchor="middle" font-size="11" font-weight="700" fill="#E11D48">-$3,000</text>' +
        '<circle cx="' + x + '" cy="115" r="3.5" fill="#0F172A" />' +
        '<text x="' + (x + 12) + '" y="130" font-size="11.5" font-weight="700" fill="#0F172A">' + yr + '</text>'
      );
    }).join('') +
    '</svg>'
  );
}

function renderModuleReader(mod) {
  const tema = TEMAS.find((t) => t.id === mod.temaId);
  const idx = STUDY_MODULES.indexOf(mod);
  const nextMod = idx < STUDY_MODULES.length - 1 ? STUDY_MODULES[idx + 1] : null;
  const totalSteps = mod.blocks.length;

  if (activeModuleStep >= totalSteps) {
    renderModuleComplete(mod, nextMod);
    return;
  }

  const block = mod.blocks[activeModuleStep];
  const screen = el('div', 'reader-screen');

  const topbar = el('header', 'reader-topbar');
  const closeBtn = el('button', 'icon-btn');
  closeBtn.type = 'button';
  closeBtn.innerHTML = '✕';
  closeBtn.setAttribute('aria-label', 'Volver a Contenidos');
  closeBtn.addEventListener('click', () => {
    activeModuleId = null;
    activeModuleStep = 0;
    renderHome();
  });

  const track = el('div', 'progress-track');
  const fill = el('div', 'progress-fill');
  fill.style.transform = 'scaleX(' + (activeModuleStep + 1) / totalSteps + ')';
  track.appendChild(fill);

  const stepPill = el('div', 'reader-step-pill');
  stepPill.textContent = (activeModuleStep + 1) + ' / ' + totalSteps;

  topbar.appendChild(closeBtn);
  topbar.appendChild(track);
  topbar.appendChild(stepPill);
  screen.appendChild(topbar);

  const stage = el('div', 'reader-stage');
  const stageHead = el('div', 'stage-head');
  stageHead.innerHTML =
    '<div class="stage-kicker">' + (tema ? tema.title : '') + ' · ' + mod.icon + ' ' + mod.title + '</div>' +
    '<h2 class="stage-title">' + (block.stepTitle || ('Parte ' + (activeModuleStep + 1))) + '</h2>';
  stage.appendChild(stageHead);

  const footer = el('footer', 'reader-footer');
  const footerInner = el('div', 'reader-footer-inner');

  const prevBtn = el('button', 'btn-3d secondary');
  prevBtn.type = 'button';
  prevBtn.textContent = '← Anterior';
  prevBtn.disabled = activeModuleStep === 0;
  prevBtn.addEventListener('click', () => {
    if (activeModuleStep > 0) {
      activeModuleStep -= 1;
      renderHome();
      window.scrollTo(0, 0);
    }
  });

  const nextBtn = el('button', 'btn-3d');
  nextBtn.type = 'button';
  nextBtn.textContent = activeModuleStep === totalSteps - 1 ? 'Finalizar tema ✓' : 'Continuar →';

  const unlockNext = () => {
    nextBtn.disabled = false;
  };

  if (block.type === 'quickcheck') {
    const alreadySolved = !!(state.solvedQuickChecks && state.solvedQuickChecks[block.id]);
    nextBtn.disabled = !alreadySolved;
    stage.appendChild(renderQuickCheckBlock(block, unlockNext));
  } else {
    stage.appendChild(renderStudyBlock(block));
  }

  nextBtn.addEventListener('click', () => {
    activeModuleStep += 1;
    renderHome();
    window.scrollTo(0, 0);
  });

  footerInner.appendChild(prevBtn);
  footerInner.appendChild(nextBtn);
  footer.appendChild(footerInner);

  screen.appendChild(stage);
  screen.appendChild(footer);
  root.appendChild(screen);
}

function renderStudyBlock(b) {
  if (b.type === 'lead') {
    const p = el('p', 'reader-lead');
    p.textContent = b.text;
    return p;
  }
  if (b.type === 'cards') {
    const sec = el('section', 'reader-section');
    if (b.title) {
      const h = el('h3', 'reader-sec-title');
      h.textContent = b.title;
      sec.appendChild(h);
    }
    const grid = el('div', 'concept-grid');
    b.items.forEach((it) => {
      const card = el('div', 'concept-card');
      card.innerHTML =
        '<span class="concept-badge">' + it.badge + '</span>' +
        '<h4>' + it.title + '</h4>' +
        '<p>' + it.body + '</p>';
      grid.appendChild(card);
    });
    sec.appendChild(grid);
    return sec;
  }
  if (b.type === 'list') {
    const sec = el('section', 'reader-section');
    if (b.title) {
      const h = el('h3', 'reader-sec-title');
      h.textContent = b.title;
      sec.appendChild(h);
    }
    if (b.intro) {
      const intro = el('p', 'reader-intro');
      intro.textContent = b.intro;
      sec.appendChild(intro);
    }
    const ul = el('ul', 'reader-list');
    b.items.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      ul.appendChild(li);
    });
    sec.appendChild(ul);
    return sec;
  }
  if (b.type === 'callout') {
    const box = el('div', 'reader-callout ' + (b.tone || 'mint'));
    box.innerHTML = '<div class="callout-title">' + b.title + '</div><p>' + b.text + '</p>';
    return box;
  }
  if (b.type === 'principles') {
    const sec = el('section', 'reader-section');
    const list = el('div', 'principles-list');
    b.items.forEach((p) => {
      const row = el('div', 'principle-row');
      row.innerHTML =
        '<div class="principle-num">' + p.num + '</div>' +
        '<div class="principle-content"><h4>' + p.title + '</h4><p>' + p.body + '</p></div>';
      list.appendChild(row);
    });
    sec.appendChild(list);
    return sec;
  }
  if (b.type === 'formula') {
    const sec = el('section', 'reader-section');
    if (b.title) {
      const h = el('h3', 'reader-sec-title');
      h.textContent = b.title;
      sec.appendChild(h);
    }
    const stack = el('div', 'formula-stack');
    b.formulas.forEach((f) => {
      const card = el('div', 'formula-box');
      card.innerHTML = '<div class="formula-expr">' + f.expr + '</div><div class="formula-desc">' + f.desc + '</div>';
      stack.appendChild(card);
    });
    sec.appendChild(stack);
    return sec;
  }
  if (b.type === 'example') {
    const box = el('section', 'example-box');
    box.innerHTML =
      '<div class="example-kicker">Ejemplo resuelto</div>' +
      '<h4>' + b.title + '</h4>' +
      '<p class="example-stmt">' + b.statement + '</p>' +
      '<ul class="example-steps">' + b.steps.map((s) => '<li>' + s + '</li>').join('') + '</ul>';
    return box;
  }
  if (b.type === 'table') {
    const sec = el('section', 'reader-section');
    if (b.title) {
      const h = el('h3', 'reader-sec-title');
      h.textContent = b.title;
      sec.appendChild(h);
    }
    const wrap = el('div', 'table-scroll');
    const tbl = document.createElement('table');
    tbl.className = 'study-table';
    tbl.innerHTML =
      '<thead><tr>' + b.headers.map((h) => '<th>' + h + '</th>').join('') + '</tr></thead>' +
      '<tbody>' + b.rows.map((r) => '<tr>' + r.map((c) => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody>';
    wrap.appendChild(tbl);
    sec.appendChild(wrap);
    if (b.footnote) {
      const fn = el('p', 'table-footnote');
      fn.textContent = b.footnote;
      sec.appendChild(fn);
    }
    return sec;
  }
  if (b.type === 'diagram') {
    const sec = el('section', 'reader-section diagram-box');
    sec.innerHTML =
      '<div class="example-kicker">Diagrama visual</div>' +
      '<h4>' + b.title + '</h4>' +
      '<div class="diagram-scroll">' + renderCashFlowDiagramSVG() + '</div>' +
      '<p class="table-footnote">' + b.caption + '</p>';
    return sec;
  }
  if (b.type === 'flipcards') return renderFlipCardsBlock(b);
  if (b.type === 'lab') return renderLabBlock(b);
  return el('div');
}

function renderModuleComplete(mod, nextMod) {
  if (!state.readModules) state.readModules = {};
  let bonus = 0;
  if (!state.readModules[mod.id]) {
    state.readModules[mod.id] = true;
    state.xp += 5;
    bonus = 5;
    registerStreak();
    saveState();
  }

  const wrap = el('div', 'lesson-screen');
  const content = el('div', 'summary-screen');
  const qcCount = mod.blocks.filter((b) => b.type === 'quickcheck').length;

  content.innerHTML =
    '<div class="summary-mascot">🎓</div>' +
    '<h2>¡Tema completado!</h2>' +
    '<p class="summary-sub">' + mod.icon + ' ' + mod.title + '</p>' +
    '<div class="summary-stats">' +
    '<div class="summary-stat"><div class="value">' + mod.blocks.length + '</div><div class="label">Pasos</div></div>' +
    '<div class="summary-stat"><div class="value">' + qcCount + '</div><div class="label">Mini-retos</div></div>' +
    '<div class="summary-stat"><div class="value">' + (bonus ? '+' + bonus : '✓') + '</div><div class="label">' + (bonus ? 'XP lectura' : 'Leído') + '</div></div>' +
    '</div>';

  if (mod.relatedLessonId) {
    const lessonIdx = SIM_LEVELS.findIndex((l) => l.id === mod.relatedLessonId);
    const unlocked = lessonIdx !== -1 && isLessonUnlocked(lessonIdx);
    const practiceBtn = el('button', 'btn-3d blue');
    practiceBtn.textContent = unlocked ? '🎯 Jugar nivel empresarial' : '🎯 Ir a Simulación';
    practiceBtn.addEventListener('click', () => {
      activeModuleId = null;
      activeModuleStep = 0;
      if (unlocked) {
        startLesson(mod.relatedLessonId);
      } else {
        activeTab = 'practice';
        renderHome();
        showToast('Supera los niveles previos para desbloquearlo');
      }
    });
    content.appendChild(practiceBtn);
  }

  if (nextMod) {
    const nextBtn = el('button', 'btn-3d');
    nextBtn.textContent = 'Siguiente: ' + nextMod.title + ' →';
    nextBtn.addEventListener('click', () => {
      activeModuleId = nextMod.id;
      activeModuleStep = 0;
      renderHome();
      window.scrollTo(0, 0);
    });
    content.appendChild(nextBtn);
  }

  const backBtn = el('button', 'btn-3d secondary');
  backBtn.textContent = 'Volver a Contenidos';
  backBtn.addEventListener('click', () => {
    activeModuleId = null;
    activeModuleStep = 0;
    renderHome();
  });
  content.appendChild(backBtn);

  wrap.appendChild(content);
  root.appendChild(wrap);
}

function toggleModuleRead(modId) {
  if (!state.readModules) state.readModules = {};
  const wasRead = !!state.readModules[modId];
  if (wasRead) {
    delete state.readModules[modId];
    saveState();
    renderHome();
    return;
  }
  state.readModules[modId] = true;
  state.xp += 5;
  registerStreak();
  saveState();
  renderHome();
  showToast('⭐ +5 XP por completar lectura');
}

/* ===================== INTERACTIVE LEARNING BLOCKS ===================== */

function renderFlipCardsBlock(b) {
  const sec = el('section', 'reader-section');
  if (b.title) {
    const h = el('h3', 'reader-sec-title');
    h.textContent = b.title;
    sec.appendChild(h);
  }
  const grid = el('div', 'flip-grid');
  b.items.forEach((it) => {
    const card = el('button', 'flip-card');
    card.type = 'button';
    card.setAttribute('aria-pressed', 'false');
    card.innerHTML =
      '<div class="flip-inner">' +
      '<div class="flip-face flip-front">' +
      '<span class="concept-badge">' + it.frontKicker + '</span>' +
      '<h4>' + it.frontTitle + '</h4>' +
      '<span class="flip-hint">' + it.frontHint + '</span>' +
      '</div>' +
      '<div class="flip-face flip-back">' +
      '<h4>' + it.backTitle + '</h4>' +
      '<p>' + it.backBody + '</p>' +
      '</div>' +
      '</div>';
    card.addEventListener('click', () => {
      const flipped = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
    });
    grid.appendChild(card);
  });
  sec.appendChild(grid);
  return sec;
}

function renderQuickCheckBlock(b, onSolved) {
  const sec = el('section', 'quickcheck-box');
  if (!state.solvedQuickChecks) state.solvedQuickChecks = {};
  const alreadySolved = !!state.solvedQuickChecks[b.id];

  const header = el('div', 'qc-header');
  header.innerHTML =
    '<span class="qc-kicker">' + (b.isFinal ? '🏆 Mini-reto integrador' : '⚡ Mini-reto relámpago') + '</span>' +
    '<span class="qc-badge' + (alreadySolved ? ' solved' : '') + '">' + (alreadySolved ? '✓ Resuelto' : '+5 XP') + '</span>';
  sec.appendChild(header);

  const prompt = el('p', 'qc-prompt');
  prompt.textContent = b.prompt;
  sec.appendChild(prompt);

  const optsWrap = el('div', 'qc-options');
  const feedback = el('div', 'qc-feedback');

  b.options.forEach((opt, i) => {
    const btn = el('button', 'qc-option');
    btn.type = 'button';
    btn.textContent = opt;
    if (alreadySolved && i === b.answer) btn.classList.add('correct');
    btn.addEventListener('click', () => {
      const isRight = i === b.answer;
      optsWrap.querySelectorAll('.qc-option').forEach((o, idx) => {
        o.classList.remove('wrong', 'correct');
        if (idx === b.answer) o.classList.add('correct');
        else if (idx === i && !isRight) o.classList.add('wrong');
      });
      feedback.className = 'qc-feedback show ' + (isRight ? 'ok' : 'err');
      feedback.innerHTML = '<strong>' + (isRight ? '¡Exacto! ' : 'Casi... ') + '</strong>' + b.explain;
      if (isRight && !state.solvedQuickChecks[b.id]) {
        state.solvedQuickChecks[b.id] = true;
        state.xp += 5;
        registerStreak();
        saveState();
        const badge = header.querySelector('.qc-badge');
        badge.classList.add('solved');
        badge.textContent = '✓ Resuelto';
        showToast('⚡ +5 XP por mini-reto');
      }
      if (isRight && onSolved) onSolved();
    });
    optsWrap.appendChild(btn);
  });

  sec.appendChild(optsWrap);
  if (alreadySolved) {
    feedback.className = 'qc-feedback show ok';
    feedback.innerHTML = '<strong>¡Resuelto! </strong>' + b.explain;
  }
  sec.appendChild(feedback);
  return sec;
}

function makeRangeControl(label, min, max, step, value, fmtFn, onChange) {
  const wrap = el('div', 'lab-control');
  const top = el('div', 'lab-control-top');
  const lbl = el('span', 'lab-label');
  lbl.textContent = label;
  const valEl = el('span', 'lab-val');
  valEl.textContent = fmtFn(value);
  top.appendChild(lbl);
  top.appendChild(valEl);

  const input = document.createElement('input');
  input.type = 'range';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;
  input.addEventListener('input', () => {
    const v = parseFloat(input.value);
    valEl.textContent = fmtFn(v);
    onChange(v);
  });

  wrap.appendChild(top);
  wrap.appendChild(input);
  return wrap;
}

function renderLabBlock(b) {
  const sec = el('section', 'lab-box');
  const title = el('div', 'lab-title');
  title.textContent = b.title;
  sec.appendChild(title);

  const body = el('div', 'lab-body');
  sec.appendChild(body);

  if (b.labKind === 'inflation') renderInflationLab(body);
  else if (b.labKind === 'simple_vs_compound') renderSimpleCompoundLab(body);
  else if (b.labKind === 'plans') renderPlansLab(body);
  else if (b.labKind === 'cashflow') renderCashFlowLab(body);
  else if (b.labKind === 'factors_single') renderFactorsLab(body, 'single');
  else if (b.labKind === 'factors_series') renderFactorsLab(body, 'series');
  else if (b.labKind === 'annuities') renderAnnuitiesLab(body);
  else if (b.labKind === 'nominal_effective') renderNominalEffectiveLab(body);
  else if (b.labKind === 'breakeven') renderBreakEvenLab(body);
  else if (b.labKind === 'eval_techniques') renderEvalTechniquesLab(body);
  else if (b.labKind === 'compare_alts') renderCompareAltsLab(body);

  return sec;
}

function renderInflationLab(body) {
  let price = 100, rate = 6, inf = 8;
  const controls = el('div', 'lab-controls');
  const out = el('div', 'lab-output');

  function update() {
    const saved = price * (1 + rate / 100);
    const futurePrice = price * (1 + inf / 100);
    const diff = saved - futurePrice;
    const maxVal = Math.max(saved, futurePrice, 1);
    const win = diff >= 0;

    out.innerHTML =
      '<div class="lab-bars">' +
      '<div class="lab-bar-row"><span>Tu ahorro en 1 año</span><strong>$' + fmt(saved) + '</strong></div>' +
      '<div class="lab-bar-track"><div class="lab-bar-fill green" style="width:' + Math.round((saved / maxVal) * 100) + '%"></div></div>' +
      '<div class="lab-bar-row"><span>Precio futuro (inflación)</span><strong>$' + fmt(futurePrice) + '</strong></div>' +
      '<div class="lab-bar-track"><div class="lab-bar-fill red" style="width:' + Math.round((futurePrice / maxVal) * 100) + '%"></div></div>' +
      '</div>' +
      '<div class="lab-verdict ' + (win ? 'ok' : 'warn') + '">' +
      (win
        ? '✅ ¡Ahorrar conviene! Te sobran <strong>$' + fmt(diff) + '</strong> de poder adquisitivo.'
        : '⚠️ ¡Compra hoy! La inflación te haría perder <strong>$' + fmt(Math.abs(diff)) + '</strong>.') +
      '</div>';
  }

  controls.appendChild(makeRangeControl('Precio hoy (P)', 100, 1000, 50, price, (v) => '$' + fmt(v, 0), (v) => { price = v; update(); }));
  controls.appendChild(makeRangeControl('Interés anual (i)', 0, 15, 0.5, rate, (v) => v + '%', (v) => { rate = v; update(); }));
  controls.appendChild(makeRangeControl('Inflación anual', 0, 15, 0.5, inf, (v) => v + '%', (v) => { inf = v; update(); }));

  body.appendChild(controls);
  body.appendChild(out);
  update();
}

function renderSimpleCompoundLab(body) {
  let P = 1000, i = 8, N = 8;
  const controls = el('div', 'lab-controls');
  const out = el('div', 'lab-output');

  function update() {
    const fSimple = P * (1 + (i / 100) * N);
    const fComp = P * Math.pow(1 + i / 100, N);
    const gap = fComp - fSimple;

    let barsHtml = '<div class="duel-chart">';
    const step = N > 10 ? 2 : 1;
    for (let yr = 1; yr <= N; yr += step) {
      const sVal = P * (1 + (i / 100) * yr);
      const cVal = P * Math.pow(1 + i / 100, yr);
      const sPct = Math.round((sVal / fComp) * 100);
      const cPct = Math.round((cVal / fComp) * 100);
      barsHtml +=
        '<div class="duel-col">' +
        '<div class="duel-bars">' +
        '<div class="duel-b simple" style="height:' + sPct + '%" title="Simple: $' + fmt(sVal) + '"></div>' +
        '<div class="duel-b comp" style="height:' + cPct + '%" title="Compuesto: $' + fmt(cVal) + '"></div>' +
        '</div>' +
        '<span class="duel-yr">A' + yr + '</span>' +
        '</div>';
    }
    barsHtml += '</div>';

    out.innerHTML =
      '<div class="duel-legend"><span><i class="dot simple"></i>Simple: <strong>$' + fmt(fSimple) + '</strong></span>' +
      '<span><i class="dot comp"></i>Compuesto: <strong>$' + fmt(fComp) + '</strong></span></div>' +
      barsHtml +
      '<div class="lab-verdict ok">🚀 Brecha del interés compuesto: <strong>+$' + fmt(gap) + '</strong> extra en ' + N + ' años.</div>';
  }

  controls.appendChild(makeRangeControl('Capital (P)', 500, 10000, 500, P, (v) => '$' + fmt(v, 0), (v) => { P = v; update(); }));
  controls.appendChild(makeRangeControl('Tasa anual (i)', 1, 20, 1, i, (v) => v + '%', (v) => { i = v; update(); }));
  controls.appendChild(makeRangeControl('Años (N)', 1, 15, 1, N, (v) => v + (v === 1 ? ' año' : ' años'), (v) => { N = v; update(); }));

  body.appendChild(controls);
  body.appendChild(out);
  update();
}

function renderPlansLab(body) {
  const plans = [
    { name: 'Plan 1', tag: 'Simple, todo al final', payments: [0, 0, 0, 0, 7000], total: '$7,000.00', note: 'Sin pagos anuales; interés simple ($400/año) acumulado hasta el año 5.' },
    { name: 'Plan 2', tag: 'Compuesto, todo al final', payments: [0, 0, 0, 0, 7346.64], total: '$7,346.64', note: 'El interés se capitaliza cada año sin abonos; es el mayor desembolso total.' },
    { name: 'Plan 3', tag: 'Interés anual + capital final', payments: [400, 400, 400, 400, 5400], total: '$7,000.00', note: 'Pagas $400 de interés cada año y devuelves los $5,000 completos al final.' },
    { name: 'Plan 4', tag: 'Compuesto + $1,000 capital/año', payments: [1400, 1320, 1240, 1160, 1080], total: '$6,200.00', note: 'Al amortizar $1,000 del principal cada año, los intereses bajan rápido.' },
    { name: 'Plan 5', tag: 'Cuotas iguales (anualidad)', payments: [1252.28, 1252.28, 1252.28, 1252.28, 1252.28], total: '$6,261.41', note: '5 pagos iguales de $1,252.28 combinando interés compuesto y capital.' },
  ];
  let selected = 0;

  const tabs = el('div', 'plan-tabs');
  const out = el('div', 'lab-output');

  function update() {
    const p = plans[selected];
    const maxPay = Math.max(...p.payments, 1);
    tabs.querySelectorAll('.plan-tab').forEach((t, i) => t.classList.toggle('active', i === selected));
    out.innerHTML =
      '<div class="plan-head"><strong>' + p.name + ': ' + p.tag + '</strong><span>Total: ' + p.total + '</span></div>' +
      '<div class="plan-bars">' +
      p.payments.map((val, idx) =>
        '<div class="plan-bar-item">' +
        '<div class="plan-bar-val">$' + fmt(val, 0) + '</div>' +
        '<div class="plan-bar-track"><div class="plan-bar-fill" style="height:' + Math.max(4, Math.round((val / maxPay) * 100)) + '%"></div></div>' +
        '<div class="plan-bar-yr">Año ' + (idx + 1) + '</div>' +
        '</div>'
      ).join('') +
      '</div>' +
      '<p class="table-footnote">' + p.note + '</p>';
  }

  plans.forEach((p, i) => {
    const btn = el('button', 'plan-tab');
    btn.type = 'button';
    btn.textContent = p.name;
    btn.addEventListener('click', () => { selected = i; update(); });
    tabs.appendChild(btn);
  });

  body.appendChild(tabs);
  body.appendChild(out);
  update();
}

function renderCashFlowLab(body) {
  let inv = 10000, ing = 5310, gas = 3000, res = 2000;
  const controls = el('div', 'lab-controls');
  const out = el('div', 'lab-output');

  function update() {
    const fen = ing - gas;
    const fen5 = fen + res;
    const svg =
      '<svg class="cf-svg" viewBox="0 0 600 220" role="img" aria-label="Diagrama de flujo interactivo">' +
      '<line x1="50" y1="115" x2="555" y2="115" stroke="#0F172A" stroke-width="2.5" />' +
      '<text x="565" y="119" font-size="12" font-weight="700" fill="#475569">Años</text>' +
      '<line x1="70" y1="115" x2="70" y2="188" stroke="#E11D48" stroke-width="2.5" />' +
      '<polygon points="70,196 65,184 75,184" fill="#E11D48" />' +
      '<text x="70" y="212" text-anchor="middle" font-size="11.5" font-weight="700" fill="#E11D48">-$' + fmt(inv, 0) + '</text>' +
      '<text x="70" y="104" text-anchor="middle" font-size="12" font-weight="700" fill="#0F172A">0</text>' +
      [1, 2, 3, 4, 5].map((yr) => {
        const x = 70 + yr * 92;
        const topY = yr === 5 && res > 0 ? 24 : 46;
        const topAmt = yr === 5 ? ing + res : ing;
        return (
          '<line x1="' + x + '" y1="115" x2="' + x + '" y2="' + (topY + 8) + '" stroke="#0D9488" stroke-width="2.5" />' +
          '<polygon points="' + x + ',' + topY + ' ' + (x - 5) + ',' + (topY + 12) + ' ' + (x + 5) + ',' + (topY + 12) + '" fill="#0D9488" />' +
          '<text x="' + x + '" y="' + (topY - 6) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#0D9488">+$' + fmt(topAmt, 0) + '</text>' +
          (gas > 0 ? (
            '<line x1="' + x + '" y1="115" x2="' + x + '" y2="162" stroke="#E11D48" stroke-width="2" />' +
            '<polygon points="' + x + ',170 ' + (x - 4.5) + ',159 ' + (x + 4.5) + ',159" fill="#E11D48" />' +
            '<text x="' + x + '" y="184" text-anchor="middle" font-size="11" font-weight="700" fill="#E11D48">-$' + fmt(gas, 0) + '</text>'
          ) : '') +
          '<circle cx="' + x + '" cy="115" r="3.5" fill="#0F172A" />' +
          '<text x="' + (x + 12) + '" y="130" font-size="11.5" font-weight="700" fill="#0F172A">' + yr + '</text>'
        );
      }).join('') +
      '</svg>';

    out.innerHTML =
      '<div class="diagram-scroll">' + svg + '</div>' +
      '<div class="lab-verdict ' + (fen >= 0 ? 'ok' : 'warn') + '">' +
      'FEN años 1–4: <strong>$' + fmt(fen, 0) + '</strong> · FEN año 5 (con rescate): <strong>$' + fmt(fen5, 0) + '</strong>' +
      '</div>';
  }

  controls.appendChild(makeRangeControl('Inversión inicial (t=0)', 2000, 20000, 1000, inv, (v) => '$' + fmt(v, 0), (v) => { inv = v; update(); }));
  controls.appendChild(makeRangeControl('Ingresos anuales', 1000, 10000, 500, ing, (v) => '$' + fmt(v, 0), (v) => { ing = v; update(); }));
  controls.appendChild(makeRangeControl('Gastos anuales', 0, 6000, 500, gas, (v) => '$' + fmt(v, 0), (v) => { gas = v; update(); }));
  controls.appendChild(makeRangeControl('Valor de rescate (t=5)', 0, 5000, 500, res, (v) => '$' + fmt(v, 0), (v) => { res = v; update(); }));

  body.appendChild(controls);
  body.appendChild(out);
  update();
}

function renderFactorsLab(body, mode) {
  const specs = mode === 'single'
    ? [
        { id: 'FP', label: 'F/P (Capitalización)', given: 'P', target: 'F', defAmt: 1000, calc: (amt, ii, n) => ({ factor: Math.pow(1 + ii, n), res: amt * Math.pow(1 + ii, n), formula: 'F = P(1 + i)^N' }) },
        { id: 'PF', label: 'P/F (Descuento)', given: 'F', target: 'P', defAmt: 1000, calc: (amt, ii, n) => ({ factor: Math.pow(1 + ii, -n), res: amt / Math.pow(1 + ii, n), formula: 'P = F(1 + i)^(-N)' }) },
      ]
    : [
        { id: 'FA', label: 'F/A (Futuro de serie)', given: 'A', target: 'F', defAmt: 5000, calc: (amt, ii, n) => { const f = ii === 0 ? n : (Math.pow(1 + ii, n) - 1) / ii; return { factor: f, res: amt * f, formula: 'F = A[(1+i)^N − 1] / i' }; } },
        { id: 'PA', label: 'P/A (Presente de serie)', given: 'A', target: 'P', defAmt: 5000, calc: (amt, ii, n) => { const f = ii === 0 ? n : (Math.pow(1 + ii, n) - 1) / (ii * Math.pow(1 + ii, n)); return { factor: f, res: amt * f, formula: 'P = A[(1+i)^N − 1] / [i(1+i)^N]' }; } },
        { id: 'AF', label: 'A/F (Amortización)', given: 'F', target: 'A', defAmt: 100000, calc: (amt, ii, n) => { const f = ii === 0 ? 1 / n : ii / (Math.pow(1 + ii, n) - 1); return { factor: f, res: amt * f, formula: 'A = F · i / [(1+i)^N − 1]' }; } },
        { id: 'AP', label: 'A/P (Cuota de préstamo)', given: 'P', target: 'A', defAmt: 20000, calc: (amt, ii, n) => { const f = ii === 0 ? 1 / n : (ii * Math.pow(1 + ii, n)) / (Math.pow(1 + ii, n) - 1); return { factor: f, res: amt * f, formula: 'A = P · i(1+i)^N / [(1+i)^N − 1]' }; } },
      ];

  let sel = 0, amt = specs[0].defAmt, rate = 7, N = 8;
  const tabs = el('div', 'plan-tabs');
  const controls = el('div', 'lab-controls');
  const out = el('div', 'lab-output');

  function update() {
    const s = specs[sel];
    const r = s.calc(amt, rate / 100, N);
    tabs.querySelectorAll('.plan-tab').forEach((t, i) => t.classList.toggle('active', i === sel));
    out.innerHTML =
      '<div class="formula-box">' +
      '<div class="formula-expr">' + s.target + ' = $' + fmt(amt, 0) + ' (' + s.target + '/' + s.given + ', ' + rate + '%, ' + N + ')</div>' +
      '<div class="formula-desc">' + r.formula + ' · Factor = <strong>' + r.factor.toFixed(4) + '</strong></div>' +
      '</div>' +
      '<div class="lab-verdict ok">Resultado: <strong>' + s.target + ' = $' + fmt(r.res) + '</strong></div>';
  }

  specs.forEach((s, i) => {
    const btn = el('button', 'plan-tab');
    btn.type = 'button';
    btn.textContent = s.label;
    btn.addEventListener('click', () => { sel = i; update(); });
    tabs.appendChild(btn);
  });

  controls.appendChild(makeRangeControl('Monto base', 500, 100000, 500, amt, (v) => '$' + fmt(v, 0), (v) => { amt = v; update(); }));
  controls.appendChild(makeRangeControl('Tasa (i)', 1, 20, 0.5, rate, (v) => v + '%', (v) => { rate = v; update(); }));
  controls.appendChild(makeRangeControl('Periodos (N)', 1, 20, 1, N, (v) => v + '', (v) => { N = v; update(); }));

  body.appendChild(tabs);
  body.appendChild(controls);
  body.appendChild(out);
  update();
}

function renderAnnuitiesLab(body) {
  let type = 'vencida', A = 1000, rate = 10, N = 5, k = 2;
  const tabs = el('div', 'plan-tabs');
  const controls = el('div', 'lab-controls');
  const out = el('div', 'lab-output');

  const modes = [
    { id: 'vencida', label: 'Vencida' },
    { id: 'anticipada', label: 'Anticipada' },
    { id: 'diferida', label: 'Diferida' },
  ];

  function update() {
    const ii = rate / 100;
    const pOrd = A * ((1 - Math.pow(1 + ii, -N)) / ii);
    let pFinal = pOrd;
    let formulaTxt = 'P = P_ordinaria';
    if (type === 'anticipada') {
      pFinal = pOrd * (1 + ii);
      formulaTxt = 'P = P_ordinaria × (1 + i)';
    } else if (type === 'diferida') {
      pFinal = pOrd * Math.pow(1 + ii, -k);
      formulaTxt = 'P₀ = P_ordinaria × (1 + i)^(−' + k + ')';
    }

    tabs.querySelectorAll('.plan-tab').forEach((t, idx) => t.classList.toggle('active', modes[idx].id === type));
    const totalHorizon = type === 'diferida' ? N + k : N;
    const dots = [];
    for (let t = 0; t <= totalHorizon; t++) {
      let active = false;
      if (type === 'vencida' && t >= 1 && t <= N) active = true;
      if (type === 'anticipada' && t >= 0 && t < N) active = true;
      if (type === 'diferida' && t > k && t <= k + N) active = true;
      dots.push('<div class="tl-dot' + (active ? ' active' : '') + '"><span>t=' + t + '</span></div>');
    }

    out.innerHTML =
      '<div class="tl-track">' + dots.join('') + '</div>' +
      '<div class="formula-box">' +
      '<div class="formula-expr">' + formulaTxt + '</div>' +
      '<div class="formula-desc">Ordinaria base: $' + fmt(pOrd) + '</div>' +
      '</div>' +
      '<div class="lab-verdict ok">Valor Presente (P): <strong>$' + fmt(pFinal) + '</strong></div>';
  }

  modes.forEach((m) => {
    const btn = el('button', 'plan-tab');
    btn.type = 'button';
    btn.textContent = m.label;
    btn.addEventListener('click', () => { type = m.id; update(); });
    tabs.appendChild(btn);
  });

  controls.appendChild(makeRangeControl('Pago periódico (A)', 500, 10000, 500, A, (v) => '$' + fmt(v, 0), (v) => { A = v; update(); }));
  controls.appendChild(makeRangeControl('Tasa (i)', 2, 20, 1, rate, (v) => v + '%', (v) => { rate = v; update(); }));
  controls.appendChild(makeRangeControl('Pagos (N)', 2, 8, 1, N, (v) => v + '', (v) => { N = v; update(); }));
  controls.appendChild(makeRangeControl('Gracia k (solo diferida)', 1, 5, 1, k, (v) => v + ' per.', (v) => { k = v; update(); }));

  body.appendChild(tabs);
  body.appendChild(controls);
  body.appendChild(out);
  update();
}

function renderNominalEffectiveLab(body) {
  let r = 12, freqIdx = 3;
  const freqs = [
    { label: 'Anual (m=1)', m: 1 },
    { label: 'Semestral (m=2)', m: 2 },
    { label: 'Trimestral (m=4)', m: 4 },
    { label: 'Mensual (m=12)', m: 12 },
    { label: 'Diaria (m=365)', m: 365 },
    { label: 'Continua (∞)', m: Infinity },
  ];
  const tabs = el('div', 'plan-tabs');
  const controls = el('div', 'lab-controls');
  const out = el('div', 'lab-output');

  function update() {
    const f = freqs[freqIdx];
    const rr = r / 100;
    const tea = f.m === Infinity ? Math.exp(rr) - 1 : Math.pow(1 + rr / f.m, f.m) - 1;
    const finalAmt = 1000 * (1 + tea);
    tabs.querySelectorAll('.plan-tab').forEach((t, i) => t.classList.toggle('active', i === freqIdx));
    out.innerHTML =
      '<div class="formula-box">' +
      '<div class="formula-expr">' + (f.m === Infinity ? 'i_ef = e^(' + rr.toFixed(2) + ') − 1' : 'i_ef = (1 + ' + rr.toFixed(2) + '/' + f.m + ')^' + f.m + ' − 1') + '</div>' +
      '<div class="formula-desc">Tasa Nominal: ' + r + '% · $1,000 en 1 año → <strong>$' + fmt(finalAmt) + '</strong></div>' +
      '</div>' +
      '<div class="lab-verdict ok">Tasa Efectiva Anual (TEA): <strong>' + (tea * 100).toFixed(2) + '%</strong></div>';
  }

  freqs.forEach((f, i) => {
    const btn = el('button', 'plan-tab');
    btn.type = 'button';
    btn.textContent = f.label;
    btn.addEventListener('click', () => { freqIdx = i; update(); });
    tabs.appendChild(btn);
  });

  controls.appendChild(makeRangeControl('Tasa nominal anual (r)', 2, 36, 1, r, (v) => v + '%', (v) => { r = v; update(); }));
  body.appendChild(tabs);
  body.appendChild(controls);
  body.appendChild(out);
  update();
}

function renderBreakEvenLab(body) {
  let cf = 10000, cv = 30, price = 50, qty = 600;
  const controls = el('div', 'lab-controls');
  const out = el('div', 'lab-output');

  function update() {
    const marginU = price - cv;
    const qStar = marginU > 0 ? cf / marginU : Infinity;
    const rev = price * qty;
    const cost = cf + cv * qty;
    const profit = rev - cost;
    const maxV = Math.max(rev, cost, 1);

    out.innerHTML =
      '<div class="lab-bars">' +
      '<div class="lab-bar-row"><span>Ingresos totales (P × Q)</span><strong>$' + fmt(rev, 0) + '</strong></div>' +
      '<div class="lab-bar-track"><div class="lab-bar-fill green" style="width:' + Math.round((rev / maxV) * 100) + '%"></div></div>' +
      '<div class="lab-bar-row"><span>Costo total (CF + CVu × Q)</span><strong>$' + fmt(cost, 0) + '</strong></div>' +
      '<div class="lab-bar-track"><div class="lab-bar-fill red" style="width:' + Math.round((cost / maxV) * 100) + '%"></div></div>' +
      '</div>' +
      '<div class="lab-verdict ' + (profit >= 0 ? 'ok' : 'warn') + '">' +
      (marginU <= 0
        ? '⚠️ El precio ($' + price + ') debe superar el CVu ($' + cv + ') para alcanzar equilibrio.'
        : 'Punto de equilibrio: <strong>' + Math.ceil(qStar) + ' u</strong> · Resultado actual: <strong>' + (profit >= 0 ? '+$' : '-$') + fmt(Math.abs(profit), 0) + '</strong>') +
      '</div>';
  }

  controls.appendChild(makeRangeControl('Costos Fijos (CF)', 2000, 25000, 1000, cf, (v) => '$' + fmt(v, 0), (v) => { cf = v; update(); }));
  controls.appendChild(makeRangeControl('Costo Variable Unit. (CVu)', 10, 80, 5, cv, (v) => '$' + v, (v) => { cv = v; update(); }));
  controls.appendChild(makeRangeControl('Precio de Venta (P)', 20, 120, 5, price, (v) => '$' + v, (v) => { price = v; update(); }));
  controls.appendChild(makeRangeControl('Volumen vendido (Q)', 100, 1500, 50, qty, (v) => v + ' u', (v) => { qty = v; update(); }));

  body.appendChild(controls);
  body.appendChild(out);
  update();
}

function renderEvalTechniquesLab(body) {
  let inv = 25000, fen = 8000, res = 5000, n = 5, tmar = 20;
  const controls = el('div', 'lab-controls');
  const out = el('div', 'lab-output');

  function update() {
    const ii = tmar / 100;
    const pa = (Math.pow(1 + ii, n) - 1) / (ii * Math.pow(1 + ii, n));
    const pf = Math.pow(1 + ii, -n);
    const fp = Math.pow(1 + ii, n);
    const ap = 1 / pa;
    const vpn = -inv + fen * pa + res * pf;
    const vfn = vpn * fp;
    const va = vpn * ap;
    const priSimple = fen > 0 ? inv / fen : Infinity;

    out.innerHTML =
      '<div class="formula-box">' +
      '<div class="formula-expr">VPN = $' + fmt(vpn) + '  |  VFN = $' + fmt(vfn) + '  |  VA = $' + fmt(va) + '</div>' +
      '<div class="formula-desc">PRI Simple (i=0%): <strong>' + (priSimple === Infinity ? '∞' : priSimple.toFixed(1) + ' años') + '</strong> · TMAR: ' + tmar + '%</div>' +
      '</div>' +
      '<div class="lab-verdict ' + (vpn >= 0 ? 'ok' : 'warn') + '">' +
      (vpn >= 0 ? '✅ Proyecto ACEPTABLE: VPN, VFN y VA ≥ 0 (supera la TMAR).' : '⚠️ Proyecto RECHAZADO: VPN < 0 (no alcanza la TMAR del ' + tmar + '%).') +
      '</div>';
  }

  controls.appendChild(makeRangeControl('Inversión inicial (I₀)', 5000, 60000, 2500, inv, (v) => '$' + fmt(v, 0), (v) => { inv = v; update(); }));
  controls.appendChild(makeRangeControl('Flujo Neto Anual (FEN)', 2000, 20000, 500, fen, (v) => '$' + fmt(v, 0), (v) => { fen = v; update(); }));
  controls.appendChild(makeRangeControl('Valor de rescate (S)', 0, 15000, 1000, res, (v) => '$' + fmt(v, 0), (v) => { res = v; update(); }));
  controls.appendChild(makeRangeControl('TMAR (i%)', 5, 30, 1, tmar, (v) => v + '%', (v) => { tmar = v; update(); }));

  body.appendChild(controls);
  body.appendChild(out);
  update();
}

function renderCompareAltsLab(body) {
  let lifeMode = 'equal', tmar = 12;
  const tabs = el('div', 'plan-tabs');
  const controls = el('div', 'lab-controls');
  const out = el('div', 'lab-output');

  const modes = [
    { id: 'equal', label: 'Vidas iguales (5 años)' },
    { id: 'diff', label: 'Vidas diferentes (4, 6, 8 años)' },
  ];

  function update() {
    const ii = tmar / 100;
    tabs.querySelectorAll('.plan-tab').forEach((t, idx) => t.classList.toggle('active', modes[idx].id === lifeMode));
    const alts = lifeMode === 'equal'
      ? [
          { name: 'Máquina A', inv: 50000, flow: 18000, n: 5 },
          { name: 'Máquina B', inv: 65000, flow: 22000, n: 5 },
          { name: 'Máquina C', inv: 80000, flow: 26000, n: 5 },
        ]
      : [
          { name: 'Máquina A (4a)', inv: 50000, flow: 18000, n: 4 },
          { name: 'Máquina B (6a)', inv: 65000, flow: 22000, n: 6 },
          { name: 'Máquina C (8a)', inv: 80000, flow: 26000, n: 8 },
        ];

    const results = alts.map((a) => {
      const pa = (Math.pow(1 + ii, a.n) - 1) / (ii * Math.pow(1 + ii, a.n));
      const ap = 1 / pa;
      const vpn = -a.inv + a.flow * pa;
      const va = -a.inv * ap + a.flow;
      return { name: a.name, metric: lifeMode === 'equal' ? vpn : va };
    });

    const best = results.reduce((prev, cur) => (cur.metric > prev.metric ? cur : prev), results[0]);
    const labelMetric = lifeMode === 'equal' ? 'VPN' : 'VA';

    out.innerHTML =
      '<div class="formula-box">' +
      '<div class="formula-expr">' + results.map((r) => r.name.split(' ')[1] + ': ' + labelMetric + ' = $' + fmt(r.metric, 0)).join('  |  ') + '</div>' +
      '<div class="formula-desc">Criterio recomendado: <strong>' + (lifeMode === 'equal' ? 'Mayor VPN (vidas iguales)' : 'Mayor VA o MCM = 24 años (vidas diferentes)') + '</strong></div>' +
      '</div>' +
      '<div class="lab-verdict ok">🏆 Mejor alternativa a TMAR ' + tmar + '%: <strong>' + best.name + '</strong> (' + labelMetric + ' = $' + fmt(best.metric) + ').</div>';
  }

  modes.forEach((m) => {
    const btn = el('button', 'plan-tab');
    btn.type = 'button';
    btn.textContent = m.label;
    btn.addEventListener('click', () => { lifeMode = m.id; update(); });
    tabs.appendChild(btn);
  });

  controls.appendChild(makeRangeControl('TMAR de evaluación', 6, 20, 1, tmar, (v) => v + '%', (v) => { tmar = v; update(); }));
  body.appendChild(tabs);
  body.appendChild(controls);
  body.appendChild(out);
  update();
}

/* ===================== SIMULATION LEVEL RUNTIME ===================== */

function startLesson(levelId) {
  const level = SIM_LEVELS.find((l) => l.id === levelId);
  if (!level) return;
  const startingCap = state.companyCapital !== undefined ? state.companyCapital : INITIAL_COMPANY_CAPITAL;
  session = {
    level,
    rounds: level.rounds,
    index: 0,
    hearts: 3,
    mistakes: 0,
    xpEarned: 0,
    startCapital: startingCap,
    capital: startingCap,
    phase: 'answering',
    selectedIdx: -1,
  };
  renderSimScreen();
}

function exitLesson() {
  session = null;
  renderHome();
}

function renderSimScreen() {
  root.innerHTML = '';
  const screen = el('div', 'lesson-screen' + (session.level.isBoss ? ' boss-mode' : ''));

  const topbar = el('div', 'lesson-topbar');
  const closeBtn = el('button', 'icon-btn');
  closeBtn.type = 'button';
  closeBtn.innerHTML = '✕';
  closeBtn.addEventListener('click', () => {
    if (confirm('¿Salir de la simulación? Perderás el progreso de este nivel.')) exitLesson();
  });

  const track = el('div', 'progress-track');
  const fill = el('div', 'progress-fill');
  fill.style.transform = 'scaleX(' + (session.index + 1) / session.rounds.length + ')';
  track.appendChild(fill);

  const capPill = el('div', 'sim-cap-pill');
  capPill.textContent = '💰 $' + fmt(session.capital, 0);

  const hearts = el('div', 'hearts');
  const h = Math.max(session.hearts, 0);
  hearts.textContent = '❤️'.repeat(h) + '🖤'.repeat(3 - h);

  topbar.appendChild(closeBtn);
  topbar.appendChild(track);
  topbar.appendChild(capPill);
  topbar.appendChild(hearts);
  screen.appendChild(topbar);

  const body = el('div', 'lesson-body');
  const round = session.rounds[session.index];

  const kicker = el('div', 'exercise-kicker');
  kicker.textContent = (session.level.isBoss ? '👑 ' : '') + session.level.title + ' · ' + round.tag;
  const title = el('div', 'exercise-question');
  title.textContent = round.title;
  const scenario = el('div', 'exercise-statement sim-scenario');
  scenario.textContent = round.scenario;

  const optsWrap = el('div', 'options-grid');
  const optionBtns = round.options.map((opt, idx) => {
    const b = el('button', 'option-btn sim-decision-btn');
    b.type = 'button';
    b.innerHTML =
      '<div class="sim-opt-label">' + opt.label + '</div>' +
      '<div class="sim-opt-detail">' + opt.detail + '</div>';
    b.addEventListener('click', () => {
      if (session.phase === 'checked') return;
      session.selectedIdx = idx;
      optionBtns.forEach((bb) => bb.classList.remove('selected'));
      b.classList.add('selected');
      actionBtn.disabled = false;
    });
    optsWrap.appendChild(b);
    return b;
  });

  body.appendChild(kicker);
  body.appendChild(title);
  body.appendChild(scenario);
  body.appendChild(optsWrap);
  screen.appendChild(body);

  const footer = el('div', 'lesson-footer');
  const feedbackMsg = el('div', 'footer-feedback');
  const inner = el('div', 'inner');
  const actionBtn = el('button', 'btn-3d');
  actionBtn.type = 'button';
  actionBtn.textContent = 'EJECUTAR DECISIÓN';
  actionBtn.disabled = true;

  actionBtn.addEventListener('click', () => {
    if (session.phase === 'checked') {
      if (session.hearts <= 0) {
        failLesson();
        return;
      }
      session.index += 1;
      if (session.index >= session.rounds.length) {
        finishLesson();
        return;
      }
      session.phase = 'answering';
      session.selectedIdx = -1;
      renderSimScreen();
      return;
    }

    const chosen = round.options[session.selectedIdx];
    session.phase = 'checked';
    session.capital = Math.max(0, session.capital + chosen.impact);
    capPill.textContent = '💰 $' + fmt(session.capital, 0);
    capPill.classList.add(chosen.correct ? 'gain' : 'loss');

    optionBtns.forEach((b, i) => {
      b.disabled = true;
      if (round.options[i].correct) b.classList.add('correct');
      else if (i === session.selectedIdx) b.classList.add('incorrect');
    });

    if (chosen.correct) {
      session.xpEarned += 10;
    } else {
      session.mistakes += 1;
      session.hearts -= 1;
      const nh = Math.max(session.hearts, 0);
      hearts.textContent = '❤️'.repeat(nh) + '🖤'.repeat(3 - nh);
      if (session.hearts <= 0) {
        setTimeout(() => { failLesson(); }, 450);
        return;
      }
    }

    const impactStr = (chosen.impact >= 0 ? '+$' : '-$') + fmt(Math.abs(chosen.impact), 0);
    footer.className = 'lesson-footer ' + (chosen.correct ? 'fb-correct' : 'fb-incorrect');
    feedbackMsg.className = 'footer-feedback show';
    feedbackMsg.innerHTML =
      '<div class="feedback-title">' + (chosen.correct ? '✅ Decisión óptima (' + impactStr + ')' : '❌ Pérdida de valor (' + impactStr + ')') + '</div>' +
      '<div class="feedback-note">' + chosen.explain + '</div>';

    actionBtn.textContent = session.index === session.rounds.length - 1 ? 'VER RESULTADO FINAL' : 'SIGUIENTE RONDA →';
    actionBtn.className = chosen.correct ? 'btn-3d' : 'btn-3d danger';
  });

  inner.appendChild(actionBtn);
  footer.appendChild(feedbackMsg);
  footer.appendChild(inner);
  screen.appendChild(footer);
  root.appendChild(screen);
}

function finishLesson() {
  const stars = starsForMistakes(session.mistakes);
  const lvl = session.level;
  const prev = state.lessons[lvl.id];
  const bestStars = prev ? Math.max(prev.stars, stars) : stars;
  state.companyCapital = session.capital;
  state.xp += session.xpEarned;
  state.lessons[lvl.id] = { completed: true, stars: bestStars, bestCapital: session.capital };
  const streakBumped = registerStreak();
  saveState();
  renderSummary(stars, streakBumped);
}

function renderSummary(stars, streakBumped) {
  const lvl = session.level;
  const baseCap = session.startCapital || 1;
  const growth = Math.round(((session.capital - baseCap) / baseCap) * 100);
  const growthStr = (growth >= 0 ? '+' : '') + growth + '%';

  root.innerHTML = '';
  const wrap = el('div', 'lesson-screen');
  const content = el('div', 'summary-screen');
  content.innerHTML =
    '<div class="summary-mascot">' + (lvl.isBoss ? '👑' : stars === 3 ? '🏆' : stars === 2 ? '🎉' : '✅') + '</div>' +
    '<h2>' + (lvl.isBoss ? '¡Venciste al Boss Final! Eres CFO Maestro' : '¡Nivel empresarial superado!') + '</h2>' +
    '<p class="summary-sub">' + lvl.icon + ' ' + lvl.title + '</p>' +
    '<div class="summary-stats">' +
    '<div class="summary-stat"><div class="value">$' + fmt(session.capital, 0) + '</div><div class="label">Capital (' + growthStr + ')</div></div>' +
    '<div class="summary-stat"><div class="value">' + '⭐'.repeat(stars) + '☆'.repeat(3 - stars) + '</div><div class="label">Estrellas</div></div>' +
    '<div class="summary-stat"><div class="value">+' + session.xpEarned + '</div><div class="label">XP ganado</div></div>' +
    '</div>';
  const btn = el('button', 'btn-3d');
  btn.textContent = 'CONTINUAR';
  btn.addEventListener('click', () => {
    session = null;
    activeTab = 'practice';
    renderHome();
    if (streakBumped) showToast('🔥 ¡Racha +1 día!');
  });
  content.appendChild(btn);
  wrap.appendChild(content);
  root.appendChild(wrap);
}

function failLesson() {
  const lvl = session.level;
  if (state.lessons[lvl.id]) {
    delete state.lessons[lvl.id];
    saveState();
  }
  const recMods = (lvl.recommendedModules || [])
    .map((id) => STUDY_MODULES.find((m) => m.id === id))
    .filter(Boolean);

  session = null;
  root.innerHTML = '';
  const wrap = el('div', 'lesson-screen');
  const content = el('div', 'fail-screen');
  content.innerHTML =
    '<div class="emoji">📉</div>' +
    '<h2>¡Agotaste tus 3 vidas!</h2>' +
    '<p>Saliste del nivel <strong>' + lvl.title + '</strong> y se reinició como si no lo hubieras jugado. Tu capital sigue en <strong>$' + fmt(state.companyCapital !== undefined ? state.companyCapital : INITIAL_COMPANY_CAPITAL, 0) + '</strong>.</p>' +
    '<div class="fail-rec-box">' +
    '<div class="fail-rec-title">📖 Te recomendamos repasar estas lecciones antes de volver a intentarlo:</div>' +
    '<div class="fail-rec-list"></div>' +
    '</div>';

  const recList = content.querySelector('.fail-rec-list');
  recMods.forEach((mod) => {
    const b = el('button', 'fail-rec-btn');
    b.type = 'button';
    b.innerHTML = '<span>' + mod.icon + ' ' + mod.title + '</span><span>Repasar →</span>';
    b.addEventListener('click', () => {
      activeTab = 'learn';
      activeModuleId = mod.id;
      activeModuleStep = 0;
      renderHome();
      window.scrollTo(0, 0);
    });
    recList.appendChild(b);
  });

  const exitBtn = el('button', 'btn-3d secondary');
  exitBtn.textContent = 'VOLVER A PRACTICAR';
  exitBtn.addEventListener('click', () => {
    activeTab = 'practice';
    renderHome();
  });
  content.appendChild(exitBtn);
  wrap.appendChild(content);
  root.appendChild(wrap);
}

/* ===================== EXERCISE RENDERERS ===================== */

function renderExercise(ex, body, actionBtn) {
  actionBtn.style.display = '';
  actionBtn.textContent = 'COMPROBAR';
  actionBtn.className = 'btn-3d';
  actionBtn.disabled = true;

  if (ex.type === 'mc') return renderMC(ex, body, actionBtn);
  if (ex.type === 'fib') return renderFIB(ex, body, actionBtn);
  if (ex.type === 'step') return renderStep(ex, body, actionBtn);
  if (ex.type === 'challenge') return renderChallenge(ex, body, actionBtn);
  if (ex.type === 'match') {
    actionBtn.style.display = 'none';
    return renderMatch(ex, body, {
      onMismatch: loseHeart,
      onComplete: completeMatchExercise,
    });
  }
  return { check: () => ({ finalize: true, correct: true }) };
}

function renderMC(ex, body, actionBtn) {
  body.innerHTML = '';
  const kicker = el('div', 'exercise-kicker');
  kicker.textContent = 'Selecciona una opción';
  const q = el('div', 'exercise-question');
  q.textContent = ex.question;
  const grid = el('div', 'options-grid');

  let selected = -1;
  let finalized = false;
  const buttons = ex.options.map((opt, i) => {
    const b = el('button', 'option-btn');
    b.textContent = opt;
    b.addEventListener('click', () => {
      if (finalized) return;
      selected = i;
      buttons.forEach((bb) => bb.classList.remove('selected'));
      b.classList.add('selected');
      actionBtn.disabled = false;
    });
    grid.appendChild(b);
    return b;
  });

  body.appendChild(kicker);
  body.appendChild(q);
  body.appendChild(grid);

  return {
    check() {
      finalized = true;
      const correct = selected === ex.answer;
      buttons.forEach((b, i) => {
        b.disabled = true;
        if (i === ex.answer) b.classList.add('correct');
        else if (i === selected) b.classList.add('incorrect');
      });
      return { finalize: true, correct, explain: ex.options[ex.answer] };
    },
  };
}

function renderFIB(ex, body, actionBtn) {
  body.innerHTML = '';
  const kicker = el('div', 'exercise-kicker');
  kicker.textContent = 'Completa el texto';
  const textEl = el('div', 'fib-text');
  const parts = ex.text.split(/\{\{(\d+)\}\}/);
  const blankEls = [];
  const filled = new Array(ex.blanks.length).fill(null);
  let finalized = false;

  parts.forEach((part, idx) => {
    if (idx % 2 === 0) {
      textEl.appendChild(document.createTextNode(part));
      return;
    }
    const bi = parseInt(part, 10);
    const span = el('span', 'fib-blank');
    span.textContent = '_____';
    span.addEventListener('click', () => {
      if (finalized || filled[bi] === null) return;
      const chip = filled[bi];
      filled[bi] = null;
      span.textContent = '_____';
      span.classList.remove('filled');
      chip.classList.remove('used');
      updateReady();
    });
    blankEls[bi] = span;
    textEl.appendChild(span);
  });

  const bank = el('div', 'word-bank');
  const chips = shuffle(ex.bank.slice()).map((word) => {
    const chip = el('button', 'word-chip');
    chip.textContent = word;
    chip.addEventListener('click', () => {
      if (finalized || chip.classList.contains('used')) return;
      const nextBlank = filled.findIndex((f) => f === null);
      if (nextBlank === -1) return;
      filled[nextBlank] = chip;
      blankEls[nextBlank].textContent = word;
      blankEls[nextBlank].classList.add('filled');
      chip.classList.add('used');
      updateReady();
    });
    bank.appendChild(chip);
    return chip;
  });

  function updateReady() {
    actionBtn.disabled = filled.some((f) => f === null);
  }

  body.appendChild(kicker);
  body.appendChild(textEl);
  body.appendChild(bank);

  return {
    check() {
      finalized = true;
      chips.forEach((c) => { c.style.pointerEvents = 'none'; });
      let correct = true;
      filled.forEach((chip, i) => {
        const expected = ex.blanks[i].trim().toLowerCase();
        const got = (chip ? chip.textContent : '').trim().toLowerCase();
        if (got !== expected) {
          correct = false;
          blankEls[i].style.color = 'var(--color-danger-dark)';
          blankEls[i].style.borderColor = 'var(--color-danger)';
        } else {
          blankEls[i].style.color = 'var(--color-primary-dark)';
          blankEls[i].style.borderColor = 'var(--color-primary)';
        }
      });
      return { finalize: true, correct, explain: ex.blanks.join(', ') };
    },
  };
}

function renderMatch(ex, body, hooks) {
  body.innerHTML = '';
  const kicker = el('div', 'exercise-kicker');
  kicker.textContent = 'Une cada par';
  const q = el('div', 'exercise-question');
  q.textContent = 'Relaciona cada elemento con su pareja correcta';
  const wrap = el('div', 'match-wrap');

  const leftItems = shuffle(ex.pairs.map((p, i) => ({ id: i, text: p.left })));
  const rightItems = shuffle(ex.pairs.map((p, i) => ({ id: i, text: p.right })));

  let selectedLeft = null;
  let matchedCount = 0;

  function makeItem(itemObj, side) {
    const b = el('button', 'match-item');
    b.textContent = itemObj.text;
    b.addEventListener('click', () => {
      if (b.classList.contains('matched')) return;
      if (side === 'left') {
        wrap.querySelectorAll('.match-item').forEach((x) => { if (x.dataset.side === 'left') x.classList.remove('selected'); });
        b.classList.add('selected');
        selectedLeft = { id: itemObj.id, el: b };
        return;
      }
      if (selectedLeft === null) return;
      if (selectedLeft.id === itemObj.id) {
        selectedLeft.el.classList.remove('selected');
        selectedLeft.el.classList.add('matched');
        b.classList.add('matched');
        selectedLeft.el.disabled = true;
        b.disabled = true;
        selectedLeft = null;
        matchedCount += 1;
        if (matchedCount === ex.pairs.length) hooks.onComplete();
      } else {
        const leftEl = selectedLeft.el;
        b.classList.add('wrong');
        leftEl.classList.add('wrong');
        setTimeout(() => {
          b.classList.remove('wrong');
          leftEl.classList.remove('wrong', 'selected');
        }, 300);
        selectedLeft = null;
        hooks.onMismatch();
      }
    });
    b.dataset.side = side;
    return b;
  }

  for (let i = 0; i < ex.pairs.length; i++) {
    wrap.appendChild(makeItem(leftItems[i], 'left'));
    wrap.appendChild(makeItem(rightItems[i], 'right'));
  }

  body.appendChild(kicker);
  body.appendChild(q);
  body.appendChild(wrap);

  return { check: () => ({ finalize: true, correct: true }) };
}

function renderStep(ex, body, actionBtn) {
  body.innerHTML = '';
  const kicker = el('div', 'exercise-kicker');
  kicker.textContent = 'Extrae los datos y sustituye en la fórmula';
  const statement = el('div', 'exercise-statement');
  statement.textContent = ex.statement;
  const grid = el('div', 'var-grid');
  const inputs = {};
  const fieldWraps = {};

  ex.fields.forEach((f) => {
    const wrap = el('div', 'var-field');
    const label = document.createElement('label');
    label.innerHTML = f.label + ' <span class="symbol">(' + f.symbol + ')</span>';
    const input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.placeholder = (f.prefix || '') + '…' + (f.suffix || '');
    input.addEventListener('input', updateReady);
    wrap.appendChild(label);
    wrap.appendChild(input);
    grid.appendChild(wrap);
    inputs[f.key] = input;
    fieldWraps[f.key] = wrap;
  });

  const revealHost = el('div');
  body.appendChild(kicker);
  body.appendChild(statement);
  body.appendChild(grid);
  body.appendChild(revealHost);

  function updateReady() {
    actionBtn.disabled = ex.fields.some((f) => inputs[f.key].value.trim() === '');
  }

  return {
    check() {
      let allOk = true;
      const vals = {};
      ex.fields.forEach((f) => {
        const raw = parseFloat(inputs[f.key].value);
        vals[f.key] = raw;
        const ok = !isNaN(raw) && Math.abs(raw - f.answer) <= (f.tolerance || 0);
        fieldWraps[f.key].classList.remove('correct', 'incorrect');
        fieldWraps[f.key].classList.add(ok ? 'correct' : 'incorrect');
        if (!ok) allOk = false;
      });
      if (!allOk) return { retry: true };

      const r = ex.reveal(vals);
      const panel = el('div', 'formula-reveal');
      panel.innerHTML =
        '<div class="label">Sustitución</div><div class="expr">' + r.expr + '</div><div class="result">' + r.result + '</div>';
      revealHost.innerHTML = '';
      revealHost.appendChild(panel);
      ex.fields.forEach((f) => { inputs[f.key].disabled = true; });
      return { finalize: true, correct: true, isStep: true };
    },
  };
}

function renderChallenge(ex, body, actionBtn) {
  body.innerHTML = '';
  const kicker = el('div', 'exercise-kicker');
  kicker.textContent = 'Desafío: extrae los datos y calcula';
  const statement = el('div', 'exercise-statement');
  statement.textContent = ex.statement;
  const grid = el('div', 'var-grid');
  const inputs = {};
  const fieldWraps = {};
  const allFields = ex.fields.concat([ex.final]);

  allFields.forEach((f) => {
    const wrap = el('div', 'var-field');
    const label = document.createElement('label');
    label.innerHTML = f.label + ' <span class="symbol">(' + f.symbol + ')</span>';
    const input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.placeholder = (f.prefix || '') + '…' + (f.suffix || '');
    input.addEventListener('input', updateReady);
    wrap.appendChild(label);
    wrap.appendChild(input);
    grid.appendChild(wrap);
    inputs[f.key] = input;
    fieldWraps[f.key] = wrap;
  });

  const revealHost = el('div');
  body.appendChild(kicker);
  body.appendChild(statement);
  body.appendChild(grid);
  body.appendChild(revealHost);

  function updateReady() {
    actionBtn.disabled = allFields.some((f) => inputs[f.key].value.trim() === '');
  }

  return {
    check() {
      let allOk = true;
      allFields.forEach((f) => {
        const raw = parseFloat(inputs[f.key].value);
        const ok = !isNaN(raw) && Math.abs(raw - f.answer) <= (f.tolerance || 0);
        fieldWraps[f.key].classList.add(ok ? 'correct' : 'incorrect');
        inputs[f.key].disabled = true;
        if (!ok) allOk = false;
      });
      if (!allOk) {
        const panel = el('div', 'solution-steps');
        panel.innerHTML = '<div class="label">Así se resuelve</div><ol>' + ex.steps.map((s) => '<li>' + s + '</li>').join('') + '</ol>';
        revealHost.innerHTML = '';
        revealHost.appendChild(panel);
      }
      return { finalize: true, correct: allOk, xp: allOk ? 10 : 0 };
    },
  };
}

/* ===================== INIT ===================== */

renderHome();
