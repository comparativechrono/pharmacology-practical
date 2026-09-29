/* =====================================================================
   Proteins in 3D – page shell and tutorial engine
   Chapters, ▶ buttons, auto-ticking tasks, questions, progress and
   “download my answers”. Content lives in index.html.
   ===================================================================== */
(function () {
  'use strict';
  const MG = window.MG;
  const { h, esc, bus, toast, store, $, $$ } = MG;
  const CFG = MG.config;
  const params = new URLSearchParams(location.search);
  const SHOW_ANSWERS = CFG.showModelAnswers || params.has('answers') || params.has('instructor');

  MG.app = MG.app || {};
  const MG_READY_FLAG = { ready: false };
  const state = store.get('progress', null) || { tasks: {}, answers: {}, name: '' };
  const save = MG.debounce(() => store.set('progress', state), 300);

  /* ------------------------------------------------------------------
     Workbench (right-hand side): 3D viewer / UniProt / PDB
     ------------------------------------------------------------------ */
  function initWorkbench() {
    const tabs = $$('.wb-tab');
    const panes = $$('.wb-pane');
    const narrow = () => window.matchMedia('(max-width: 1000px)').matches;
    MG.app.showWorkbench = (name, opts = {}) => {
      if (narrow() && !opts.noOpen && MG_READY_FLAG.ready) document.body.classList.add('bench-open');
      tabs.forEach((t) => {
        const on = t.dataset.wb === name;
        t.classList.toggle('on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        if (on) t.classList.remove('attn');
      });
      panes.forEach((p) => (p.hidden = p.dataset.wb !== name));
      MG.app.currentBench = name;
      if (name === 'viewer' && MG.app.viewer) setTimeout(() => MG.app.viewer.stage.handleResize(), narrow() ? 280 : 30);
      bus.emit('app:bench', { name });
    };
    tabs.forEach((t) => t.addEventListener('click', () => MG.app.showWorkbench(t.dataset.wb)));
    const fab = $('.bench-fab'), close = $('.bench-close');
    if (fab) fab.addEventListener('click', () => {
      document.body.classList.add('bench-open');
      if (MG.app.viewer && MG.app.viewer.stage) setTimeout(() => MG.app.viewer.stage.handleResize(), 280);
    });
    if (close) close.addEventListener('click', () => document.body.classList.remove('bench-open'));
    try {
      new MG.ViewerUI($('#viewerRoot'));
    } catch (e) {
      console.error(e);
      $('#viewerRoot').innerHTML = '<div class="ex-empty"><h3>The 3D viewer could not start</h3><p>This browser or computer may have 3D graphics (WebGL) switched off. Try Chrome, Edge, Firefox or Safari, and turn on “hardware acceleration” in the browser settings.</p></div>';
      const noop = () => toast('The 3D viewer is not available in this browser.', 'error');
      MG.app.vui = { run: noop, log() {}, showTab() {}, showHelp() { noop(); }, tabs: {}, views: [] };
      MG.app.viewer = { structures: [], stage: { handleResize() {} } };
      MG.commands.run = async () => noop();
    }
    MG.app.uniprot = new MG.UniProtExplorer($('#uniprotRoot'));
    MG.app.pdb = new MG.PDBExplorer($('#pdbRoot'));
    MG.app.showWorkbench('viewer');
  }

  /* resizable split */
  function initSplitter() {
    const sp = $('.splitter');
    const tut = $('.tut');
    const saved = store.get('tutWidth', null);
    if (saved) document.documentElement.style.setProperty('--tut-w', saved);
    if (!sp) return;
    let drag = false;
    sp.addEventListener('pointerdown', (e) => {
      drag = true;
      sp.classList.add('drag');
      sp.setPointerCapture(e.pointerId);
      document.body.style.userSelect = 'none';
    });
    sp.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const w = MG.clamp((e.clientX / window.innerWidth) * 100, 22, 70);
      document.documentElement.style.setProperty('--tut-w', w.toFixed(1) + '%');
    });
    const end = () => {
      if (!drag) return;
      drag = false;
      sp.classList.remove('drag');
      document.body.style.userSelect = '';
      store.set('tutWidth', getComputedStyle(document.documentElement).getPropertyValue('--tut-w').trim());
      if (MG.app.viewer) MG.app.viewer.stage.handleResize();
    };
    sp.addEventListener('pointerup', end);
    sp.addEventListener('pointercancel', end);
    sp.addEventListener('dblclick', () => {
      document.documentElement.style.setProperty('--tut-w', '42%');
      store.remove('tutWidth');
      if (MG.app.viewer) MG.app.viewer.stage.handleResize();
    });
    void tut;
  }

  /* ------------------------------------------------------------------
     Chapters
     ------------------------------------------------------------------ */
  let chapters = [];
  function initChapters() {
    chapters = $$('.chapter');
    const nav = $('.ch-nav');
    chapters.forEach((ch, k) => {
      const b = h('button.ch-tab', { type: 'button', dataset: { ch: ch.id } }, h('span.num', ch.dataset.num || String(k)), h('span', ch.dataset.title || ch.id));
      b.addEventListener('click', () => showChapter(ch.id, true));
      nav.appendChild(b);
      // next / previous buttons
      const row = h('div.next-row');
      const prev = chapters[k - 1], next = chapters[k + 1];
      row.appendChild(prev ? mkNav('← ' + (prev.dataset.title || ''), prev.id) : h('span'));
      row.appendChild(next ? mkNav((next.dataset.title || '') + ' →', next.id, true) : h('span'));
      ch.appendChild(row);
    });
    window.addEventListener('hashchange', () => routeHash());
    routeHash(true);
  }
  function mkNav(label, id, primary) {
    const b = h('button.btn' + (primary ? '.primary' : ''), { type: 'button' }, label);
    b.addEventListener('click', () => showChapter(id, true));
    return b;
  }
  function routeHash(initial) {
    const id = decodeURIComponent(location.hash.replace('#', ''));
    const ch = chapters.find((c) => c.id === id) || (id && document.getElementById(id) && document.getElementById(id).closest('.chapter'));
    if (ch) {
      showChapter(ch.id, false);
      const el = document.getElementById(id);
      if (el && el !== ch) setTimeout(() => el.scrollIntoView({ block: 'start' }), 50);
    } else if (initial) showChapter(store.get('chapter', chapters[0] && chapters[0].id), false);
  }
  function showChapter(id, push) {
    chapters.forEach((c) => (c.hidden = c.id !== id));
    $$('.ch-tab').forEach((b) => b.classList.toggle('on', b.dataset.ch === id));
    store.set('chapter', id);
    const tut = $('.tut');
    if (push) {
      history.replaceState(null, '', '#' + id);
      tut.scrollTop = 0;
      if (window.innerWidth <= 1000) $('.ch-nav').scrollIntoView({ block: 'start' });
    }
    const ch = chapters.find((c) => c.id === id);
    if (ch && ch.dataset.bench) MG.app.showWorkbench(ch.dataset.bench, { noOpen: true });
    bus.emit('app:chapter', { id });
    if (typeof evalTasks === 'function') setTimeout(() => evalTasks(null, null), 50);
  }
  MG.app.showChapter = showChapter;

  /* ------------------------------------------------------------------
     ▶ action buttons inside the tutorial
     ------------------------------------------------------------------ */
  function initActions() {
    document.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-cmd],[data-uniprot],[data-pdb],[data-bench],[data-vtab],[data-goto]');
      if (!b || !b.closest('.tut, .modal')) return;
      e.preventDefault();
      if (b.dataset.goto) {
        const ch = document.getElementById(b.dataset.goto);
        if (ch && ch.classList.contains('chapter')) showChapter(ch.id, true);
        else if (ch) {
          showChapter(ch.closest('.chapter').id, true);
          setTimeout(() => ch.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
        }
        return;
      }
      if (b.dataset.bench) MG.app.showWorkbench(b.dataset.bench);
      if (b.dataset.vtab) {
        MG.app.showWorkbench('viewer');
        MG.app.vui.showTab(b.dataset.vtab);
        flash(MG.app.vui.tabs[b.dataset.vtab]);
      }
      if (b.dataset.cmd) {
        b.classList.add('running');
        MG.app.showWorkbench('viewer');
        try {
          await MG.commands.run(b.dataset.cmd, { prefix: '▶ ' });
        } finally {
          b.classList.remove('running');
        }
      }
      if (b.dataset.uniprot) {
        const [kind, ...rest] = b.dataset.uniprot.split(':');
        const arg = rest.join(':');
        const U = MG.app.uniprot;
        if (kind === 'search') await U.search(arg, { reviewed: b.dataset.reviewed === 'true', human: b.dataset.human === 'true' });
        else if (kind === 'entry') await U.open(arg.split('#')[0], arg.split('#')[1]);
        else if (kind === 'section') U.section(arg);
        else if (kind === 'show3d') {
          const [acc, range, ...lab] = arg.split('|');
          const ranges = range.split(',').map((r) => r.split('-').map(Number)).map((x) => (x.length === 1 ? [x[0], x[0]] : x));
          await MG.uniprotShow3D(acc, ranges, lab.join('|') || 'Residues ' + range);
        }
      }
      if (b.dataset.pdb) {
        const [kind, ...rest] = b.dataset.pdb.split(':');
        const arg = rest.join(':');
        const P = MG.app.pdb;
        if (kind === 'entry') await P.entry(arg);
        else if (kind === 'search') {
          const o = {};
          ['mode', 'sort', 'method'].forEach((k) => b.dataset[k] && (o[k] = b.dataset[k]));
          if (b.dataset.human) o.human = b.dataset.human === 'true';
          if (b.dataset.dna) o.dna = b.dataset.dna === 'true';
          await P.search(arg, o);
        } else if (kind === 'file') {
          await P.entry(arg);
          const sec = Array.from(P.body.querySelectorAll('.sec')).pop();
          if (sec) {
            await P.fileText(arg, sec);
            sec.scrollIntoView({ block: 'start' });
          }
        } else if (kind === 'coverage') P.coverage(arg);
      }
    });
  }
  function flash(el) {
    if (!el) return;
    el.classList.add('flash-attn');
    setTimeout(() => el.classList.remove('flash-attn'), 1400);
  }

  /* ------------------------------------------------------------------
     Tasks (tick automatically when the matching thing happens)
     ------------------------------------------------------------------ */
  const taskEls = [];
  function parseSpec(spec) {
    return spec.split('||').map((one) => {
      const parts = one.trim().split(/\s+(?=[a-zA-Z_]+[=~<>])/);
      const ev = parts.shift();
      const conds = parts.map((p) => {
        const m = /^([a-zA-Z_]+)([=~<>])(.*)$/.exec(p.trim());
        return m ? { k: m[1], op: m[2], v: m[3] } : null;
      }).filter(Boolean);
      return { ev, conds };
    });
  }
  function matches(spec, type, d) {
    return spec.some((s) => s.ev === type && s.conds.every((c) => {
      const val = d[c.k];
      if (c.op === '=') return String(val).toLowerCase() === c.v.toLowerCase();
      if (c.op === '~') return String(val || '').toLowerCase().includes(c.v.toLowerCase());
      if (c.op === '>') return Number(val) > Number(c.v);
      if (c.op === '<') return Number(val) < Number(c.v);
      return false;
    }));
  }
  function initTasks() {
    $$('[data-task]').forEach((li) => {
      const id = li.dataset.task;
      const cb = h('input', { type: 'checkbox', 'aria-label': 'Mark as done' });
      const lab = h('label.task-check', { title: 'Tick when done' }, cb, h('span', 'done'));
      li.prepend(lab);
      if (li.dataset.auto || li.dataset.check) lab.title = 'Ticks itself when you do it – or tick it yourself';
      cb.addEventListener('change', () => setTask(id, cb.checked, false));
      const t = { id, li, cb, spec: li.dataset.auto ? parseSpec(li.dataset.auto) : null, check: li.dataset.check || null };
      taskEls.push(t);
      if (state.tasks[id]) mark(t, true);
    });
    bus.on('*', (d, type) => {
      if (type === 'viewer:rendered' || type === 'viewer:hover' || type === 'viewer:busy') return;
      evalTasks(type, d);
    });
  }
  /* Tasks only tick for the chapter the student is reading, so that e.g. loading 3FXI
     in the warm-up does not tick the same step in a later chapter. */
  function evalTasks(type, d) {
    const active = chapters.find((c) => !c.hidden);
    taskEls.forEach((t) => {
      if (state.tasks[t.id]) return;
      if (active && !active.contains(t.li)) return;
      let ok = false;
      if (t.spec && type && matches(t.spec, type, d || {})) ok = true;
      if (!ok && t.check) {
        const [name, arg] = t.check.split(':');
        const fn = MG.checks[name];
        if (fn) {
          try {
            ok = !!fn(type, d || {}, arg);
          } catch (e) {
            ok = false;
          }
        }
      }
      if (ok) setTask(t.id, true, true);
    });
  }
  function mark(t, on, auto) {
    t.cb.checked = on;
    t.li.classList.toggle('task-done', on);
    if (auto && on && !t.li.querySelector('.auto-tag')) t.li.querySelector('.task-check').appendChild(h('span.auto-tag', '✓ spotted'));
  }
  function setTask(id, on, auto) {
    const t = taskEls.find((x) => x.id === id);
    if (!t) return;
    if (on) state.tasks[id] = auto ? 'auto' : true;
    else delete state.tasks[id];
    mark(t, on, auto);
    save();
    updateProgress();
  }

  /* state checks used by data-check="…" */
  const V = () => MG.app.viewer;
  const findSt = (id) => V().structures.find((s) => (s.source.id || '').toUpperCase() === id);
  const chainVis = (st, c) => {
    const ch = st.chains.find((x) => x.name === c);
    return ch ? V().visibleFraction(st, ch.atoms) : -1;
  };
  const coverage = (st, atoms, type) => {
    let on = 0;
    atoms.forEach((a) => (on += st.masks[type][a] && !st.hidden[a] ? 1 : 0));
    return atoms.length ? on / atoms.length : 0;
  };
  const group = (st, short) => st.groups.find((g) => g.short.toLowerCase() === short.toLowerCase());
  MG.checks = {
    loaded: (type, d, id) => !!findSt(String(id || '').toUpperCase()) || (id === 'alphafold' && V().structures.some((s) => s.kind === 'alphafold')),
    oneCopy3FXI: () => {
      const st = findSt('3FXI');
      return st && chainVis(st, 'B') === 0 && chainVis(st, 'D') === 0 && chainVis(st, 'A') > 0 && chainVis(st, 'C') > 0;
    },
    oneCopy4KXF: () => {
      const st = findSt('4KXF');
      if (!st) return false;
      const vis = st.chains.filter((c) => V().visibleFraction(st, c.atoms) > 0);
      return vis.length === 1;
    },
    md2Surface: () => {
      const st = findSt('3FXI');
      if (!st) return false;
      const c = st.chains.find((x) => x.name === 'C');
      return c && coverage(st, c.atoms, 'glass') + coverage(st, c.atoms, 'surface') > 0.5;
    },
    lpsShown: () => {
      const st = findSt('3FXI');
      const g = st && group(st, 'LPS');
      return g && coverage(st, g.atoms, 'spheres') + coverage(st, g.atoms, 'sticks') + coverage(st, g.atoms, 'ballstick') > 0.3;
    },
    lpsSpheres: () => {
      const st = findSt('3FXI');
      const g = st && group(st, 'LPS');
      return g && coverage(st, g.atoms, 'spheres') > 0.3;
    },
    rainbowA: (type, d) => type === 'viewer:color' && d.scheme === 'rainbow',
    clickedAtom: (type, d) => type === 'viewer:click' && !!d.hit,
    threeLabels: () => MG.app.annot && MG.app.annot.items.filter((i) => i.type === 'label3d').length >= 3,
    label2d: () => MG.app.annot && MG.app.annot.items.some((i) => i.type === 'label2d'),
    keyShown: () => MG.app.annot && MG.app.annot.key.visible,
    afAndPdbSuperposed: (type, d) => type === 'viewer:superposed' && /^AF-/i.test(d.mobile || ''),
    eritoranSuperposed: (type, d) => type === 'viewer:superposed' && /2Z65/i.test(d.mobile || '') && /3FXI/i.test(d.target || ''),
    twoViews: () => MG.app.vui && MG.app.vui.views.length >= 2
  };

  /* ------------------------------------------------------------------
     Questions
     ------------------------------------------------------------------ */
  const qEls = [];
  function initQuestions() {
    let n = 0;
    $$('.q').forEach((q) => {
      n++;
      const id = q.dataset.q || 'q' + n;
      const text = q.querySelector('.q-text');
      const model = q.querySelector('.q-model');
      if (model) model.hidden = true;
      const num = q.dataset.label || 'Q' + (q.closest('.chapter') ? (q.closest('.chapter').dataset.num || '') + '.' : '') + (qEls.filter((x) => x.q.closest('.chapter') === q.closest('.chapter')).length + 1);
      const head = h('div.q-h', h('span.q-n', num));
      if (text) head.appendChild(text);
      q.prepend(head);
      const body = h('div.q-body');
      const actions = h('div.q-actions');
      const fb = h('span.q-feedback', { 'aria-live': 'polite' });
      const rec = { id, q, fb, model, type: q.dataset.type || (q.dataset.accept ? 'short' : 'text') };
      const saved = state.answers[id] || {};
      if (rec.type === 'mcq') {
        const opts = q.querySelector('.mcq');
        if (opts) {
          opts.querySelectorAll('input').forEach((inp, k) => {
            inp.name = 'mcq-' + id;
            inp.value = String(k);
            if (saved.choice === String(k)) inp.checked = true;
            inp.addEventListener('change', () => checkMCQ(rec, true));
          });
          body.appendChild(opts);
        }
      } else {
        const inp = rec.type === 'short' ? h('input', { type: 'text', 'aria-label': 'Your answer', placeholder: q.dataset.placeholder || 'Your answer' }) : h('textarea', { 'aria-label': 'Your answer', placeholder: q.dataset.placeholder || 'Type your answer – it is saved in this browser' });
        inp.value = saved.text || '';
        rec.input = inp;
        body.appendChild(inp);
        inp.addEventListener('input', () => {
          state.answers[id] = Object.assign(state.answers[id] || {}, { text: inp.value });
          if (rec.type !== 'short') {
            state.answers[id].done = inp.value.trim().length > 3;
            q.classList.toggle('answered', state.answers[id].done);
          }
          save();
          updateProgressSoon();
        });
        if (rec.type === 'short') {
          const chk = h('button.btn.small', { type: 'button', html: MG.icon('check') + '<span>Check</span>' });
          chk.addEventListener('click', () => checkShort(rec, true));
          inp.addEventListener('keydown', (e) => e.key === 'Enter' && (e.preventDefault(), checkShort(rec, true)));
          actions.appendChild(chk);
        }
      }
      if (model && SHOW_ANSWERS) {
        const sb = h('button.btn.small', { type: 'button', text: 'Show answer' });
        sb.addEventListener('click', () => {
          model.hidden = !model.hidden;
          sb.textContent = model.hidden ? 'Show answer' : 'Hide answer';
          if (!model.hidden) {
            state.answers[id] = Object.assign(state.answers[id] || {}, { revealed: true });
            save();
          }
        });
        actions.appendChild(sb);
      }
      actions.appendChild(fb);
      body.appendChild(actions);
      if (model) {
        model.classList.add('q-answer');
        body.appendChild(model);
      }
      q.appendChild(body);
      qEls.push(rec);
      if (rec.type === 'short' && saved.text) checkShort(rec, false);
      if (rec.type === 'mcq' && saved.choice != null) checkMCQ(rec, false);
      if (rec.type === 'text' && saved.done) q.classList.add('answered');
    });
  }
  function norm(s) {
    return String(s || '').toLowerCase().replace(/[‐-―−]/g, '-').replace(/\s+/g, ' ').trim();
  }
  function checkShort(rec, user) {
    const v = norm(rec.input.value);
    if (!v) {
      rec.fb.textContent = '';
      return;
    }
    const accept = (rec.q.dataset.accept || '').split('||').map((s) => s.trim()).filter(Boolean);
    const ok = accept.some((a) => {
      try {
        return new RegExp(a, 'i').test(v);
      } catch (e) {
        return v === norm(a);
      }
    });
    rec.fb.className = 'q-feedback ' + (ok ? 'ok' : 'no');
    rec.fb.textContent = ok ? '✓ Correct' : '✗ Not quite – ' + (rec.q.dataset.hint || 'check again');
    rec.q.classList.toggle('answered', ok);
    state.answers[rec.id] = Object.assign(state.answers[rec.id] || {}, { text: rec.input.value, correct: ok, done: ok });
    save();
    if (user) {
      updateProgress();
      bus.emit('q:checked', { id: rec.id, ok });
    }
  }
  function checkMCQ(rec, user) {
    const inputs = Array.from(rec.q.querySelectorAll('.mcq input'));
    const chosen = inputs.find((i) => i.checked);
    if (!chosen) return;
    const label = chosen.closest('label');
    const right = label.hasAttribute('data-correct');
    rec.q.querySelectorAll('.mcq label').forEach((l) => l.classList.remove('right', 'wrong'));
    label.classList.add(right ? 'right' : 'wrong');
    rec.fb.className = 'q-feedback ' + (right ? 'ok' : 'no');
    const why = label.dataset.why || '';
    rec.fb.textContent = (right ? '✓ Correct. ' : '✗ Not quite. ') + why;
    rec.q.classList.toggle('answered', right);
    state.answers[rec.id] = { choice: chosen.value, correct: right, done: right, text: label.textContent.trim() };
    save();
    if (user) {
      updateProgress();
      bus.emit('q:checked', { id: rec.id, ok: right });
    }
  }

  /* ------------------------------------------------------------------
     Progress
     ------------------------------------------------------------------ */
  function updateProgress() {
    let done = 0, total = 0;
    chapters.forEach((ch) => {
      let d = 0, t = 0;
      taskEls.forEach((x) => {
        if (ch.contains(x.li) && !x.li.closest('.optional')) {
          t++;
          if (state.tasks[x.id]) d++;
        }
      });
      qEls.forEach((x) => {
        if (ch.contains(x.q) && !x.q.closest('.optional')) {
          t++;
          if ((state.answers[x.id] || {}).done) d++;
        }
      });
      done += d;
      total += t;
      const tab = $(`.ch-tab[data-ch="${ch.id}"]`);
      if (tab) {
        tab.classList.toggle('done', t > 0 && d === t);
        tab.title = t ? `${d} of ${t} done` : '';
      }
    });
    const pct = total ? Math.round((done / total) * 100) : 0;
    const bar = $('.progress > i');
    if (bar) bar.style.width = pct + '%';
    const lab = $('.progress-label');
    if (lab) lab.textContent = pct + '% done';
  }
  const updateProgressSoon = MG.debounce(updateProgress, 400);

  /* ------------------------------------------------------------------
     Download answers / reset
     ------------------------------------------------------------------ */
  function exportAnswers() {
    const name = state.name || '';
    const date = new Date().toLocaleString('en-GB');
    let html = `<!doctype html><html><head><meta charset="utf-8"><title>My answers – ${esc(CFG.courseTitle)}</title>
<style>body{font-family:Calibri,Arial,sans-serif;max-width:800px;margin:30px auto;color:#222;line-height:1.45}h1{font-size:22px}h2{font-size:17px;border-bottom:1px solid #ccc;margin-top:28px}
.q{margin:12px 0}.qt{font-weight:bold}.a{white-space:pre-wrap;background:#f4f7fa;border-left:3px solid #0b6b8a;padding:6px 10px;margin-top:4px}.none{color:#999;font-style:italic}.ok{color:#16794a}.meta{color:#666}</style></head><body>
<h1>${esc(CFG.courseTitle)} – my answers</h1><p class="meta">${name ? 'Name: <b>' + esc(name) + '</b> · ' : ''}Saved ${esc(date)}</p>`;
    chapters.forEach((ch) => {
      const qs = qEls.filter((x) => ch.contains(x.q));
      const ts = taskEls.filter((x) => ch.contains(x.li));
      if (!qs.length && !ts.length) return;
      html += `<h2>${esc(ch.dataset.num ? ch.dataset.num + '. ' : '')}${esc(ch.dataset.title || '')}</h2>`;
      if (ts.length) html += `<p class="meta">Activities completed: ${ts.filter((t) => state.tasks[t.id]).length} of ${ts.length}</p>`;
      qs.forEach((x) => {
        const a = state.answers[x.id] || {};
        const qt = x.q.querySelector('.q-text');
        const num = x.q.querySelector('.q-n');
        html += `<div class="q"><div class="qt">${esc(num ? num.textContent : '')} ${esc(qt ? qt.textContent : '')}</div>${a.text ? `<div class="a">${esc(a.text)}</div>` : '<div class="a none">(no answer)</div>'}${a.correct ? '<div class="ok">✓ checked correct</div>' : ''}</div>`;
      });
    });
    html += '</body></html>';
    MG.downloadText(html, 'my-answers' + (name ? '-' + name.replace(/[^a-z0-9]+/gi, '-') : '') + '.html', 'text/html');
    toast('Saved <b>my-answers.html</b> – open it in a browser or Word.');
  }
  async function copyAnswers() {
    let out = `${CFG.courseTitle} – my answers${state.name ? ' (' + state.name + ')' : ''}\n\n`;
    chapters.forEach((ch) => {
      const qs = qEls.filter((x) => ch.contains(x.q));
      if (!qs.length) return;
      out += `== ${ch.dataset.num ? ch.dataset.num + '. ' : ''}${ch.dataset.title} ==\n`;
      qs.forEach((x) => {
        const a = state.answers[x.id] || {};
        out += `${x.q.querySelector('.q-n').textContent} ${x.q.querySelector('.q-text') ? x.q.querySelector('.q-text').textContent : ''}\n${a.text || '(no answer)'}\n\n`;
      });
    });
    (await MG.copyText(out)) ? toast('Answers copied to the clipboard.') : toast('Could not copy.', 'error');
  }
  function resetProgress() {
    const m = MG.modal('Start again?', '<p>This clears your ticks and answers <b>in this browser</b>. Download your answers first if you want to keep them.</p><div class="prompt-actions"><button class="btn" data-x="no" type="button">Cancel</button><button class="btn primary" data-x="yes" type="button">Clear everything</button></div>');
    m.box.querySelector('[data-x="no"]').addEventListener('click', () => m.close());
    m.box.querySelector('[data-x="yes"]').addEventListener('click', () => {
      store.remove('progress');
      store.remove('chapter');
      location.hash = '';
      location.reload();
    });
  }
  function initMenus() {
    const btn = $('#answersBtn');
    if (btn) btn.addEventListener('click', () => MG.popmenu(btn, [
      ['download', 'Download my answers (.html)', exportAnswers],
      ['copy', 'Copy my answers as text', copyAnswers],
      ['reset', 'Start again (clear progress)', resetProgress]
    ]));
    const hb = $('#helpBtn');
    if (hb) hb.addEventListener('click', () => MG.app.vui.showHelp());
    $$('[data-student-name]').forEach((inp) => {
      inp.value = state.name || '';
      inp.addEventListener('input', () => {
        state.name = inp.value;
        save();
      });
    });
    $$('[data-export-answers]').forEach((b) => b.addEventListener('click', exportAnswers));
    const t = $('.brand-title');
    if (t && CFG.courseTitle) t.textContent = CFG.courseTitle;
    const s = $('.brand-sub');
    if (s && CFG.courseSubtitle) s.textContent = CFG.courseSubtitle;
  }

  /* nudge: highlight a workbench tab when the tutorial needs it */
  function initNudges() {
    bus.on('app:chapter', ({ id }) => {
      const ch = document.getElementById(id);
      if (!ch || !ch.dataset.bench) return;
      const tab = $(`.wb-tab[data-wb="${ch.dataset.bench}"]`);
      if (tab && MG.app.currentBench !== ch.dataset.bench) tab.classList.add('attn');
    });
  }

  /* WebGL check */
  function webglOK() {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) {
      return false;
    }
  }

  function init() {
    if (!webglOK()) console.warn('WebGL not available');
    initWorkbench();
    initSplitter();
    initChapters();
    initActions();
    initTasks();
    initQuestions();
    initMenus();
    initNudges();
    updateProgress();
    if (!SHOW_ANSWERS) document.body.classList.add('no-answers');
    MG_READY_FLAG.ready = true;
    window.MG_READY = true;
    bus.emit('app:ready', {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
