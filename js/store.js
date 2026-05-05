// Demo-only persistence layer. Data is stored in localStorage.
// Passwords are hashed with SHA-256 for the prototype but this is NOT a
// substitute for a real backend with proper auth.
(function (global) {
  const KEY_USERS = 'streak.users.v1';
  const KEY_SESSION = 'streak.session.v1';
  const KEY_HABITS = 'streak.habits.v1';

  async function sha256(text) {
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJSON(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  // ----- Auth -----
  async function signUp({ name, email, password }) {
    email = email.trim().toLowerCase();
    const users = readJSON(KEY_USERS, {});
    if (users[email]) throw new Error('An account with this email already exists.');
    users[email] = { name: name.trim(), email, passwordHash: await sha256(password) };
    writeJSON(KEY_USERS, users);
    writeJSON(KEY_SESSION, { email });
    return users[email];
  }

  async function signIn({ email, password }) {
    email = email.trim().toLowerCase();
    const users = readJSON(KEY_USERS, {});
    const user = users[email];
    if (!user) throw new Error('No account found for this email.');
    const hash = await sha256(password);
    if (user.passwordHash !== hash) throw new Error('Incorrect password.');
    writeJSON(KEY_SESSION, { email });
    return user;
  }

  function signOut() {
    localStorage.removeItem(KEY_SESSION);
  }

  function currentUser() {
    const session = readJSON(KEY_SESSION, null);
    if (!session) return null;
    const users = readJSON(KEY_USERS, {});
    return users[session.email] || null;
  }

  // ----- Habits -----
  function todayISO() {
    const d = new Date();
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d - tz).toISOString().slice(0, 10);
  }

  function dateISO(d) {
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d - tz).toISOString().slice(0, 10);
  }

  function userKey() {
    const user = currentUser();
    return user ? `${KEY_HABITS}:${user.email}` : null;
  }

  function getHabits() {
    const k = userKey();
    if (!k) return [];
    return readJSON(k, []);
  }

  function saveHabits(list) {
    const k = userKey();
    if (!k) return;
    writeJSON(k, list);
  }

  function addHabit({ name, emoji, color, schedule }) {
    const habits = getHabits();
    const habit = {
      id: 'h_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      emoji: emoji || '🎯',
      color: color || '#5b4cff',
      schedule: schedule || 'daily', // 'daily' | 'weekdays' | array of 0-6
      createdAt: todayISO(),
      completions: {},
    };
    habits.push(habit);
    saveHabits(habits);
    return habit;
  }

  function getHabit(id) {
    return getHabits().find((h) => h.id === id) || null;
  }

  function updateHabit(id, patch) {
    const habits = getHabits();
    const idx = habits.findIndex((h) => h.id === id);
    if (idx === -1) return null;
    habits[idx] = { ...habits[idx], ...patch };
    saveHabits(habits);
    return habits[idx];
  }

  function removeHabit(id) {
    saveHabits(getHabits().filter((h) => h.id !== id));
  }

  function toggleCompletion(id, date) {
    const habits = getHabits();
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    const key = date || todayISO();
    if (habit.completions[key]) delete habit.completions[key];
    else habit.completions[key] = true;
    saveHabits(habits);
    return habit;
  }

  function isScheduledOn(habit, dateStr) {
    if (habit.schedule === 'daily') return true;
    const d = new Date(dateStr + 'T00:00:00');
    const dow = d.getDay();
    if (habit.schedule === 'weekdays') return dow >= 1 && dow <= 5;
    if (Array.isArray(habit.schedule)) return habit.schedule.includes(dow);
    return true;
  }

  function streakFor(habit) {
    let streak = 0;
    let cursor = new Date();
    // If today is scheduled but not yet done, the streak still continues from yesterday.
    const todayStr = dateISO(cursor);
    if (isScheduledOn(habit, todayStr) && !habit.completions[todayStr]) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (true) {
      const key = dateISO(cursor);
      if (!isScheduledOn(habit, key)) {
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      if (habit.completions[key]) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
      if (streak > 3650) break;
    }
    return streak;
  }

  function totalCompletions(habit) {
    return Object.keys(habit.completions).length;
  }

  function todayProgress() {
    const habits = getHabits();
    const today = todayISO();
    const due = habits.filter((h) => isScheduledOn(h, today));
    const done = due.filter((h) => h.completions[today]);
    return { due: due.length, done: done.length };
  }

  global.Store = {
    signUp,
    signIn,
    signOut,
    currentUser,
    getHabits,
    getHabit,
    addHabit,
    updateHabit,
    removeHabit,
    toggleCompletion,
    isScheduledOn,
    streakFor,
    totalCompletions,
    todayProgress,
    todayISO,
    dateISO,
  };
})(window);
