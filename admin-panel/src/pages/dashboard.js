import { adminAPI } from '../api.js';
import { navigateTo } from '../main.js';

const fmt  = (n) => new Intl.NumberFormat('en-IN').format(n || 0);
const fmtC = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
const fmtD = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// Chart.js global defaults — match app font
Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
Chart.defaults.color = '#6B7280';

export function renderDashboard() {
  const container = document.createElement('div');
  container.innerHTML = `
    <!-- ── Stat Cards ── -->
    <div class="stats-grid" id="stats-grid">
      ${Array(6).fill(0).map(() => `
        <div class="stat-card">
          <div class="stat-icon-wrap si-teal" style="background:#F3F4F6"></div>
          <div class="stat-body">
            <div class="stat-value" style="color:#F3F4F6;background:#F3F4F6;border-radius:6px;">000</div>
            <div class="stat-label" style="background:#F3F4F6;color:#F3F4F6;border-radius:4px;margin-top:6px;height:14px;"></div>
          </div>
        </div>`).join('')}
    </div>

    <!-- ── Charts Row ── -->
    <div class="charts-grid" style="margin-bottom:24px;">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Revenue Overview</div>
            <div class="card-subtitle">Income from completed bookings</div>
          </div>
          <select id="rev-period" style="width:auto;font-size:13px;padding:6px 10px;">
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily (30d)</option>
          </select>
        </div>
        <div class="card-body">
          <div class="chart-container"><canvas id="revenue-chart"></canvas></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Activity (14 days)</div>
          <div class="card-subtitle">Registrations vs Bookings</div>
        </div>
        <div class="card-body">
          <div class="chart-container"><canvas id="activity-chart"></canvas></div>
        </div>
      </div>
    </div>

    <!-- ── Bottom Row ── -->
    <div class="charts-grid single-grid">
      <!-- Recent Registrations -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Recent Registrations</div>
            <div class="card-subtitle">Newest users on the platform</div>
          </div>
          <button class="btn btn-teal-ghost btn-sm" id="all-users-btn">View All →</button>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr>
              <th>User</th><th>Role</th><th>Joined</th><th>Status</th>
            </tr></thead>
            <tbody id="recent-tbody">
              <tr><td colspan="4"><div class="loading"><div class="spinner"></div></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- System Health -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">System Health</div>
          <div class="card-subtitle">Live server metrics</div>
        </div>
        <div class="card-body" id="health-body">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>
    </div>
  `;

  // Wire up
  container.querySelector('#all-users-btn').addEventListener('click', () => navigateTo('users'));
  container.querySelector('#rev-period').addEventListener('change', (e) => loadRevenueChart(container, e.target.value));

  // Load all data
  loadStats(container);
  loadRevenueChart(container, 'monthly');
  loadActivityChart(container);
  loadRecentRegistrations(container);
  loadHealth(container);

  return container;
}

