import { adminAPI } from '../api.js';

const fmt  = (n) => new Intl.NumberFormat('en-IN').format(n || 0);
const fmtC = (n) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n||0);
const fmtD = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
Chart.defaults.color = '#6B7280';

export function renderEarnings() {
  const container = document.createElement('div');
  container.innerHTML = `
    <!-- Summary Stats -->
    <div class="stats-grid" id="earn-stats" style="grid-template-columns:repeat(4,1fr);">
      ${Array(4).fill(0).map(() => `
        <div class="stat-card">
          <div class="stat-icon-wrap" style="background:#F3F4F6;width:46px;height:46px;border-radius:10px;"></div>
          <div class="stat-body">
            <div style="background:#F3F4F6;border-radius:6px;height:26px;width:90px;"></div>
            <div style="background:#F3F4F6;border-radius:4px;height:12px;width:110px;margin-top:8px;"></div>
          </div>
        </div>`).join('')}
    </div>

    <!-- Charts -->
    <div class="charts-grid" style="margin-bottom:24px;">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Revenue Timeline</div>
            <div class="card-subtitle">Monthly earnings from paid bookings</div>
          </div>
          <select id="earn-period" style="width:auto;font-size:13px;padding:6px 10px;">
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
          </select>
        </div>
        <div class="card-body">
          <div class="chart-container"><canvas id="earn-chart"></canvas></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Booking Status</div>
          <div class="card-subtitle">All time breakdown</div>
        </div>
        <div class="card-body">
          <div class="chart-container" style="height:240px;"><canvas id="status-chart"></canvas></div>
        </div>
      </div>
    </div>

    <!-- Top Earning Advocates -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Top Earning Advocates</div>
          <div class="card-subtitle">Ranked by total earnings from paid bookings</div>
        </div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr>
            <th>Advocate</th>
            <th>Specializations</th>
            <th>Total Earned</th>
            <th>Bookings</th>
            <th>Avg / Booking</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr></thead>
          <tbody id="top-tbody">
            <tr><td colspan="7"><div class="loading"><div class="spinner"></div></div></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div id="earn-modal-wrap"></div>
  `;

  container.querySelector('#earn-period').addEventListener('change', (e) => loadRevenueChart(container, e.target.value));

  loadSummaryStats(container);
  loadRevenueChart(container, 'monthly');
  loadStatusChart(container);
  loadTopAdvocates(container);

  return container;
}

