import { renderLogin } from './pages/login.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderUsers } from './pages/users.js';
import { renderAdvocates } from './pages/advocates.js';
import { renderVerification } from './pages/verification.js';
import { renderEarnings } from './pages/earnings.js';
import { renderSettings } from './pages/settings.js';
import { renderSidebar } from './components/sidebar.js';
import { renderHeader } from './components/header.js';

const app = document.getElementById('app');

function isLoggedIn() {
  return !!localStorage.getItem('legalitt_admin_token');
}

function getCurrentPage() {
  return localStorage.getItem('legalitt_admin_page') || 'dashboard';
}

export function navigateTo(page) {
  localStorage.setItem('legalitt_admin_page', page);
  renderApp();
}

function renderApp() {
  if (!isLoggedIn()) {
    app.innerHTML = '';
    app.appendChild(renderLogin());
    return;
  }

  const page = getCurrentPage();

  const layout = document.createElement('div');
  layout.className = 'app-layout';

  const sidebar = renderSidebar(page);
  layout.appendChild(sidebar);

  const mainContent = document.createElement('div');
  mainContent.className = 'main-content';

  const header = renderHeader(page);
  mainContent.appendChild(header);

  const pageContent = document.createElement('div');
  pageContent.className = 'page-content';

  const pageMap = {
    dashboard: renderDashboard,
    users: renderUsers,
    advocates: renderAdvocates,
    verification: renderVerification,
    earnings: renderEarnings,
    settings: renderSettings,
  };

  const renderFn = pageMap[page] || renderDashboard;
  const pageEl = renderFn();
  pageContent.appendChild(pageEl);

  mainContent.appendChild(pageContent);
  layout.appendChild(mainContent);

  app.innerHTML = '';
  app.appendChild(layout);
}

// Boot
renderApp();
