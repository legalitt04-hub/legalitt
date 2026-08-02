import { adminAPI } from '../api.js';

let currentPage = 1;
let currentFilters = {};

const fmtD = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export function renderUsers() {
  const container = document.createElement('div');
  container.innerHTML = `
    <div class="page-toolbar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" id="user-search" placeholder="Search by name, email or phone…" />
      </div>
      <div class="filter-group">
        <select id="role-filter">
          <option value="">All Roles</option>
          <option value="client">Clients</option>
          <option value="advocate">Advocates</option>
          <option value="admin">Admins</option>
        </select>
        <select id="status-filter">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Banned</option>
        </select>
      </div>
    </div>

    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Joined</th>
              <th>Last Seen</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="users-tbody">
            <tr><td colspan="7"><div class="loading"><div class="spinner"></div></div></td></tr>
          </tbody>
        </table>
      </div>
      <div class="pagination" id="users-pagination"></div>
    </div>

    <div id="user-modal-container"></div>
  `;

  let searchTimeout;
  container.querySelector('#user-search').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage = 1;
      currentFilters.search = e.target.value.trim();
      loadUsers(container);
    }, 380);
  });
  container.querySelector('#role-filter').addEventListener('change', (e) => {
    currentPage = 1; currentFilters.role = e.target.value; loadUsers(container);
  });
  container.querySelector('#status-filter').addEventListener('change', (e) => {
    currentPage = 1; currentFilters.isActive = e.target.value; loadUsers(container);
  });

  loadUsers(container);
  return container;
}

