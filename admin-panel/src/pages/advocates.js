import { adminAPI } from '../api.js';

let currentPage = 1;
let currentFilters = {};

const fmtD = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_BADGE = {
  pending:      'badge-amber',
  under_review: 'badge-blue',
  approved:     'badge-green',
  rejected:     'badge-red',
};

export function renderAdvocates() {
  const container = document.createElement('div');
  container.innerHTML = `
    <div class="page-toolbar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" id="adv-search" placeholder="Search by name or email…" />
      </div>
      <div class="filter-group">
        <select id="verify-filter">
          <option value="">All Verifications</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>

    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Advocate</th>
              <th>Bar Council No.</th>
              <th>Specialization</th>
              <th>Experience</th>
              <th>Fee</th>
              <th>Rating</th>
              <th>Verification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="adv-tbody">
            <tr><td colspan="8"><div class="loading"><div class="spinner"></div></div></td></tr>
          </tbody>
        </table>
      </div>
      <div class="pagination" id="adv-pagination"></div>
    </div>

    <div id="adv-modal-container"></div>
  `;

  let searchTimeout;
  container.querySelector('#adv-search').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage = 1; currentFilters.search = e.target.value.trim(); loadAdvocates(container);
    }, 380);
  });
  container.querySelector('#verify-filter').addEventListener('change', (e) => {
    currentPage = 1; currentFilters.verificationStatus = e.target.value; loadAdvocates(container);
  });

  loadAdvocates(container);
  return container;
}

