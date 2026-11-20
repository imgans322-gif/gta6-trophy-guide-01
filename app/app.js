// Leonida Legend — GTA VI trophy tracker logic.
// Plain classic script: loads only data/trophies.json from this app, keeps progress in
// localStorage, and never touches the network beyond that one local file.
'use strict';

var STORAGE_KEY = 'leonida-legend-progress-v1';

var STAGES = [
  { n: 1, title: 'Stage 1 — Story first', warn: true,
    text: 'Chapters 1–4, the named missions (Gone Fishing, Breakfast Run, The Cartel Heist, Child\u2019s Play, Headliners, VCIA Takedown, Operation Savage Glory) and the final mission. Watch the red missables tied to story beats here.' },
  { n: 2, title: 'Stage 2 — Strangers & side stories', warn: true,
    text: 'Finish the stranger strands: Andy, Kenton, Billy, Randy and Tyrone finales, 8 strands for Strangers & Freaks, and Bret\u2019s unique-animal hunt (missable).' },
  { n: 3, title: 'Stage 3 — Collectibles & exploration', warn: false,
    text: 'Card sets, 18 meditation spots, all 52 areas of Leonida, 100 vehicles discovered, WAiNK at 100 locations, 10 Scooter Bros registrations and the 8 garages.' },
  { n: 4, title: 'Stage 4 — Activities & feats', warn: false,
    text: '250 stunts, gold in all 42 Shooting Range challenges, 14 Top Fun drone wins, 20 races, 50 challenges, robberies, partner feats and combat one-offs.' },
  { n: 5, title: 'Stage 5 — Money, cleanup & 100%', warn: false,
    text: 'Launder $250,000 of Marked Bills, spend $100,000, mop up anything left, then Attain 100% Completion (gold) and the platinum unlocks itself.' }
];

var state = {
  trophies: [],
  earned: new Set(),
  kind: 'all',
  grade: 'all',
  search: '',
  spoiler: false,
  hideEarned: false,
  selectedId: null
};

function loadEarned() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state.earned = new Set(JSON.parse(raw));
  } catch (e) { state.earned = new Set(); }
}

function saveEarned() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(state.earned))); } catch (e) {}
}

function isSpoilerHidden(t) {
  return state.spoiler && t.kind === 'story' && !state.earned.has(t.id);
}

function displayName(t) {
  return isSpoilerHidden(t) ? 'Hidden story trophy — spoiler protection on' : t.name;
}

function displayDesc(t) {
  return isSpoilerHidden(t) ? 'Story details stay hidden until you earn this trophy. Turn off “Hide story spoilers” to reveal them.' : t.description;
}

function matchesFilters(t) {
  if (state.kind !== 'all' && t.kind !== state.kind) return false;
  if (state.grade !== 'all' && t.grade !== state.grade) return false;
  if (state.hideEarned && state.earned.has(t.id)) return false;
  if (state.search) {
    var hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
    if (hay.indexOf(state.search.toLowerCase()) === -1) return false;
  }
  return true;
}

function gradeLabel(g) { return g.charAt(0).toUpperCase() + g.slice(1); }

function renderProgress() {
  var total = state.trophies.length;
  var done = state.earned.size;
  var pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('overallProgress').textContent = done + ' of ' + total + ' earned · ' + pct + '%';
  document.getElementById('overallBar').style.width = pct + '%';
  var grades = ['platinum', 'gold', 'silver', 'bronze'];
  var html = '';
  grades.forEach(function (g) {
    var all = state.trophies.filter(function (t) { return t.grade === g; });
    var got = all.filter(function (t) { return state.earned.has(t.id); }).length;
    html += '<span class="gradeCount">' + gradeLabel(g) + ': ' + got + '/' + all.length + '</span>';
  });
  var miss = state.trophies.filter(function (t) { return t.missable; });
  var missGot = miss.filter(function (t) { return state.earned.has(t.id); }).length;
  html += '<span class="gradeCount">Missable: ' + missGot + '/' + miss.length + '</span>';
  document.getElementById('gradeCounts').innerHTML = html;
}