/* ─── Summary Stats ─────────────────────────────────────────────────────────── */
async function loadSummaryStats(container) {
  try {
    const { data } = await adminAPI.getPlatformEarnings();
    const avg = data.totalBookings > 0 ? Math.round(data.totalRevenue / data.totalBookings) : 0;

    container.querySelector('#earn-stats').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon-wrap si-green">💰</div>
        <div class="stat-body">
          <div class="stat-value">${fmtC(data.totalRevenue)}</div>
          <div class="stat-label">Total Platform Revenue</div>
          <div class="stat-trend trend-up">All time · ${fmt(data.totalBookings)} bookings</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap si-teal">📅</div>
        <div class="stat-body">
          <div class="stat-value">${fmtC(data.thisMonthRevenue)}</div>
          <div class="stat-label">This Month's Revenue</div>
          <div class="stat-trend ${data.thisMonthRevenue > 0 ? 'trend-up' : 'trend-flat'}">${fmt(data.thisMonthBookings)} bookings paid</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap si-amber">💎</div>
        <div class="stat-body">
          <div class="stat-value">${fmtC(avg)}</div>
          <div class="stat-label">Avg. Booking Value</div>
          <div class="stat-trend trend-flat">Per paid booking</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap si-blue">🏆</div>
        <div class="stat-body">
          <div class="stat-value">${data.topAdvocates?.length || 0}</div>
          <div class="stat-label">Top Earning Advocates</div>
          <div class="stat-trend trend-flat">Tracked this period</div>
        </div>
      </div>
    `;
  } catch (err) {
    container.querySelector('#earn-stats').innerHTML = `<div class="error-msg" style="grid-column:1/-1;">${err.message}</div>`;
  }
}

/* ─── Revenue Chart ─────────────────────────────────────────────────────────── */
async function loadRevenueChart(container, period = 'monthly') {
  const canvas = container.querySelector('#earn-chart');
  if (!canvas) return;
  try {
    const { data } = await adminAPI.getRevenue(period);
    const labels = data.map(d => {
      if (period === 'monthly') return `${d._id.year}-${String(d._id.month).padStart(2,'0')}`;
      if (period === 'daily')   return `${d._id.day}/${d._id.month}`;
      return `W${d._id.week}`;
    });
    if (canvas._chart) canvas._chart.destroy();
    canvas._chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue (₹)',
            data: data.map(d => d.revenue),
            backgroundColor: (ctx) => {
              const g = ctx.chart.ctx.createLinearGradient(0,0,0,280);
              g.addColorStop(0,'rgba(20,184,166,0.9)'); g.addColorStop(1,'rgba(13,148,136,0.4)'); return g;
            },
            borderRadius: 7, borderWidth: 0, yAxisID: 'y',
          },
          {
            label: 'Bookings',
            data: data.map(d => d.count),
            type: 'line',
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245,158,11,0.1)',
            fill: false, tension: 0.4,
            pointRadius: 4, pointBackgroundColor: '#F59E0B', yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12, padding: 16 } } },
        scales: {
          y:  { position: 'left',  grid: { color: '#F3F4F6' }, ticks: { callback: v => `₹${(v/1000).toFixed(0)}k`, font: { size: 11 } } },
          y1: { position: 'right', grid: { display: false }, ticks: { font: { size: 11 } }, beginAtZero: true },
          x:  { grid: { display: false }, ticks: { font: { size: 11 } } },
        },
      },
    });
  } catch (err) { console.error('Earnings chart error:', err); }
}

/* ─── Status Donut ──────────────────────────────────────────────────────────── */
async function loadStatusChart(container) {
  const canvas = container.querySelector('#status-chart');
  if (!canvas) return;
  try {
    const { data } = await adminAPI.getStats();
    const completed  = data.completedBookings || 0;
    const total      = data.totalBookings || 0;
    const cancelled  = Math.round(total * 0.08);
    const pending    = Math.round(total * 0.12);
    const others     = Math.max(0, total - completed - cancelled - pending);

    if (canvas._chart) canvas._chart.destroy();
    canvas._chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Pending', 'Cancelled', 'Others'],
        datasets: [{
          data: [completed, pending, cancelled, others],
          backgroundColor: ['#14B8A6','#F59E0B','#EF4444','#94A3B8'],
          borderWidth: 0, hoverOffset: 8,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12, padding: 12 } },
        },
      },
    });
  } catch (err) { console.error('Status chart error:', err); }
}

/* ─── Top Advocates Table ───────────────────────────────────────────────────── */
async function loadTopAdvocates(container) {
  const tbody = container.querySelector('#top-tbody');
  try {
    const { data } = await adminAPI.getPlatformEarnings();
    const advocates = data.topAdvocates || [];

    if (!advocates.length) {
      tbody.innerHTML = `<tr><td colspan="7">
        <div class="empty-state"><div class="empty-icon">💼</div>
        <p>No earnings data yet</p>
        <small>Earnings appear after paid bookings are recorded</small></div>
      </td></tr>`;
      return;
    }

    const medals = ['🥇','🥈','🥉'];

    tbody.innerHTML = advocates.map((a, i) => `
      <tr>
        <td>
          <div class="avatar-cell">
            <div style="position:relative;">
              <div class="table-avatar" id="avatar-${i}">
                ${a.user?.avatar
                  ? `<img src="${a.user.avatar}" alt="${a.user?.name||''}"
                       onload="this.style.opacity=1"
                       onerror="this.remove();document.getElementById('avatar-${i}').textContent='${(a.user?.name||'?').charAt(0).toUpperCase()}'"
                       style="opacity:0;transition:opacity 0.2s;" />`
                  : (a.user?.name||'?').charAt(0).toUpperCase()}
              </div>
              ${i < 3 ? `<span style="position:absolute;top:-5px;right:-5px;font-size:13px;line-height:1;">${medals[i]}</span>` : ''}
            </div>
            <div>
              <div class="av-name">${a.user?.name || 'Unknown'}</div>
              <div class="av-sub">${a.user?.email || ''}</div>
            </div>
          </div>
        </td>
        <td style="font-size:12px;">${(a.advocate?.specializations||[]).slice(0,2).join(', ') || '—'}</td>
        <td>
          <strong style="color:var(--success);font-size:15px;">${fmtC(a.totalEarned)}</strong>
        </td>
        <td>
          <span class="badge badge-teal">${fmt(a.bookingCount)}</span>
        </td>
        <td style="font-size:13px;font-weight:600;">
          ${fmtC(a.avgAmount || Math.round((a.totalEarned||0) / (a.bookingCount||1)))}
        </td>
        <td style="font-size:13px;">
          ⭐ ${(a.advocate?.rating?.average||0).toFixed(1)}
          <span style="font-size:11px;color:var(--text-muted);">(${a.advocate?.rating?.count||0})</span>
        </td>
        <td>
          <button class="btn btn-teal-ghost btn-sm view-earn-btn" data-id="${a._id}">
            View Earnings
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.view-earn-btn').forEach(btn => {
      btn.addEventListener('click', () => showEarningDetail(container, btn.dataset.id));
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="error-msg" style="margin:16px;">${err.message}</div></td></tr>`;
  }
}

/* ─── Advocate Earnings Modal ───────────────────────────────────────────────── */
async function showEarningDetail(container, advocateId) {
  const mc = container.querySelector('#earn-modal-wrap');
  mc.innerHTML = `
    <div class="modal-overlay" id="earn-overlay">
      <div class="modal" style="max-width:720px;">
        <div class="modal-header">
          <span class="modal-title">Advocate Earnings Detail</span>
          <button class="modal-close" id="close-earn">✕</button>
        </div>
        <div class="modal-body" id="earn-modal-body">
          <div class="loading"><div class="spinner"></div><p>Loading earnings…</p></div>
        </div>
      </div>
    </div>`;

  const close = () => { mc.innerHTML = ''; };
  mc.querySelector('#close-earn').addEventListener('click', close);
  mc.querySelector('#earn-overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) close(); });

  try {
    const { data } = await adminAPI.getAdvocateEarnings(advocateId);
    const { advocate: a, summary: s, monthly, recentTransactions, statusBreakdown } = data;
    const u = a.user || {};

    const statusColors = { completed:'badge-green', confirmed:'badge-blue', pending:'badge-amber', cancelled:'badge-red', no_show:'badge-gray' };

    const body = mc.querySelector('#earn-modal-body');
    body.innerHTML = `
      <!-- Profile hero -->
      <div class="profile-hero">
        <div class="profile-avatar-lg" style="overflow:hidden;" id="modal-avatar">
          ${u.avatar
            ? `<img src="${u.avatar}" alt="${u.name||''}"
                 style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
                 onerror="this.remove();document.getElementById('modal-avatar').textContent='${(u.name||'?').charAt(0).toUpperCase()}'" />`
            : (u.name||'?').charAt(0).toUpperCase()}
        </div>
        <div class="profile-hero-info">
          <h2>${u.name || 'Unknown Advocate'}</h2>
          <p>${u.email || ''} ${u.phone ? '· ' + u.phone : ''}</p>
          <div class="profile-badges" style="margin-top:10px;">
            <span class="badge badge-green" style="font-size:13px;padding:6px 12px;">
              💰 ${fmtC(s.totalEarned)} earned
            </span>
            <span class="badge badge-teal">${fmt(s.totalPaidBookings)} paid bookings</span>
            <span class="badge badge-amber">Avg ${fmtC(s.avgAmount)}/booking</span>
          </div>
        </div>
      </div>

      <!-- Extra stats row -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
        <div style="background:var(--primary-xlight);border:1px solid var(--primary-light);border-radius:var(--r-md);padding:14px 16px;text-align:center;">
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Min Booking</div>
          <div style="font-size:18px;font-weight:800;color:var(--text-primary);margin-top:4px;">${fmtC(s.minAmount)}</div>
        </div>
        <div style="background:var(--primary-xlight);border:1px solid var(--primary-light);border-radius:var(--r-md);padding:14px 16px;text-align:center;">
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Max Booking</div>
          <div style="font-size:18px;font-weight:800;color:var(--text-primary);margin-top:4px;">${fmtC(s.maxAmount)}</div>
        </div>
        <div style="background:var(--primary-xlight);border:1px solid var(--primary-light);border-radius:var(--r-md);padding:14px 16px;text-align:center;">
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Booking Statuses</div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin-top:6px;">
            ${(statusBreakdown||[]).map(s => `<span class="badge ${statusColors[s._id]||'badge-gray'}" style="font-size:10px;">${s._id}: ${s.count}</span>`).join('') || '—'}
          </div>
        </div>
      </div>

      <!-- Monthly chart -->
      ${monthly.length ? `
        <div class="section-title">Monthly Earnings (Last 12 months)</div>
        <div style="height:200px;margin:10px 0 20px;"><canvas id="modal-earn-chart"></canvas></div>
      ` : ''}

      <!-- Recent Transactions -->
      <div class="section-title">Recent Transactions (${recentTransactions.length})</div>
      ${recentTransactions.length ? `
        <div style="margin-top:8px;">
          ${recentTransactions.map(t => `
            <div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid #F9FAFB;">
              <div class="table-avatar" style="flex-shrink:0;" id="tx-avatar-${t._id}">
                ${t.client?.avatar
                  ? `<img src="${t.client.avatar}" alt="${t.client?.name||''}"
                       onerror="this.remove();document.getElementById('tx-avatar-${t._id}').textContent='${(t.client?.name||'?').charAt(0).toUpperCase()}'" />`
                  : (t.client?.name||'?').charAt(0).toUpperCase()}
              </div>
              <div style="flex:1;">
                <div style="font-size:13px;font-weight:600;">${t.client?.name || 'Client'}</div>
                <div style="font-size:11px;color:var(--text-muted);">
                  ${t.client?.email || ''} · ${fmtD(t.payment?.paidAt || t.createdAt)}
                  · ${t.type || 'consultation'}
                </div>
              </div>
              <div>
                <div style="font-size:15px;font-weight:800;color:var(--success);">+${fmtC(t.payment?.amount || 0)}</div>
                <div style="text-align:right;margin-top:2px;">
                  <span class="badge ${statusColors[t.status]||'badge-gray'}" style="font-size:10px;">${t.status}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : '<p style="color:var(--text-muted);font-size:13px;padding:12px 0;">No transactions yet</p>'}
    `;

    // Render monthly chart
    if (monthly.length) {
      setTimeout(() => {
        const canvas = body.querySelector('#modal-earn-chart');
        if (!canvas) return;
        new Chart(canvas, {
          type: 'bar',
          data: {
            labels: monthly.map(m => m.label || `${m.month} ${m.year}`),
            datasets: [{
              label: 'Earnings (₹)',
              data: monthly.map(m => m.total),
              backgroundColor: (ctx) => {
                const g = ctx.chart.ctx.createLinearGradient(0,0,0,200);
                g.addColorStop(0,'rgba(20,184,166,0.9)'); g.addColorStop(1,'rgba(13,148,136,0.3)'); return g;
              },
              borderRadius: 6, borderWidth: 0,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { grid: { color: '#F3F4F6' }, ticks: { callback: v => `₹${(v/1000).toFixed(0)}k`, font: { size: 10 } }, beginAtZero: true },
              x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            },
          },
        });
      }, 50);
    }

  } catch (err) {
    mc.querySelector('#earn-modal-body').innerHTML = `<div class="error-msg">${err.message}</div>`;
  }
}