async function loadAdvocates(container) {
  const tbody = container.querySelector('#adv-tbody');
  tbody.innerHTML = `<tr><td colspan="8"><div class="loading"><div class="spinner"></div></div></td></tr>`;

  try {
    const { data, pagination } = await adminAPI.getAdvocates({ page: currentPage, ...currentFilters });

    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="8">
        <div class="empty-state"><div class="empty-icon">⚖️</div><p>No advocates found</p><small>Try adjusting your filters</small></div>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(a => {
      const u = a.user || {};
      return `
        <tr>
          <td>
            <div class="avatar-cell">
              <div class="table-avatar">
                ${u.avatar ? `<img src="${u.avatar}" alt="${u.name}" />` : (u.name||'?').charAt(0).toUpperCase()}
              </div>
              <div>
                <div class="av-name">${u.name || 'Unknown'}</div>
                <div class="av-sub">${u.email || ''}</div>
              </div>
            </div>
          </td>
          <td style="font-size:12px;color:var(--text-secondary);font-family:monospace;">${a.barCouncilNumber}</td>
          <td style="font-size:12px;">${(a.specializations||[]).slice(0,2).join(', ') || '—'}</td>
          <td style="font-size:13px;">${a.experience} yrs</td>
          <td style="font-size:13px;font-weight:600;">₹${(a.consultationFee||0).toLocaleString('en-IN')}</td>
          <td style="font-size:13px;">⭐ ${(a.rating?.average||0).toFixed(1)} <span style="color:var(--text-muted);font-size:11px;">(${a.rating?.count||0})</span></td>
          <td><span class="badge ${STATUS_BADGE[a.verificationStatus]||'badge-gray'}">${a.verificationStatus}</span></td>
          <td>
            <div style="display:flex;gap:5px;flex-wrap:wrap;">
              <button class="btn btn-teal-ghost btn-sm view-adv-btn" data-id="${a._id}">View</button>
              ${a.verificationStatus === 'pending' || a.verificationStatus === 'under_review' ? `
                <button class="btn btn-success btn-xs approve-btn" data-id="${a._id}">✓</button>
                <button class="btn btn-danger btn-xs reject-btn" data-id="${a._id}">✗</button>` : ''}
            </div>
          </td>
        </tr>`;
    }).join('');

    renderPagination(container, '#adv-pagination', pagination, p => { currentPage = p; loadAdvocates(container); });

    container.querySelectorAll('.view-adv-btn').forEach(btn =>
      btn.addEventListener('click', () => showAdvocateModal(container, btn.dataset.id)));

    container.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Approve this advocate? They will be visible to clients.')) return;
        btn.disabled = true; btn.textContent = '…';
        try { await adminAPI.verifyAdvocate(btn.dataset.id, 'approved'); loadAdvocates(container); }
        catch (err) { alert(err.message); btn.disabled = false; }
      });
    });

    container.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const note = prompt('Reason for rejection (required):');
        if (!note?.trim()) return;
        btn.disabled = true; btn.textContent = '…';
        try { await adminAPI.verifyAdvocate(btn.dataset.id, 'rejected', note); loadAdvocates(container); }
        catch (err) { alert(err.message); btn.disabled = false; }
      });
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="error-msg" style="margin:16px;">${err.message}</div></td></tr>`;
  }
}

async function showAdvocateModal(container, advocateId) {
  const mc = container.querySelector('#adv-modal-container');
  mc.innerHTML = `
    <div class="modal-overlay" id="adv-overlay">
      <div class="modal" style="max-width:680px;">
        <div class="modal-header">
          <span class="modal-title">Advocate Profile</span>
          <button class="modal-close" id="close-adv">✕</button>
        </div>
        <div class="modal-body" id="adv-modal-body">
          <div class="loading"><div class="spinner"></div><p>Loading profile…</p></div>
        </div>
      </div>
    </div>`;

  const close = () => { mc.innerHTML = ''; };
  mc.querySelector('#close-adv').addEventListener('click', close);
  mc.querySelector('#adv-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) close(); });

  try {
    const { data: { advocate: a, recentBookings } } = await adminAPI.getAdvocateDetail(advocateId);
    const u = a.user || {};

    const body = mc.querySelector('#adv-modal-body');
    body.innerHTML = `
      <div class="profile-hero">
        <div class="profile-avatar-lg" style="overflow:hidden;" id="modal-avatar-adv">
          ${u.avatar
            ? `<img src="${u.avatar}" alt="${u.name||''}"
                 style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
                 onerror="this.remove();document.getElementById('modal-avatar-adv').textContent='${(u.name||'?').charAt(0).toUpperCase()}'" />`
            : (u.name||'?').charAt(0).toUpperCase()}
        </div>
        <div class="profile-hero-info">
          <h2>${u.name || 'Unknown'}</h2>
          <p>${u.email || ''} · ${u.phone || 'No phone'}</p>
          <div class="profile-badges">
            <span class="badge ${STATUS_BADGE[a.verificationStatus]||'badge-gray'}">${a.verificationStatus}</span>
            <span class="badge badge-teal">${a.experience} yrs exp</span>
            <span class="badge badge-amber">₹${(a.consultationFee||0).toLocaleString('en-IN')}/consult</span>
            <span class="badge badge-blue">⭐ ${(a.rating?.average||0).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item"><label>Bar Council No.</label><span style="font-family:monospace;">${a.barCouncilNumber}</span></div>
        <div class="info-item"><label>City</label><span>${a.location?.address?.city || 'N/A'}</span></div>
        <div class="info-item"><label>Total Consultations</label><span>${a.totalConsultations}</span></div>
        <div class="info-item"><label>Reviews</label><span>${a.rating?.count} reviews</span></div>
        <div class="info-item"><label>Languages</label><span>${(a.languages||[]).join(', ')||'N/A'}</span></div>
        <div class="info-item"><label>Joined</label><span>${fmtD(u.createdAt||a.createdAt)}</span></div>
      </div>

      <div class="section-title">Specializations</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;padding:6px 0 14px;">
        ${(a.specializations||[]).map(s=>`<span class="badge badge-blue">${s}</span>`).join('') || '<span style="color:var(--text-muted);font-size:13px;">None listed</span>'}
      </div>

      ${a.documents?.barCouncilCertificate || a.documents?.degreeDocument || a.documents?.idProof ? `
        <div class="section-title">Documents</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;padding:6px 0 14px;">
          ${a.documents.barCouncilCertificate ? `<a href="${a.documents.barCouncilCertificate}" target="_blank" class="btn btn-ghost btn-sm">📄 Certificate</a>` : ''}
          ${a.documents.degreeDocument       ? `<a href="${a.documents.degreeDocument}"       target="_blank" class="btn btn-ghost btn-sm">🎓 Degree</a>` : ''}
          ${a.documents.idProof              ? `<a href="${a.documents.idProof}"              target="_blank" class="btn btn-ghost btn-sm">🪪 ID Proof</a>` : ''}
        </div>` : ''}

      ${a.verificationStatus !== 'approved' ? `
        <div class="section-title">Verification Action</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;padding:6px 0;">
          <button class="btn btn-success modal-approve" data-id="${a._id}">✅ Approve</button>
          <button class="btn btn-danger modal-reject" data-id="${a._id}">❌ Reject</button>
          <button class="btn btn-ghost modal-review" data-id="${a._id}">🔍 Set Under Review</button>
        </div>` : ''}
    `;

    const doVerify = async (status, promptMsg) => {
      let note = '';
      if (promptMsg) { note = prompt(promptMsg); if (!note?.trim()) return; }
      try { await adminAPI.verifyAdvocate(a._id, status, note); close(); loadAdvocates(container); }
      catch (err) { alert(err.message); }
    };
    body.querySelector('.modal-approve')?.addEventListener('click', () => doVerify('approved'));
    body.querySelector('.modal-reject')?.addEventListener('click',  () => doVerify('rejected',     'Reason for rejection:'));
    body.querySelector('.modal-review')?.addEventListener('click',  () => doVerify('under_review'));

  } catch (err) {
    mc.querySelector('#adv-modal-body').innerHTML = `<div class="error-msg">${err.message}</div>`;
  }
}

function renderPagination(container, selector, pagination, onPageChange) {
  const el = container.querySelector(selector);
  if (!el || !pagination) return;
  const { total, page, limit, pages } = pagination;
  const start = (page-1)*limit+1, end = Math.min(page*limit, total);

  const pageNums = [];
  let from = Math.max(1, page-2), to = Math.min(pages, from+4);
  if (to-from<4) from = Math.max(1, to-4);
  for (let p = from; p <= to; p++) pageNums.push(p);

  el.innerHTML = `
    <span>Showing <strong>${start}–${end}</strong> of <strong>${total}</strong> advocates</span>
    <div class="pagination-btns">
      <button class="page-btn" ${page<=1?'disabled':''} data-page="${page-1}">‹</button>
      ${pageNums.map(p=>`<button class="page-btn ${p===page?'active':''}" data-page="${p}">${p}</button>`).join('')}
      <button class="page-btn" ${page>=pages?'disabled':''} data-page="${page+1}">›</button>
    </div>`;

  el.querySelectorAll('[data-page]').forEach(btn =>
    btn.addEventListener('click', () => { if (!btn.disabled) onPageChange(Number(btn.dataset.page)); }));
}
