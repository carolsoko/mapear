const STORAGE_KEY = 'mapear_state_v1';

const defaultState = () => ({
  progress: {
    padroes: { completed: false, attempts: 0 },
    abstracao: { completed: false, attempts: 0 },
    algoritmo: { completed: false, attempts: 0 },
    generalizacao: { completed: false, attempts: 0 }
  },
  reflections: {
    padroes: '',
    abstracao: '',
    algoritmo: '',
    generalizacao: ''
  },
  scores: {
    padroes: null,
    abstracao: null,
    algoritmo: null,
    generalizacao: null
  },
  achievements: [],
  events: []
});

function getState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

function saveState(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function update(updater) {
  const current = getState();
  const next = updater({ ...current });
  saveState(next);
  return next;
}

function recordEvent(type, payload) {
  update(s => {
    s.events.push({ type, payload, ts: Date.now() });
    return s;
  });
}

function setReflection(key, text) {
  update(s => { s.reflections[key] = text; return s; });
}

function setScore(key, score) {
  update(s => { s.scores[key] = score; return s; });
}

function markCompleted(key) {
  update(s => { s.progress[key].completed = true; return s; });
}

function incrementAttempts(key) {
  update(s => { s.progress[key].attempts = (s.progress[key].attempts || 0) + 1; return s; });
}

function addAchievement(text) {
  update(s => { if (!s.achievements.includes(text)) s.achievements.push(text); return s; });
}

function exportState() {
  return JSON.stringify(getState(), null, 2);
}

function importState(json) {
  const data = JSON.parse(json);
  if (!data || typeof data !== 'object') throw new Error('Invalid JSON');
  saveState({ ...defaultState(), ...data });
}

function reset() { saveState(defaultState()); }

export const Storage = {
  getState,
  update,
  record: recordEvent,
  reflect: setReflection,
  score: setScore,
  complete: markCompleted,
  attempt: incrementAttempts,
  achieve: addAchievement,
  export: exportState,
  import: importState,
  reset
};