function renderRoadmap() {
  var html = '';
  STAGES.forEach(function (s) {
    var inStage = state.trophies.filter(function (t) { return t.stage === s.n; });
    var names = inStage.slice(0, 5).map(function (t) {
      var flag = t.missable ? ' ⚠ MISSABLE' : '';
      return '<span>' + escapeHtml(t.name) + flag + '</span>';
    }).join('');
    if (inStage.length > 5) names += '<span>… +' + (inStage.length - 5) + ' more</span>';
    html += '<article class="stageCard' + (s.warn ? ' warn' : '') + '"><h3>' + s.title + '</h3><p>' +
      escapeHtml(s.text) + '</p><div class="stageNames">' + names + '</div></article>';
  });
  document.getElementById('roadmapGrid').innerHTML = html;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function tagHtml(t) {
  var tags = '<span class="tag grade-' + t.grade + '">' + gradeLabel(t.grade) + '</span>';
  tags += '<span class="tag">' + t.kind + '</span>';
  tags += '<span class="tag">Stage ' + t.stage + '</span>';
  if (t.missable) tags += '<span class="tag missableTag">⚠ MISSABLE</span>';
  if (t.hidden) tags += '<span class="tag hiddenTag">Hidden on PSN</span>';
  if (t.tracked) tags += '<span class="tag">Tracked: ' + Number(t.tracked).toLocaleString('en-US') + '</span>';
  return tags;
}

function renderList() {
  var visible = state.trophies.filter(matchesFilters);
  var list = document.getElementById('trophyList');
  document.getElementById('resultCount').textContent =
    'Showing ' + visible.length + ' of ' + state.trophies.length + ' trophies' +
    (state.kind === 'online' ? ' — the official PS5 list has no online trophies; the partner feats are counted as activities.' : '') +
    ' · Click a trophy to open its guide →';
  if (!visible.length) {
    list.innerHTML = '<div class="emptyNote">No trophies match this view. ' +
      (state.kind === 'online'
        ? 'That is correct for this game: the official list of 55 contains no online trophies — Hot Together and Retail Therapy are partner activities in the story world.'
        : 'Try clearing the search or choosing another filter.') + '</div>';
    return;
  }
  var html = '';
  visible.forEach(function (t) {
    var earned = state.earned.has(t.id);
    html += '<article class="trophyCard' + (earned ? ' earned' : '') + (state.selectedId === t.id ? ' selected' : '') +
      '" data-id="' + t.id + '">' +
      '<input type="checkbox" data-check="' + t.id + '"' + (earned ? ' checked' : '') + ' aria-label="Mark earned">' +
      '<div class="trophyMain"><div class="trophyName' + (isSpoilerHidden(t) ? ' spoilerName' : '') + '">' + escapeHtml(displayName(t)) + '</div>' +
      '<div class="trophyDesc">' + escapeHtml(displayDesc(t)) + '</div>' +
      '<div class="trophyTags">' + tagHtml(t) + '</div></div></article>';
  });
  list.innerHTML = html;
  list.querySelectorAll('.trophyCard').forEach(function (card) {
    card.addEventListener('click', function (ev) {
      var id = Number(card.getAttribute('data-id'));
      if (ev.target && ev.target.hasAttribute && ev.target.hasAttribute('data-check')) return;
      state.selectedId = id;
      renderList();
      renderDetail();
    });
  });
  list.querySelectorAll('input[data-check]').forEach(function (box) {
    box.addEventListener('change', function () {
      var id = Number(box.getAttribute('data-check'));
      if (box.checked) state.earned.add(id); else state.earned.delete(id);
      saveEarned();
      var y = window.scrollY;
      renderProgress();
      renderList();
      renderDetail();
      window.scrollTo(0, y);
    });
  });
}

function renderDetail() {
  var t = state.trophies.find(function (x) { return x.id === state.selectedId; }) || state.trophies[0];
  if (!t) return;
  state.selectedId = t.id;
  document.getElementById('detailName').textContent = displayName(t);
  document.getElementById('detailMeta').innerHTML = tagHtml(t) +
    '<span class="tag">' + (state.earned.has(t.id) ? '✓ Earned' : 'Not earned yet') + '</span>';
  document.getElementById('detailDesc').textContent = '“' + displayDesc(t) + '” — official PlayStation description';
  document.getElementById('detailGuide').textContent = isSpoilerHidden(t)
    ? 'Guide hidden by spoiler protection. Earn this story trophy, or turn off “Hide story spoilers”, to read it.'
    : t.guide;
  var src = '';
  (t.sources || []).forEach(function (s) { src += '<li>' + escapeHtml(s) + '</li>'; });
  document.getElementById('detailSources').innerHTML = src;
  var stage = STAGES.find(function (s) { return s.n === t.stage; });
  document.getElementById('detailStage').textContent =
    'Roadmap: ' + (stage ? stage.title : 'Stage ' + t.stage) +
    (t.missable ? ' · ⚠ MISSABLE — do not pass its story beat without it.' : ' · Not missable: it can be earned in free roam or cleanup.');
}

function renderAll() { renderProgress(); renderRoadmap(); renderList(); renderDetail(); }

function applyQueryParams() {
  var q = new URLSearchParams(window.location.search);
  var grade = q.get('grade');
  if (grade && ['platinum', 'gold', 'silver', 'bronze'].indexOf(grade) !== -1) {
    state.grade = grade;
    document.getElementById('gradeSelect').value = grade;
  }
  var kind = q.get('kind');
  if (kind && ['story', 'missable', 'collectibles', 'activities', 'online'].indexOf(kind) !== -1) {
    state.kind = kind;
    document.querySelectorAll('#kindChips .chip').forEach(function (c) {
      c.classList.toggle('active', c.getAttribute('data-kind') === kind);
    });
  }
  if (q.get('spoiler') === '1') { state.spoiler = true; document.getElementById('spoilerToggle').checked = true; }
  var open = Number(q.get('open'));
  if (open >= 1 && open <= 55) state.selectedId = open;
}

function pickDefaultSelection() {
  if (state.selectedId && state.trophies.some(function (t) { return t.id === state.selectedId; })) return;
  var visible = state.trophies.filter(matchesFilters);
  if (visible.length) state.selectedId = visible[0].id;
}

function wireControls() {
  document.getElementById('searchInput').addEventListener('input', function (ev) {
    state.search = ev.target.value.trim();
    pickDefaultSelection(); renderList(); renderDetail();
  });
  document.querySelectorAll('#kindChips .chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      state.kind = chip.getAttribute('data-kind');
      document.querySelectorAll('#kindChips .chip').forEach(function (c) { c.classList.toggle('active', c === chip); });
      state.selectedId = null; pickDefaultSelection(); renderList(); renderDetail();
    });
  });
  document.getElementById('gradeSelect').addEventListener('change', function (ev) {
    state.grade = ev.target.value;
    state.selectedId = null; pickDefaultSelection(); renderList(); renderDetail();
  });
  document.getElementById('spoilerToggle').addEventListener('change', function (ev) {
    state.spoiler = ev.target.checked; renderList(); renderDetail();
  });
  document.getElementById('earnedToggle').addEventListener('change', function (ev) {
    state.hideEarned = ev.target.checked;
    state.selectedId = null; pickDefaultSelection(); renderList(); renderDetail();
  });
  document.getElementById('exportBtn').addEventListener('click', function () {
    var payload = JSON.stringify({ game: 'Grand Theft Auto VI', earned: Array.from(state.earned) }, null, 2);
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    a.download = 'leonida-legend-progress.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });
  document.getElementById('importFile').addEventListener('change', function (ev) {
    var file = ev.target.files && ev.target.files[0];
    if (!file) return;
    file.text().then(function (text) {
      try {
        var parsed = JSON.parse(text);
        var ids = Array.isArray(parsed) ? parsed : parsed.earned;
        if (!Array.isArray(ids)) throw new Error('no earned list');
        state.earned = new Set(ids.filter(function (id) {
          return state.trophies.some(function (t) { return t.id === id || t.name === id; });
        }).map(function (id) {
          if (typeof id === 'number') return id;
          var found = state.trophies.find(function (t) { return t.name === id; });
          return found ? found.id : -1;
        }).filter(function (id) { return id >= 1; }));
        saveEarned(); renderAll();
      } catch (e) { /* ignore a bad progress file */ }
    });
  });
  document.getElementById('resetBtn').addEventListener('click', function () {
    state.earned = new Set(); saveEarned(); renderAll();
  });
  document.getElementById('nextUnearnedBtn').addEventListener('click', function () {
    if (!state.trophies.length) return;
    var start = state.trophies.findIndex(function (t) { return t.id === state.selectedId; });
    for (var step = 1; step <= state.trophies.length; step++) {
      var cand = state.trophies[(start + step) % state.trophies.length];
      if (!state.earned.has(cand.id)) {
        state.selectedId = cand.id;
        renderList();
        renderDetail();
        var card = document.querySelector('.trophyCard[data-id="' + cand.id + '"]');
        if (card) card.scrollIntoView({ block: 'center' });
        return;
      }
    }
  });
}

function init() {
  loadEarned();
  wireControls();
  applyQueryParams();
  fetch('data/trophies.json').then(function (r) { return r.json(); }).then(function (doc) {
    state.trophies = doc.trophies;
    state.earned = new Set(Array.from(state.earned).filter(function (id) {
      return state.trophies.some(function (t) { return t.id === id; });
    }));
    pickDefaultSelection();
    renderAll();
  });
}

init();
