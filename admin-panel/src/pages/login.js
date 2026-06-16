import { authAPI, setToken } from '../api.js';

export function renderLogin() {
  const page = document.createElement('div');
  page.className = 'login-page';
  page.innerHTML = `
    <div class="login-card">
      <!-- Logo — real app assets -->
      <div class="login-logo">
        <img src="assets/shield-logo.png" class="shield" alt="Legalitt Shield" />
        <img src="assets/legalitt-text.png" class="text-logo" alt="Legalitt" />
      </div>

      <div class="login-badge">🔐 Admin Access Only</div>

      <h2 class="login-title">Welcome back, Admin</h2>
      <p class="login-subtitle">Sign in to manage your Legalitt platform.</p>

      <div id="login-error" class="error-msg" style="display:none;"></div>

      <form id="login-form">
        <div class="form-group">
          <label class="form-label" for="email">Email Address</label>
          <input
            type="email" id="email"
            placeholder="admin@legalitt.com"
            required autocomplete="email"
          />
        </div>
        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input
            type="password" id="password"
            placeholder="Enter your password"
            required autocomplete="current-password"
          />
        </div>
        <button type="submit" class="btn btn-primary" id="login-btn">
          Sign In to Admin Panel
        </button>
      </form>

      <p style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:24px;">
        Legalitt Admin Panel · Secure Access
      </p>
    </div>
  `;

  const form = page.querySelector('#login-form');
  const errorEl = page.querySelector('#login-error');
  const loginBtn = page.querySelector('#login-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = page.querySelector('#email').value.trim();
    const password = page.querySelector('#password').value;

    loginBtn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;margin:0 auto;"></div>';
    loginBtn.disabled = true;
    errorEl.style.display = 'none';

    try {
      const res = await authAPI.login(email, password);
      const user = res.data?.user;

      if (user?.role !== 'admin') {
        throw new Error('Access denied. You need admin privileges to log in here.');
      }

      setToken(res.data.accessToken);
      localStorage.setItem('legalitt_admin_user', JSON.stringify(user));
      window.location.reload();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
      loginBtn.textContent = 'Sign In to Admin Panel';
      loginBtn.disabled = false;
    }
  });

  return page;
}
