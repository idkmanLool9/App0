(function (global) {
  const EMOJIS = ['🎯','💧','🏃','📚','🧘','🥗','💊','✍️','🛌','🚭','🌱','💪','🎨','🧠','☕','🎸','🧹','💸'];
  const COLORS = ['#5b4cff','#ff4d8d','#00d4ff','#2ee59d','#ff9b5b','#ffd24d','#a06bff','#ff6b6b'];
  const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // ---------- LOGIN ----------
  function renderLogin(root, { navigate }) {
    root.innerHTML = '';
    const screen = el(`
      <main class="screen auth-screen">
        <div class="bg-gradient"></div>
        <section class="hero">
          <h1 class="title">Sign in to your<br/>Account</h1>
          <p class="subtitle">Please enter your credentials to continue</p>
        </section>
        <form class="form" id="login-form" novalidate>
          <label class="field">
            <span class="field-label">Email</span>
            <input type="email" id="email" autocomplete="email" inputmode="email" placeholder="you@example.com" required />
          </label>
          <label class="field">
            <span class="field-label">Password</span>
            <div class="input-wrap">
              <input type="password" id="password" autocomplete="current-password" placeholder="••••••••" minlength="6" required />
              <button type="button" class="eye-btn" id="toggle-password" aria-label="Show password">${eyeIcon()}</button>
            </div>
          </label>
          <a href="#" class="forgot" id="forgot-link">Forgot Password</a>
          <button type="submit" class="btn-primary" id="login-btn">Login</button>
          <div class="divider"><span>Or login with</span></div>
          <div class="social-row">
            <button type="button" class="btn-social" data-provider="apple">${appleIcon()}<span>Apple</span></button>
            <button type="button" class="btn-social" data-provider="google">${googleIcon()}<span>Google</span></button>
          </div>
        </form>
        <footer class="signup-row">
          <span>Don't have account?</span>
          <a href="#/register">Register</a>
        </footer>
      </main>
    `);
    root.appendChild(screen);

    wirePasswordToggle(screen);

    screen.querySelector('#login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = screen.querySelector('#email').value;
      const password = screen.querySelector('#password').value;
      const btn = screen.querySelector('#login-btn');
      if (!isEmail(email)) return flash(screen.querySelector('#email'));
      if (!password || password.length < 6) return flash(screen.querySelector('#password'));
      btn.disabled = true; btn.textContent = 'Signing in...';
      try {
        await Store.signIn({ email, password });
        navigate('/home');
      } catch (err) {
        showToast(err.message || 'Login failed');
        btn.disabled = false; btn.textContent = 'Login';
      }
    });

    screen.querySelectorAll('.btn-social').forEach((b) => {
      b.addEventListener('click', () => showToast('Social login is not configured yet'));
    });
    screen.querySelector('#forgot-link').addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Password reset is not yet available');
    });
  }

  // ---------- REGISTER ----------
  function renderRegister(root, { navigate }) {
    root.innerHTML = '';
    const screen = el(`
      <main class="screen auth-screen">
        <div class="bg-gradient"></div>
        <header class="screen-header">
          <button class="icon-btn" id="back-btn" aria-label="Back">${chevronLeft()}</button>
        </header>
        <section class="hero">
          <h1 class="title">Registration in to your<br/>Account</h1>
          <p class="subtitle">Please fill in the details to create your account.</p>
        </section>
        <form class="form" id="register-form" novalidate>
          <label class="field">
            <span class="field-label">Full Name</span>
            <input type="text" id="name" autocomplete="name" placeholder="Your name" required />
          </label>
          <label class="field">
            <span class="field-label">Email</span>
            <input type="email" id="email" autocomplete="email" placeholder="you@example.com" required />
          </label>
          <label class="field">
            <span class="field-label">Password</span>
            <div class="input-wrap">
              <input type="password" id="password" placeholder="••••••••" minlength="6" required />
              <button type="button" class="eye-btn" data-target="password" aria-label="Show password">${eyeIcon()}</button>
            </div>
          </label>
          <label class="field">
            <span class="field-label">Repeat Password</span>
            <div class="input-wrap">
              <input type="password" id="password2" placeholder="••••••••" minlength="6" required />
              <button type="button" class="eye-btn" data-target="password2" aria-label="Show password">${eyeIcon()}</button>
            </div>
          </label>
          <button type="submit" class="btn-primary" id="register-btn">Register</button>
        </form>
        <footer class="signup-row">
          <span>I have account?</span>
          <a href="#/login">Log in</a>
        </footer>
      </main>
    `);
    root.appendChild(screen);

    screen.querySelectorAll('.eye-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = screen.querySelector('#' + btn.dataset.target);
        target.type = target.type === 'password' ? 'text' : 'password';
      });
    });

    screen.querySelector('#back-btn').addEventListener('click', () => navigate('/login'));

    screen.querySelector('#register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = screen.querySelector('#name').value.trim();
      const email = screen.querySelector('#email').value;
      const password = screen.querySelector('#password').value;
      const password2 = screen.querySelector('#password2').value;
      const btn = screen.querySelector('#register-btn');
      if (!name) return flash(screen.querySelector('#name'));
      if (!isEmail(email)) return flash(screen.querySelector('#email'));
      if (password.length < 6) { flash(screen.querySelector('#password')); return showToast('Password must be at least 6 characters'); }
      if (password !== password2) { flash(screen.querySelector('#password2')); return showToast('Passwords do not match'); }
      btn.disabled = true; btn.textContent = 'Creating account...';
      try {
        await Store.signUp({ name, email, password });
        navigate('/home');
      } catch (err) {
        showToast(err.message || 'Could not register');
        btn.disabled = false; btn.textContent = 'Register';
      }
    });
  }

  // ---------- HOME ----------
  function renderHome(root, { navigate }) {
    root.innerHTML = '';
    const user = Store.currentUser();
    const habits = Store.getHabits();
    const today = Store.todayISO();
    const progress = Store.todayProgress();
    const pct = progress.due === 0 ? 0 : Math.round((progress.done / progress.due) * 100);
    const greeting = greetingFor(new Date());
    const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

    const screen = el(`
      <main class="screen app-screen">
        <div class="bg-gradient"></div>
        <header class="home-header">
          <div>
            <p class="muted">${greeting},</p>
            <h2 class="greet-name">${escapeHtml(firstName(user.name))}</h2>
          </div>
          <button class="avatar-btn" id="profile-btn" aria-label="Profile">
            <span>${initial(user.name)}</span>
          </button>
        </header>

        <section class="progress-card">
          <div class="progress-ring-wrap">
            ${ringSvg(pct)}
            <div class="progress-text">
              <span class="pct">${pct}%</span>
              <span class="muted small">${progress.done}/${progress.due}</span>
            </div>
          </div>
          <div class="progress-meta">
            <p class="muted small">${dateLabel}</p>
            <h3>${pct === 100 && progress.due > 0 ? 'All done — nice!' : "Today's progress"}</h3>
            <p class="muted small">${progress.due === 0 ? 'No habits scheduled today.' : `${progress.due - progress.done} left to go.`}</p>
          </div>
        </section>

        <section class="section-row">
          <h3>Today's Habits</h3>
          <button class="link-btn" id="add-habit-link">+ Add</button>
        </section>

        <ul class="habit-list" id="habit-list"></ul>
      </main>
    `);

    root.appendChild(screen);
    root.appendChild(renderTabBar('home', navigate));

    const list = screen.querySelector('#habit-list');
    const dueToday = habits.filter((h) => Store.isScheduledOn(h, today));

    if (habits.length === 0) {
      list.appendChild(el(`
        <li class="empty">
          <div class="empty-emoji">✨</div>
          <p>No habits yet. Tap "+ Add" to create your first one.</p>
        </li>
      `));
    } else if (dueToday.length === 0) {
      list.appendChild(el(`
        <li class="empty">
          <div class="empty-emoji">🌴</div>
          <p>Nothing scheduled for today. Enjoy a rest day!</p>
        </li>
      `));
    } else {
      dueToday.forEach((h) => list.appendChild(habitRow(h, today, navigate)));
    }

    screen.querySelector('#profile-btn').addEventListener('click', () => navigate('/profile'));
    screen.querySelector('#add-habit-link').addEventListener('click', () => navigate('/add'));
  }

  function habitRow(habit, today, navigate) {
    const done = !!habit.completions[today];
    const streak = Store.streakFor(habit);
    const node = el(`
      <li class="habit-row ${done ? 'done' : ''}" data-id="${habit.id}">
        <button class="habit-icon" style="--c:${habit.color}" aria-label="Open ${escapeHtml(habit.name)}">
          <span>${habit.emoji}</span>
        </button>
        <div class="habit-info">
          <p class="habit-name">${escapeHtml(habit.name)}</p>
          <p class="muted small">${streak > 0 ? '🔥 ' + streak + ' day streak' : 'Tap to complete'}</p>
        </div>
        <button class="check-btn ${done ? 'checked' : ''}" aria-label="${done ? 'Mark incomplete' : 'Mark complete'}" style="--c:${habit.color}">
          ${done ? checkIcon() : ''}
        </button>
      </li>
    `);

    node.querySelector('.habit-icon').addEventListener('click', () => navigate('/habit/' + habit.id));
    node.querySelector('.check-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      Store.toggleCompletion(habit.id, today);
      // Re-render whole home to update progress ring + streak labels
      navigate(location.hash.slice(1) || '/home', { replace: true });
    });
    node.addEventListener('click', (e) => {
      if (e.target.closest('.check-btn')) return;
      navigate('/habit/' + habit.id);
    });
    return node;
  }

  // ---------- ADD HABIT ----------
  function renderAddHabit(root, { navigate }) {
    root.innerHTML = '';
    let selectedEmoji = EMOJIS[0];
    let selectedColor = COLORS[0];
    let selectedSchedule = 'daily';

    const screen = el(`
      <main class="screen app-screen">
        <div class="bg-gradient"></div>
        <header class="screen-header">
          <button class="icon-btn" id="back-btn" aria-label="Back">${chevronLeft()}</button>
          <h2 class="screen-title">New Habit</h2>
          <span style="width:40px"></span>
        </header>
        <form class="form" id="add-form" novalidate>
          <label class="field">
            <span class="field-label">Habit name</span>
            <input type="text" id="name" placeholder="Drink 2L of water" maxlength="60" required />
          </label>

          <div class="picker-block">
            <p class="picker-label">Icon</p>
            <div class="emoji-grid" id="emoji-grid"></div>
          </div>

          <div class="picker-block">
            <p class="picker-label">Color</p>
            <div class="color-row" id="color-row"></div>
          </div>

          <div class="picker-block">
            <p class="picker-label">Schedule</p>
            <div class="seg" id="schedule">
              <button type="button" data-val="daily" class="active">Every day</button>
              <button type="button" data-val="weekdays">Weekdays</button>
              <button type="button" data-val="weekends">Weekends</button>
            </div>
          </div>

          <button type="submit" class="btn-primary">Create habit</button>
        </form>
      </main>
    `);
    root.appendChild(screen);

    const eg = screen.querySelector('#emoji-grid');
    EMOJIS.forEach((e) => {
      const b = el(`<button type="button" class="emoji-cell ${e === selectedEmoji ? 'active' : ''}">${e}</button>`);
      b.addEventListener('click', () => {
        selectedEmoji = e;
        eg.querySelectorAll('.emoji-cell').forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
      });
      eg.appendChild(b);
    });

    const cr = screen.querySelector('#color-row');
    COLORS.forEach((c) => {
      const b = el(`<button type="button" class="color-cell ${c === selectedColor ? 'active' : ''}" style="--c:${c}" aria-label="Color ${c}"></button>`);
      b.addEventListener('click', () => {
        selectedColor = c;
        cr.querySelectorAll('.color-cell').forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
      });
      cr.appendChild(b);
    });

    screen.querySelector('#schedule').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-val]');
      if (!btn) return;
      screen.querySelectorAll('#schedule button').forEach((x) => x.classList.remove('active'));
      btn.classList.add('active');
      const v = btn.dataset.val;
      if (v === 'daily') selectedSchedule = 'daily';
      else if (v === 'weekdays') selectedSchedule = 'weekdays';
      else selectedSchedule = [0, 6];
    });

    screen.querySelector('#back-btn').addEventListener('click', () => navigate('/home'));

    screen.querySelector('#add-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = screen.querySelector('#name').value.trim();
      if (!name) return flash(screen.querySelector('#name'));
      Store.addHabit({ name, emoji: selectedEmoji, color: selectedColor, schedule: selectedSchedule });
      showToast('Habit created');
      navigate('/home');
    });
  }

  // ---------- HABIT DETAIL ----------
  function renderHabitDetail(root, { navigate, params }) {
    root.innerHTML = '';
    const habit = Store.getHabit(params.id);
    if (!habit) {
      navigate('/home');
      return;
    }
    const today = Store.todayISO();
    const streak = Store.streakFor(habit);
    const total = Store.totalCompletions(habit);
    const last30 = lastNDays(30);
    const completedIn30 = last30.filter((d) => habit.completions[d]).length;

    const screen = el(`
      <main class="screen app-screen">
        <div class="bg-gradient"></div>
        <header class="screen-header">
          <button class="icon-btn" id="back-btn" aria-label="Back">${chevronLeft()}</button>
          <h2 class="screen-title">Habit</h2>
          <button class="icon-btn" id="delete-btn" aria-label="Delete">${trashIcon()}</button>
        </header>

        <section class="habit-hero" style="--c:${habit.color}">
          <div class="habit-hero-icon"><span>${habit.emoji}</span></div>
          <h1 class="habit-hero-name">${escapeHtml(habit.name)}</h1>
          <p class="muted small">${scheduleLabel(habit.schedule)}</p>
        </section>

        <section class="stats-row">
          <div class="stat-card"><span class="stat-num">🔥 ${streak}</span><span class="muted small">Streak</span></div>
          <div class="stat-card"><span class="stat-num">${completedIn30}</span><span class="muted small">Last 30d</span></div>
          <div class="stat-card"><span class="stat-num">${total}</span><span class="muted small">Total</span></div>
        </section>

        <section class="section-row"><h3>Last 5 weeks</h3></section>
        <div class="heatmap" id="heatmap"></div>

        <button class="btn-primary" id="toggle-today">${habit.completions[today] ? 'Mark today incomplete' : 'Mark today complete'}</button>
      </main>
    `);
    root.appendChild(screen);

    renderHeatmap(screen.querySelector('#heatmap'), habit);

    screen.querySelector('#back-btn').addEventListener('click', () => navigate('/home'));
    screen.querySelector('#toggle-today').addEventListener('click', () => {
      Store.toggleCompletion(habit.id, today);
      navigate('/habit/' + habit.id, { replace: true });
    });
    screen.querySelector('#delete-btn').addEventListener('click', () => {
      if (confirm('Delete "' + habit.name + '"?')) {
        Store.removeHabit(habit.id);
        navigate('/home');
      }
    });
  }

  function renderHeatmap(container, habit) {
    container.innerHTML = '';
    const weeks = 5;
    const days = weeks * 7;
    const cells = lastNDays(days);
    const grid = el('<div class="heatmap-grid"></div>');
    cells.forEach((d) => {
      const done = habit.completions[d];
      const scheduled = Store.isScheduledOn(habit, d);
      const cell = el(`<span class="heat-cell ${done ? 'on' : scheduled ? 'due' : 'off'}" title="${d}${done ? ' ✓' : ''}" style="--c:${habit.color}"></span>`);
      grid.appendChild(cell);
    });
    container.appendChild(grid);
    const labels = el(`<div class="heatmap-labels muted small"><span>${cells[0]}</span><span>${cells[cells.length - 1]}</span></div>`);
    container.appendChild(labels);
  }

  // ---------- PROFILE ----------
  function renderProfile(root, { navigate }) {
    root.innerHTML = '';
    const user = Store.currentUser();
    const habits = Store.getHabits();
    const totalCompletions = habits.reduce((s, h) => s + Store.totalCompletions(h), 0);
    const longest = habits.reduce((m, h) => Math.max(m, Store.streakFor(h)), 0);

    const screen = el(`
      <main class="screen app-screen">
        <div class="bg-gradient"></div>
        <header class="screen-header">
          <button class="icon-btn" id="back-btn" aria-label="Back">${chevronLeft()}</button>
          <h2 class="screen-title">Profile</h2>
          <span style="width:40px"></span>
        </header>

        <section class="profile-hero">
          <div class="avatar-lg"><span>${initial(user.name)}</span></div>
          <h1 class="hero-name">${escapeHtml(user.name)}</h1>
          <p class="muted small">${escapeHtml(user.email)}</p>
        </section>

        <section class="stats-row">
          <div class="stat-card"><span class="stat-num">${habits.length}</span><span class="muted small">Habits</span></div>
          <div class="stat-card"><span class="stat-num">🔥 ${longest}</span><span class="muted small">Best streak</span></div>
          <div class="stat-card"><span class="stat-num">${totalCompletions}</span><span class="muted small">Total ✓</span></div>
        </section>

        <ul class="settings-list">
          <li><button id="export-btn">Export data</button></li>
          <li><button id="reset-btn" class="danger">Clear all habits</button></li>
          <li><button id="signout-btn" class="danger">Sign out</button></li>
        </ul>
      </main>
    `);
    root.appendChild(screen);
    root.appendChild(renderTabBar('profile', navigate));

    screen.querySelector('#back-btn').addEventListener('click', () => navigate('/home'));
    screen.querySelector('#export-btn').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify({ user, habits }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'streak-export.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
    screen.querySelector('#reset-btn').addEventListener('click', () => {
      if (confirm('Delete ALL your habits? This cannot be undone.')) {
        habits.forEach((h) => Store.removeHabit(h.id));
        navigate('/profile', { replace: true });
        showToast('All habits cleared');
      }
    });
    screen.querySelector('#signout-btn').addEventListener('click', () => {
      Store.signOut();
      navigate('/login');
    });
  }

  // ---------- Helpers + components ----------
  function renderTabBar(active, navigate) {
    const bar = el(`
      <nav class="tabbar">
        <button data-tab="home" class="${active === 'home' ? 'active' : ''}">${homeIcon()}<span>Home</span></button>
        <button data-tab="add">${plusIcon()}</button>
        <button data-tab="profile" class="${active === 'profile' ? 'active' : ''}">${userIcon()}<span>Profile</span></button>
      </nav>
    `);
    bar.querySelectorAll('button').forEach((b) => {
      b.addEventListener('click', () => {
        const t = b.dataset.tab;
        if (t === 'home') navigate('/home');
        else if (t === 'add') navigate('/add');
        else if (t === 'profile') navigate('/profile');
      });
    });
    return bar;
  }

  function wirePasswordToggle(scope) {
    const btn = scope.querySelector('#toggle-password');
    if (!btn) return;
    const input = scope.querySelector('#password');
    btn.addEventListener('click', () => {
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  }

  function ringSvg(pct) {
    const r = 36;
    const c = 2 * Math.PI * r;
    const offset = c - (Math.max(0, Math.min(100, pct)) / 100) * c;
    return `
      <svg viewBox="0 0 100 100" class="ring">
        <circle cx="50" cy="50" r="${r}" class="ring-track" />
        <circle cx="50" cy="50" r="${r}" class="ring-fill" style="stroke-dasharray:${c};stroke-dashoffset:${offset};" />
      </svg>
    `;
  }

  function lastNDays(n) {
    const out = [];
    const d = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const day = new Date(d);
      day.setDate(d.getDate() - i);
      out.push(Store.dateISO(day));
    }
    return out;
  }

  function scheduleLabel(s) {
    if (s === 'daily') return 'Every day';
    if (s === 'weekdays') return 'Weekdays (Mon–Fri)';
    if (Array.isArray(s)) return s.map((i) => DAY_LABELS[i]).join(', ') || 'Custom';
    return 'Custom';
  }

  function isEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || '').trim()); }
  function flash(elInput) {
    elInput.classList.add('flash-error');
    setTimeout(() => elInput.classList.remove('flash-error'), 900);
  }

  function firstName(name) { return (name || 'there').split(' ')[0]; }
  function initial(name) { return (name || '?').trim().charAt(0).toUpperCase(); }

  function greetingFor(d) {
    const h = d.getHours();
    if (h < 6) return 'Good night';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  // SVG Icons
  function eyeIcon() { return `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`; }
  function chevronLeft() { return `<svg viewBox="0 0 24 24" width="22" height="22"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M15 18l-6-6 6-6"/></svg>`; }
  function checkIcon() { return `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M5 12l5 5 9-10"/></svg>`; }
  function trashIcon() { return `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6"/></svg>`; }
  function homeIcon() { return `<svg viewBox="0 0 24 24" width="22" height="22"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M3 11l9-8 9 8M5 10v10h14V10"/></svg>`; }
  function userIcon() { return `<svg viewBox="0 0 24 24" width="22" height="22"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`; }
  function plusIcon() { return `<svg viewBox="0 0 24 24" width="22" height="22"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" d="M12 5v14M5 12h14"/></svg>`; }
  function appleIcon() { return `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16.365 1.43c0 1.14-.46 2.23-1.21 3.03-.81.86-2.13 1.52-3.23 1.43-.13-1.1.43-2.27 1.16-3.05.83-.9 2.24-1.55 3.28-1.41zM20.5 17.4c-.55 1.27-.81 1.84-1.52 2.96-.99 1.55-2.39 3.49-4.13 3.5-1.55.02-1.95-1.01-4.05-1-2.1.01-2.54 1.02-4.09 1-1.74-.01-3.07-1.76-4.06-3.31C-.04 16.95-.34 11.86 1.6 9.18c1.39-1.94 3.58-3.07 5.64-3.07 2.1 0 3.42 1.15 5.16 1.15 1.69 0 2.71-1.15 5.14-1.15 1.84 0 3.78 1 5.16 2.73-4.54 2.49-3.8 8.96-2.2 8.56z"/></svg>`; }
  function googleIcon() { return `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#EA4335" d="M12 10.2v3.86h5.4c-.24 1.4-1.66 4.1-5.4 4.1-3.25 0-5.9-2.7-5.9-6.02s2.65-6.02 5.9-6.02c1.85 0 3.09.79 3.8 1.46l2.6-2.5C16.78 3.6 14.62 2.6 12 2.6 6.92 2.6 2.8 6.72 2.8 11.8s4.12 9.2 9.2 9.2c5.31 0 8.83-3.73 8.83-8.98 0-.6-.06-1.06-.15-1.52H12z"/><path fill="#34A853" d="M12 21c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.78.54-1.83.92-3.12.92-2.4 0-4.43-1.62-5.16-3.8H3.9v2.39C5.4 18.94 8.45 21 12 21z"/><path fill="#FBBC05" d="M6.84 13.74A5.4 5.4 0 0 1 6.55 12c0-.6.1-1.18.27-1.74V7.87H3.9A9 9 0 0 0 3 12c0 1.45.35 2.83.9 4.13l2.94-2.39z"/><path fill="#4285F4" d="M12 6.6c1.32 0 2.5.46 3.43 1.36l2.57-2.57C16.46 3.94 14.42 3 12 3 8.45 3 5.4 5.06 3.9 7.87l2.94 2.39C7.57 8.22 9.6 6.6 12 6.6z"/></svg>`; }

  global.Screens = {
    renderLogin, renderRegister, renderHome, renderAddHabit, renderHabitDetail, renderProfile,
    showToast,
  };
})(window);