/* ─── Stats ──────────────────────────────────────────────────────────────────── */
async function loadStats(container) {
  try {
    const { data: d } = await adminAPI.getStats();
    container.querySelector('#stats-grid').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon-wrap si-teal">👥</div>
        <div class="stat-body">
          <div class="stat-value">${fmt(d.totalClients)}</div>
          <div class="stat-label">Total Clients</div>
          <div class="stat-trend ${d.userGrowth >= 0 ? 'trend-up' : 'trend-down'}">
            ${d.userGrowth >= 0 ? '↑' : '↓'} ${Math.abs(d.userGrowth)}% this month
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap si-amber">⚖️</div>
        <div class="stat-body">
          <div class="stat-value">${fmt(d.totalAdvocates)}</div>
          <div class="stat-label">Verified Advocates</div>
          <div class="stat-trend trend-flat">Active on platform</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap si-green">💰</div>
        <div class="stat-body">
          <div class="stat-value">${fmtC(d.totalRevenue)}</div>
          <div class="stat-label">Total Revenue</div>
          <div class="stat-trend trend-flat">All time</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap si-blue">📅</div>
        <div class="stat-body">
          <div class="stat-value">${fmt(d.totalBookings)}</div>
          <div class="stat-label">Total Bookings</div>
          <div class="stat-trend trend-flat">${d.completionRate}% completion</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap si-red">⏳</div>
        <div class="stat-body">
          <div class="stat-value">${fmt(d.pendingVerifications)}</div>
          <div class="stat-label">Pending Verifications</div>
          <div class="stat-trend ${d.pendingVerifications > 0 ? 'trend-down' : 'trend-up'}">
            ${d.pendingVerifications > 0 ? '⚠️ Needs attention' : '✓ All clear'}
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap si-purple">🆕</div>
        <div class="stat-body">
          <div class="stat-value">${fmt(d.newUsersThisMonth)}</div>
          <div class="stat-label">New Users This Month</div>
          <div class="stat-trend trend-up">${fmt(d.newBookingsThisMonth)} bookings</div>
        </div>
      </div>
    `;
  } catch (err) {
    container.querySelector('#stats-grid').innerHTML =
      `<div class="error-msg" style="grid-column:1/-1;">${err.message}</div>`;
  }
}

/* ─── Revenue Chart ──────────────────────────────────────────────────────────── */
async function loadRevenueChart(container, period = 'monthly') {
  const canvas = container.querySelector('#revenue-chart');
  if (!canvas) return;
  try {
    const { data } = await adminAPI.getRevenue(period);
    const labels = data.map(d => {
      if (period === 'monthly') return `${d._id.year}-${String(d._id.month).padStart(2,'0')}`;
      if (period === 'daily')   return `${d._id.day}/${d._id.month}`;
      return `W${d._id.week}`;
    });
    const values = data.map(d => d.revenue);
    if (canvas._chart) canvas._chart.destroy();
    canvas._chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Revenue (₹)',
          data: values,
          backgroundColor: (ctx) => {
            const grad = ctx.chart.ctx.createLinearGradient(0, 0, 0, 270);
            grad.addColorStop(0, 'rgba(20,184,166,0.9)');
            grad.addColorStop(1, 'rgba(13,148,136,0.5)');
            return grad;
          },
          borderColor: '#14B8A6',
          borderWidth: 0,
          borderRadius: 7,
          hoverBackgroundColor: '#0D9488',
          maxBarThickness: 60,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            grid: { color: '#F3F4F6' },
            ticks: { callback: v => `₹${(v/1000).toFixed(0)}k`, font: { size: 11 } },
          },
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        },
      },
    });
  } catch (err) { console.error('Revenue chart error:', err); }
}

/* ─── Activity Chart ─────────────────────────────────────────────────────────── */
async function loadActivityChart(container) {
  const canvas = container.querySelector('#activity-chart');
  if (!canvas) return;
  try {
    const { data } = await adminAPI.getActivity();
    const makeMap = (arr) => {
      const m = {};
      arr.forEach(d => { m[`${d._id.day}/${d._id.month}`] = d.count; });
      return m;
    };
    const regMap  = makeMap(data.registrations || []);
    const bookMap = makeMap(data.bookings || []);
    const labels = [], reg = [], book = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = `${d.getDate()}/${d.getMonth()+1}`;
      labels.push(k); reg.push(regMap[k]||0); book.push(bookMap[k]||0);
    }
    if (canvas._chart) canvas._chart.destroy();
    canvas._chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Registrations', data: reg,  borderColor: '#14B8A6', backgroundColor: 'rgba(20,184,166,0.1)', fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#14B8A6' },
          { label: 'Bookings',      data: book, borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)',  fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#F59E0B' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12, padding: 16 } } },
        scales: {
          y: { grid: { color: '#F3F4F6' }, ticks: { font: { size: 11 } }, beginAtZero: true },
          x: { grid: { display: false }, ticks: { font: { size: 10 }, maxTicksLimit: 7 } },
        },
      },
    });
  } catch (err) { console.error('Activity chart error:', err); }
}

/* ─── Recent Registrations ───────────────────────────────────────────────────── */
async function loadRecentRegistrations(container) {
  const tbody = container.querySelector('#recent-tbody');
  try {
    const { data } = await adminAPI.getRecentRegistrations();
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">👤</div><p>No registrations yet</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = data.map(u => `
      <tr>
        <td>
          <div class="avatar-cell">
            <div class="table-avatar">${u.avatar ? `<img src="${u.avatar}" alt="${u.name}" />` : u.name.charAt(0).toUpperCase()}</div>
            <div>
              <div class="av-name">${u.name}</div>
              <div class="av-sub">${u.email}</div>
            </div>
          </div>
        </td>
        <td><span class="badge ${u.role==='advocate'?'badge-amber':'badge-teal'}">${u.role}</span></td>
        <td style="font-size:12px;color:var(--text-secondary);">${fmtD(u.createdAt)}</td>
        <td><span class="badge ${u.isActive?'badge-green':'badge-red'}">${u.isActive?'Active':'Banned'}</span></td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="error-msg" style="margin:12px;">${err.message}</div></td></tr>`;
  }
}

/* ─── System Health ──────────────────────────────────────────────────────────── */
async function loadHealth(container) {
  const body = container.querySelector('#health-body');
  try {
    const { data } = await adminAPI.getHealth();
    const dbOk  = data.database.status === 'connected';
    const memPc = Math.round((data.memory.heapUsed / data.memory.heapTotal) * 100);
    body.innerHTML = `
      <div class="health-grid">
        <div class="health-card">
          <div class="h-icon">🗄️</div>
          <div class="h-label">Database</div>
          <div class="h-value" style="color:${dbOk?'var(--success)':'var(--error)'}">
            ${dbOk ? '●' : '○'}
          </div>
          <div class="h-status ${dbOk?'h-ok':'h-err'}">${data.database.status}</div>
        </div>
        <div class="health-card">
          <div class="h-icon">⏱️</div>
          <div class="h-label">Uptime</div>
          <div class="h-value" style="font-size:16px;">${data.server.uptimeFormatted}</div>
          <div class="h-status h-ok">${data.server.environment}</div>
        </div>
        <div class="health-card">
          <div class="h-icon">💾</div>
          <div class="h-label">Memory</div>
          <div class="h-value">${data.memory.heapUsed}MB</div>
          <div class="h-status ${memPc>80?'h-warn':'h-ok'}">${memPc}% heap used</div>
        </div>
        <div class="health-card">
          <div class="h-icon">🟢</div>
          <div class="h-label">Node.js</div>
          <div class="h-value" style="font-size:15px;">${data.server.nodeVersion}</div>
          <div class="h-status h-ok">Running</div>
        </div>
      </div>
    `;
  } catch (err) {
    body.innerHTML = `<div class="error-msg">${err.message}</div>`;
  }
}