async function loadUsers(container) {
  const tbody = container.querySelector('#users-tbody');
  tbody.innerHTML = `<tr><td colspan="7"><div class="loading"><div class="spinner"></div></div></td></tr>`;

  try {
    const { data, pagination } = await adminAPI.getUsers({ page: currentPage, ...currentFilters });

    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="7">
        <div class="empty-state"><div class="empty-icon">👤</div><p>No users found</p><small>Try adjusting your filters</small></div>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(u => `
      <tr>
        <td>
          <div class="avatar-cell">
            <div class="table-avatar">
              ${u.avatar ? `<img src="${u.avatar}" alt="${u.name}" />` : u.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="av-name">${u.name}</div>
              <div class="av-sub">${u.email}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge ${u.role==='admin'?'badge-red':u.role==='advocate'?'badge-amber':'badge-teal'}">
            ${u.role}
          </span>
        </td>
        <td style="font-size:12px;color:var(--text-secondary);">${u.phone || '—'}</td>
        <td style="font-size:12px;color:var(--text-secondary);">${fmtD(u.createdAt)}</td>
        <td style="font-size:12px;color:var(--text-secondary);">${u.lastSeen ? fmtD(u.lastSeen) : '—'}</td>
        <td><span class="badge ${u.isActive?'badge-green':'badge-red'}">${u.isActive?'Active':'Banned'}</span></td>
        <td>
          <div style="display:flex;gap:5px;">
            <button class="btn btn-teal-ghost btn-sm view-btn" data-id="${u._id}">View</button>
            ${u.role !== 'admin' ? `
              <button class="btn ${u.isActive?'btn-danger':'btn-success'} btn-sm toggle-btn"
                data-id="${u._id}" data-active="${u.isActive}">
                ${u.isActive ? 'Ban' : 'Activate'}
              </button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');

    renderPagination(container, '#users-pagination', pagination, p => { currentPage = p; loadUsers(container); });

    container.querySelectorAll('.view-btn').forEach(btn =>
      btn.addEventListener('click', () => showUserModal(container, btn.dataset.id)));

    container.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const isActive = btn.dataset.active === 'true';
        if (isActive) {
          const reason = prompt('Reason for banning this user (optional):');
          if (reason === null) return; // cancelled
          btn.disabled = true; btn.textContent = '…';
          try { await adminAPI.toggleUser(btn.dataset.id, reason); loadUsers(container); }
          catch (err) { alert(err.message); btn.disabled = false; }
        } else {
          if (!confirm('Reactivate this user?')) return;
          btn.disabled = true; btn.textContent = '…';
          try { await adminAPI.toggleUser(btn.dataset.id); loadUsers(container); }
          catch (err) { alert(err.message); btn.disabled = false; }
        }
      });
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="error-msg" style="margin:16px;">${err.message}</div></td></tr>`;
  }
}

async function showUserModal(container, userId) {
  const mc = container.querySelector('#user-modal-container');
  mc.innerHTML = `
    <div class="modal-overlay" id="user-overlay">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">User Profile</span>
          <button class="modal-close" id="close-modal">✕</button>
        </div>
        <div class="modal-body" id="modal-content">
          <div class="loading"><div class="spinner"></div><p>Loading…</p></div>
        </div>
      </div>
    </div>`;

  const close = () => { mc.innerHTML = ''; };
  mc.querySelector('#close-modal').addEventListener('click', close);
  mc.querySelector('#user-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) close(); });

  try {
    const { data: { user: u, recentBookings, bookingStats } } = await adminAPI.getUserDetail(userId);
    const totalSpent = bookingStats.reduce((s, b) => s + (b.totalSpent || 0), 0);

    mc.querySelector('#modal-content').innerHTML = `
      <div class="profile-hero">
        <div class="profile-avatar-lg" style="overflow:hidden;" id="modal-avatar-user">
          ${u.avatar
            ? `<img src="${u.avatar}" alt="${u.name||''}"
                 style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
                 onerror="this.remove();document.getElementById('modal-avatar-user').textContent='${(u.name||'?').charAt(0).toUpperCase()}'" />`
            : (u.name||'?').charAt(0).toUpperCase()}
        </div>
        <div class="profile-hero-info">
          <h2>${u.name}</h2>
          <p>${u.email}</p>
          <div class="profile-badges">
            <span class="badge ${u.role==='advocate'?'badge-amber':'badge-teal'}">${u.role}</span>
            <span class="badge ${u.isActive?'badge-green':'badge-red'}">${u.isActive?'Active':'Banned'}</span>
            ${u.isEmailVerified ? '<span class="badge badge-teal">✓ Email Verified</span>' : ''}
          </div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item"><label>Phone</label><span>${u.phone || 'Not provided'}</span></div>
        <div class="info-item"><label>City</label><span>${u.address?.city || 'Not provided'}</span></div>
        <div class="info-item"><label>Joined</label><span>${fmtD(u.createdAt)}</span></div>
        <div class="info-item"><label>Last Seen</label><span>${u.lastSeen ? fmtD(u.lastSeen) : 'Never'}</span></div>
        <div class="info-item"><label>Total Spent</label><span>₹${totalSpent.toLocaleString('en-IN')}</span></div>
        <div class="info-item"><label>Total Bookings</label><span>${bookingStats.reduce((s,b)=>s+b.count,0)}</span></div>
      </div>

      ${recentBookings.length ? `
        <div class="section-title">Recent Bookings</div>
        ${recentBookings.slice(0,5).map(b => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #F9FAFB;">
            <span style="font-size:13px;color:var(--text-secondary);">${fmtD(b.date)}</span>
            <span class="badge ${b.status==='completed'?'badge-green':b.status==='cancelled'?'badge-red':'badge-amber'}">${b.status}</span>
            <span style="font-size:13px;font-weight:600;">₹${b.payment?.amount||0}</span>
          </div>`).join('')}
      ` : ''}
    `;
  } catch (err) {
    mc.querySelector('#modal-content').innerHTML = `<div class="error-msg">${err.message}</div>`;
  }
}

function renderPagination(container, selector, pagination, onPageChange) {
  const el = container.querySelector(selector);
  if (!el || !pagination) return;
  const { total, page, limit, pages } = pagination;
  const start = (page-1)*limit+1, end = Math.min(page*limit, total);

  const pageNums = [];
  let from = Math.max(1, page-2), to = Math.min(pages, from+4);
  if (to - from < 4) from = Math.max(1, to-4);
  for (let p = from; p <= to; p++) pageNums.push(p);

  el.innerHTML = `
    <span>Showing <strong>${start}–${end}</strong> of <strong>${total}</strong></span>
    <div class="pagination-btns">
      <button class="page-btn" ${page<=1?'disabled':''} data-page="${page-1}">‹</button>
      ${pageNums.map(p=>`<button class="page-btn ${p===page?'active':''}" data-page="${p}">${p}</button>`).join('')}
      <button class="page-btn" ${page>=pages?'disabled':''} data-page="${page+1}">›</button>
    </div>`;

  el.querySelectorAll('[data-page]').forEach(btn =>
    btn.addEventListener('click', () => { if (!btn.disabled) onPageChange(Number(btn.dataset.page)); }));
}
