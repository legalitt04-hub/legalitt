const PAGE_INFO = {
  dashboard:    { title: 'Dashboard',            subtitle: 'Platform overview, analytics & system health' },
  users:        { title: 'User Management',      subtitle: 'View, search and manage all platform users' },
  advocates:    { title: 'Advocate Management',  subtitle: 'View and manage advocate profiles' },
  verification: { title: 'Verifications',        subtitle: 'Review and approve pending advocate applications' },
  earnings:     { title: 'Earnings & Revenue',   subtitle: 'Platform revenue, top earners and transaction history' },
  settings:     { title: 'System Settings',      subtitle: 'Configure platform settings, announcements & logs' },
};

export function renderHeader(activePage) {
  const info = PAGE_INFO[activePage] || PAGE_INFO.dashboard;
  const now  = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });

  const header = document.createElement('header');
  header.className = 'top-header';
  header.innerHTML = `
    <div class="header-left">
      <div class="header-title">${info.title}</div>
      <div class="header-subtitle">${info.subtitle}</div>
    </div>
    <div class="header-right">
      <div class="header-date">
        📅 ${now}
      </div>
    </div>
  `;
  return header;
}
