const STORAGE_KEY = 'duonomica_state_v1';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function defaultState() {
  return { xp: 0, streak: 0, lastActiveDate: null, lessons: {} };
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
  const prev = LESSONS[idx - 1];
  return !!(state.lessons[prev.id] && state.lessons[prev.id].completed);
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

/* ===================== HOME / PATH ===================== */

function renderHome() {
  root.innerHTML = '';
  const header = el('header', 'app-header');
  header.innerHTML =
    '<div class="brand"><span class="logo-dot">💹</span>Duonomica</div>' +
    '<div class="stat-pills">' +
    '<div class="stat-pill xp"><span class="emoji">⭐</span>' + state.xp + ' XP</div>' +
    '<div class="stat-pill streak"><span class="emoji">🔥</span>' + state.streak + '</div>' +
    '</div>';
  root.appendChild(header);

  const path = el('main', 'path-screen');
  TEMAS.forEach((tema) => {
    const banner = el('div', 'tema-banner');
    banner.innerHTML = '<div class="tema-kicker">' + tema.title + '</div><h2>' + tema.subtitle + '</h2>';
    path.appendChild(banner);

    const pathWrap = el('div', 'path');
    LESSONS.filter((l) => l.temaId === tema.id).forEach((lesson) => {
      const globalIdx = LESSONS.indexOf(lesson);
      const unlocked = isLessonUnlocked(globalIdx);
      const progress = state.lessons[lesson.id];

      const wrap = el('div', 'path-node-wrap');
      const node = el('button', 'path-node');
      const cycle = globalIdx % 4;
      if (cycle === 1) node.dataset.offset = 'right';
      if (cycle === 3) node.dataset.offset = 'left';
      node.textContent = lesson.icon;
      if (!unlocked) {
        node.classList.add('locked');
      } else if (progress && progress.completed) {
        node.classList.add('done');
      }
      node.disabled = !unlocked;
      node.addEventListener('click', () => { if (unlocked) startLesson(lesson.id); });

      if (progress && progress.completed) {
        const stars = el('div', 'stars');
        stars.textContent = '⭐'.repeat(progress.stars) + '☆'.repeat(3 - progress.stars);
        node.appendChild(stars);
      }

      wrap.appendChild(node);
      const label = el('div', 'node-label');
      label.textContent = lesson.title;
      wrap.appendChild(label);
      pathWrap.appendChild(wrap);
    });
    path.appendChild(pathWrap);
  });
  root.appendChild(path);
}

/* ===================== LESSON RUNTIME ===================== */

function startLesson(lessonId) {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  session = {
    lesson,
    queue: lesson.exercises.map((ex) => ({ ex })),
    index: 0,
    hearts: 3,
    mistakes: 0,
    xpEarned: 0,
    phase: 'answering',
    checker: null,
    actionBtn: null,
    heartsEl: null,
  };
  renderLessonScreen();
}

function exitLesson() {
  session = null;
  renderHome();
}

function renderLessonScreen() {
  root.innerHTML = '';
  const screen = el('div', 'lesson-screen');

  const topbar = el('div', 'lesson-topbar');
  const closeBtn = el('button', 'icon-btn');
  closeBtn.innerHTML = '✕';
  closeBtn.addEventListener('click', () => {
    if (confirm('¿Salir de la lección? Perderás el progreso de este intento.')) exitLesson();
  });
  const track = el('div', 'progress-track');
  const fill = el('div', 'progress-fill');
  fill.style.transform = 'scaleX(' + session.index / session.queue.length + ')';
  track.appendChild(fill);
  const hearts = el('div', 'hearts');
  session.heartsEl = hearts;
  updateHeartsUI();
  topbar.appendChild(closeBtn);
  topbar.appendChild(track);
  topbar.appendChild(hearts);
  screen.appendChild(topbar);

  const body = el('div', 'lesson-body');
  screen.appendChild(body);

  const footer = el('div', 'lesson-footer');
  const feedbackMsg = el('div', 'footer-feedback');
  const inner = el('div', 'inner');
  const actionBtn = el('button', 'btn-3d');
  actionBtn.textContent = 'COMPROBAR';
  actionBtn.disabled = true;
  actionBtn.addEventListener('click', handleAction);
  inner.appendChild(actionBtn);
  footer.appendChild(feedbackMsg);
  footer.appendChild(inner);
  screen.appendChild(footer);

  root.appendChild(screen);

  session.actionBtn = actionBtn;
  session.footerEl = footer;
  session.feedbackMsgEl = feedbackMsg;
  session.checker = renderExercise(session.queue[session.index].ex, body, actionBtn);
}

function updateHeartsUI() {
  const h = Math.max(session.hearts, 0);
  session.heartsEl.innerHTML = '❤️'.repeat(h) + '🖤'.repeat(3 - h);
}

function handleAction() {
  const btn = session.actionBtn;
  if (session.phase === 'checked') {
    advance();
    return;
  }

  const result = session.checker.check();
  if (result.retry) return;

  session.phase = 'checked';

  if (result.isStep) {
    session.xpEarned += 5;
    state.xp += 5;
    saveState();
    btn.textContent = 'CONTINUAR';
    btn.className = 'btn-3d';
    btn.disabled = false;
    showFeedback(true, '¡Fórmula resuelta!', 'Observa la sustitución y el resultado arriba.');
    return;
  }

  const correct = result.correct;
  const gained = result.xp !== undefined ? result.xp : 10;
  if (correct) {
    session.xpEarned += gained;
    state.xp += gained;
    saveState();
  } else {
    session.mistakes += 1;
    session.hearts -= 1;
    updateHeartsUI();
  }

  btn.textContent = 'CONTINUAR';
  btn.className = correct ? 'btn-3d' : 'btn-3d danger';
  btn.disabled = false;

  showFeedback(
    correct,
    correct ? '¡Correcto!' : 'Incorrecto',
    correct ? '+' + gained + ' XP' : (result.explain ? 'Respuesta correcta: ' + result.explain : 'Revisa la solución mostrada arriba.')
  );
}

function loseHeart() {
  session.mistakes += 1;
  session.hearts -= 1;
  updateHeartsUI();
  if (session.hearts <= 0) setTimeout(failLesson, 400);
}

function completeMatchExercise() {
  session.phase = 'checked';
  const gained = 5;
  session.xpEarned += gained;
  state.xp += gained;
  saveState();
  const btn = session.actionBtn;
  btn.style.display = '';
  btn.textContent = 'CONTINUAR';
  btn.className = 'btn-3d';
  btn.disabled = false;
  showFeedback(true, '¡Todo emparejado!', '+' + gained + ' XP');
}

function showFeedback(correct, title, note) {
  session.footerEl.className = 'lesson-footer ' + (correct ? 'fb-correct' : 'fb-incorrect');
  session.feedbackMsgEl.className = 'footer-feedback show';
  session.feedbackMsgEl.innerHTML =
    '<div class="feedback-title">' + (correct ? '✅' : '❌') + ' ' + title + '</div>' +
    '<div class="feedback-note">' + note + '</div>';
}

function hideFeedback() {
  session.footerEl.className = 'lesson-footer';
  session.feedbackMsgEl.className = 'footer-feedback';
}

function advance() {
  if (session.hearts <= 0) {
    failLesson();
    return;
  }
  hideFeedback();
  session.index += 1;
  if (session.index >= session.queue.length) {
    finishLesson();
    return;
  }
  session.phase = 'answering';
  const body = document.querySelector('.lesson-body');
  const fill = document.querySelector('.progress-fill');
  fill.style.transform = 'scaleX(' + session.index / session.queue.length + ')';
  session.checker = renderExercise(session.queue[session.index].ex, body, session.actionBtn);
}

function finishLesson() {
  const stars = starsForMistakes(session.mistakes);
  const prev = state.lessons[session.lesson.id];
  const bestStars = prev ? Math.max(prev.stars, stars) : stars;
  state.lessons[session.lesson.id] = { completed: true, stars: bestStars };
  const streakBumped = registerStreak();
  saveState();
  renderSummary(stars, streakBumped);
}

function renderSummary(stars, streakBumped) {
  root.innerHTML = '';
  const wrap = el('div', 'lesson-screen');
  const content = el('div', 'summary-screen');
  content.innerHTML =
    '<div class="summary-mascot">' + (stars === 3 ? '🏆' : stars === 2 ? '🎉' : '✅') + '</div>' +
    '<h2>¡Lección completada!</h2>' +
    '<div class="summary-stats">' +
    '<div class="summary-stat"><div class="value">' + '⭐'.repeat(stars) + '☆'.repeat(3 - stars) + '</div><div class="label">Estrellas</div></div>' +
    '<div class="summary-stat"><div class="value">+' + session.xpEarned + '</div><div class="label">XP ganado</div></div>' +
    '<div class="summary-stat"><div class="value">' + session.mistakes + '</div><div class="label">Errores</div></div>' +
    '</div>';
  const btn = el('button', 'btn-3d');
  btn.textContent = 'CONTINUAR';
  btn.addEventListener('click', () => {
    session = null;
    renderHome();
    if (streakBumped) showToast('🔥 ¡Racha +1 día!');
  });
  content.appendChild(btn);
  wrap.appendChild(content);
  root.appendChild(wrap);
}

function failLesson() {
  const lessonId = session.lesson.id;
  root.innerHTML = '';
  const wrap = el('div', 'lesson-screen');
  const content = el('div', 'fail-screen');
  content.innerHTML = '<div class="emoji">💔</div><h2>¡Te quedaste sin corazones!</h2><p>No te preocupes, puedes intentarlo de nuevo.</p>';
  const retryBtn = el('button', 'btn-3d');
  retryBtn.textContent = 'INTENTAR DE NUEVO';
  retryBtn.addEventListener('click', () => startLesson(lessonId));
  const exitBtn = el('button', 'btn-3d secondary');
  exitBtn.textContent = 'SALIR';
  exitBtn.addEventListener('click', () => { session = null; renderHome(); });
  content.appendChild(retryBtn);
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
