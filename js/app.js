(function () {
  const root = document.getElementById('app');

  // Public routes (no auth needed) and protected routes
  const publicRoutes = ['/login', '/register'];

  function parseHash() {
    const raw = (location.hash || '').replace(/^#/, '');
    if (!raw) return { path: '/', params: {} };
    // Match /habit/:id
    const m = raw.match(/^\/habit\/([^/?#]+)$/);
    if (m) return { path: '/habit/:id', params: { id: m[1] } };
    return { path: raw, params: {} };
  }

  function navigate(path, opts = {}) {
    const target = '#' + path;
    const current = location.hash || '#';
    if (opts.replace) {
      history.replaceState(null, '', target);
      render();
    } else if (current === target) {
      render();
    } else {
      location.hash = target; // triggers hashchange -> render()
    }
  }

  function render() {
    const { path, params } = parseHash();
    const user = Store.currentUser();
    const isPublic = publicRoutes.includes(path);

    // Auth gate
    if (!user && !isPublic) {
      navigate('/login', { replace: true });
      return;
    }
    if (user && isPublic) {
      navigate('/home', { replace: true });
      return;
    }

    const ctx = { navigate, params };
    switch (path) {
      case '/':
      case '/login':
        return Screens.renderLogin(root, ctx);
      case '/register':
        return Screens.renderRegister(root, ctx);
      case '/home':
        return Screens.renderHome(root, ctx);
      case '/add':
        return Screens.renderAddHabit(root, ctx);
      case '/habit/:id':
        return Screens.renderHabitDetail(root, ctx);
      case '/profile':
        return Screens.renderProfile(root, ctx);
      default:
        return navigate(user ? '/home' : '/login', { replace: true });
    }
  }

  window.addEventListener('hashchange', render);
  window.addEventListener('DOMContentLoaded', render);
  if (document.readyState !== 'loading') render();
})();
