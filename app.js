(() => {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.getElementById('toggle-password');
  const loginBtn = document.getElementById('login-btn');

  toggleBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailInput.focus();
      flashError(emailInput);
      return;
    }
    if (!password || password.length < 6) {
      passwordInput.focus();
      flashError(passwordInput);
      return;
    }

    loginBtn.disabled = true;
    const original = loginBtn.textContent;
    loginBtn.textContent = 'Signing in...';
    setTimeout(() => {
      loginBtn.textContent = original;
      loginBtn.disabled = false;
      alert('Login submitted for ' + email);
    }, 800);
  });

  document.querySelectorAll('.btn-social').forEach((btn) => {
    btn.addEventListener('click', () => {
      const provider = btn.getAttribute('data-provider');
      alert('Continue with ' + provider + ' (not yet configured)');
    });
  });

  document.getElementById('register-link').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Register screen coming soon');
  });

  function flashError(el) {
    const prev = el.style.borderColor;
    el.style.borderColor = '#ff4d6d';
    el.style.boxShadow = '0 0 0 3px rgba(255, 77, 109, 0.18)';
    setTimeout(() => {
      el.style.borderColor = prev;
      el.style.boxShadow = '';
    }, 900);
  }
})();
