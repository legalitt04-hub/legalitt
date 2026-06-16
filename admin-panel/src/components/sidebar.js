import { navigateTo } from '../main.js';

const PAGES = [
  { id: 'dashboard',    icon: '📊', label: 'Dashboard' },
  { id: 'users',        icon: '👥', label: 'Users' },
  { id: 'advocates',    icon: '⚖️',  label: 'Advocates' },
  { id: 'verification', icon: '✅', label: 'Verifications', badge: true },
  { id: 'earnings',     icon: '💰', label: 'Earnings' },
  { id: 'settings',     icon: '⚙️',  label: 'Settings' },
];

export function renderSidebar(activePage) {
  const adminUser = JSON.parse(localStorage.getItem('legalitt_admin_user') || '{}');
  const initials  = adminUser.name ? adminUser.name.charAt(0).toUpperCase() : 'A';

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';

  sidebar.innerHTML = `
    <!-- Logo -->
    <div class="sidebar-logo">
      <img src="assets/shield-logo.png" class="shield" alt="Legalitt" />
      <img src="assets/legalitt-text.png" class="text-logo" alt="Legalitt" />
      <span class="sidebar-admin-pill">ADMIN</span>
    </div>

    <!-- Nav -->
    <nav class="sidebar-nav">
      <div class="sidebar-section-label">Navigation</div>

      ${PAGES.map(p => `
        <div class="sidebar-link ${activePage === p.id ? 'active' : ''}" data-page="${p.id}">
          <div class="link-icon">${p.icon}</div>
          <span>${p.label}</span>
          ${p.badge ? `<span class="sidebar-badge" id="pending-badge" style="display:none">0</span>` : ''}
        </div>
      `).join('')}
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="sidebar-user-card">
        <div class="sidebar-avatar">${initials}</div>
        <div class="sidebar-user-info">
          <span class="name">${adminUser.name || 'Admin'}</span>
          <span class="role">Administrator</span>
        </div>
      </div>
      <button class="btn-logout" id="logout-btn">
        <span>🚪</span> Sign Out
      </button>
    </div>
  `;

  // Navigation clicks
  sidebar.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => navigateTo(link.dataset.page));
  });

  // Logout
  sidebar.querySelector('#logout-btn').addEventListener('click', () => {
    localStorage.clear();
    window.location.reload();
  });

  // Load pending verification badge count
  const token = localStorage.getItem('legalitt_admin_token');
  if (token) {
    fetch('http://localhost:5001/api/v1/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        const badge = sidebar.querySelector('#pending-badge');
        const count = data?.data?.pendingVerifications ?? 0;
        if (badge) {
          if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-flex';
          } else {
            badge.style.display = 'none';
          }
        }
      })
      .catch(() => {});
  }

  return sidebar;
}
