import { adminAPI } from '../api.js';

const fmtD = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_BADGE = {
  pending:      'badge-amber',
  under_review: 'badge-blue',
  approved:     'badge-green',
  rejected:     'badge-red',
};

export function renderVerification() {
  const container = document.createElement('div');
  container.innerHTML = `
    <!-- Stats Row -->
    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px;">
      <div class="stat-card">
        <div class="stat-icon-wrap si-amber">⏳</div>
        <div class="stat-body">
          <div class="stat-value" id="v-pending">—</div>
          <div class="stat-label">Pending Review</div>
          <div class="stat-trend trend-down" id="v-pending-trend">Awaiting action</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap si-blue">🔍</div>
        <div class="stat-body">
          <div class="stat-value" id="v-review">—</div>
          <div class="stat-label">Under Review</div>
          <div class="stat-trend trend-flat">Being reviewed</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap si-green">✅</div>
        <div class="stat-body">
          <div class="stat-value" id="v-approved">—</div>
          <div class="stat-label">Total Approved</div>
          <div class="stat-trend trend-up">On platform</div>
        </div>
      </div>
    </div>

    <!-- Applications Card -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Advocate Applications</div>
          <div class="card-subtitle">Review credentials and approve or reject applications</div>
        </div>
        <div class="filter-group">
          <select id="v-status-filter" style="font-size:13px;">
            <option value="pending">⏳ Pending</option>
            <option value="under_review">🔍 Under Review</option>
            <option value="rejected">❌ Rejected</option>
            <option value="approved">✅ Approved</option>
          </select>
        </div>
      </div>

      <div id="v-list">
        <div class="loading" style="padding:40px 0;"><div class="spinner"></div><p>Loading applications…</p></div>
      </div>
    </div>
  `;

  container.querySelector('#v-status-filter').addEventListener('change', (e) => {
    loadVerifications(container, e.target.value);
  });

  loadStats(container);
  loadVerifications(container, 'pending');
  return container;
}

async function loadStats(container) {
  try {
    const { data } = await adminAPI.getStats();
    container.querySelector('#v-pending').textContent = data.pendingVerifications;
    if (data.pendingVerifications > 0) {
      container.querySelector('#v-pending-trend').textContent = '⚠️ Needs attention';
    } else {
      container.querySelector('#v-pending-trend').textContent = '✓ All clear!';
      container.querySelector('#v-pending-trend').className = 'stat-trend trend-up';
    }

    const { pagination } = await adminAPI.getAdvocates({ verificationStatus: 'under_review', limit: 1 });
    container.querySelector('#v-review').textContent = pagination?.total ?? '—';

    const { data: approved } = await adminAPI.getStats();
    container.querySelector('#v-approved').textContent = approved.totalAdvocates;
  } catch (err) {}
}

async function loadVerifications(container, status = 'pending') {
  const list = container.querySelector('#v-list');
  list.innerHTML = `<div class="loading" style="padding:40px 0;"><div class="spinner"></div></div>`;

  try {
    const { data } = await adminAPI.getAdvocates({ verificationStatus: status, limit: 50 });

    if (!data.length) {
      const msgs = {
        pending:      { icon: '🎉', title: 'No pending applications!', sub: 'You\'re all caught up.' },
        under_review: { icon: '📋', title: 'No applications under review', sub: '' },
        rejected:     { icon: '📁', title: 'No rejected applications', sub: '' },
        approved:     { icon: '✅', title: 'No approved advocates yet', sub: '' },
      };
      const m = msgs[status];
      list.innerHTML = `
        <div class="empty-state" style="padding:60px 24px;">
          <div class="empty-icon">${m.icon}</div>
          <p>${m.title}</p>
          ${m.sub ? `<small>${m.sub}</small>` : ''}
        </div>`;
      return;
    }

    list.innerHTML = data.map(a => {
      const u = a.user || {};
      const missingDocs = !a.documents?.barCouncilCertificate || !a.documents?.degreeDocument || !a.documents?.idProof;

      return `
        <div class="verify-card" data-id="${a._id}">
          <div class="verify-avatar">${(u.name||'?').charAt(0).toUpperCase()}</div>
          <div class="verify-info">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
              <span class="verify-name">${u.name || 'Unknown'}</span>
              <span class="badge ${STATUS_BADGE[a.verificationStatus]||'badge-gray'}">${a.verificationStatus}</span>
              ${missingDocs ? '<span class="badge badge-red">⚠️ Missing Docs</span>' : '<span class="badge badge-green">✓ Docs Submitted</span>'}
            </div>
            <div class="verify-meta">${u.email || ''} · ${u.phone || 'No phone'}</div>

            <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:8px;font-size:13px;color:var(--text-secondary);">
              <span>📋 <strong style="color:var(--text-primary);">${a.barCouncilNumber}</strong></span>
              <span>⚖️ ${a.experience} yrs</span>
              <span>💰 ₹${(a.consultationFee||0).toLocaleString('en-IN')}/consult</span>
              <span>📍 ${a.location?.address?.city || 'Unknown city'}</span>
            </div>

            <div class="verify-tags">
              ${(a.specializations||[]).map(s => `<span class="badge badge-blue" style="font-size:11px;">${s}</span>`).join('')}
            </div>

            <div class="verify-docs">
              ${a.documents?.barCouncilCertificate
                ? `<a href="${a.documents.barCouncilCertificate}" target="_blank" class="btn btn-ghost btn-sm">📄 Certificate</a>`
                : `<span style="font-size:12px;color:var(--error);">❌ No certificate</span>`}
              ${a.documents?.degreeDocument
                ? `<a href="${a.documents.degreeDocument}" target="_blank" class="btn btn-ghost btn-sm">🎓 Degree</a>`
                : `<span style="font-size:12px;color:var(--error);">❌ No degree</span>`}
              ${a.documents?.idProof
                ? `<a href="${a.documents.idProof}" target="_blank" class="btn btn-ghost btn-sm">🪪 ID Proof</a>`
                : `<span style="font-size:12px;color:var(--error);">❌ No ID</span>`}
            </div>

            <div style="font-size:11px;color:var(--text-muted);margin-top:8px;">Applied: ${fmtD(a.createdAt)}</div>
          </div>

          <div class="verify-actions">
            ${status !== 'approved' ? `<button class="btn btn-success btn-sm approve-v" data-id="${a._id}">✅ Approve</button>` : ''}
            ${status !== 'rejected' ? `<button class="btn btn-danger btn-sm reject-v"  data-id="${a._id}">❌ Reject</button>` : ''}
            ${status === 'pending'  ? `<button class="btn btn-ghost btn-sm review-v"  data-id="${a._id}">🔍 Review</button>` : ''}
          </div>
        </div>`;
    }).join('');

    list.querySelectorAll('.approve-v').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`Approve this advocate? They will appear to clients immediately.`)) return;
        btn.disabled = true; btn.textContent = '…';
        try { await adminAPI.verifyAdvocate(btn.dataset.id, 'approved'); btn.closest('[data-id]').remove(); loadStats(container); }
        catch (err) { alert(err.message); btn.disabled = false; }
      });
    });

    list.querySelectorAll('.reject-v').forEach(btn => {
      btn.addEventListener('click', async () => {
        const note = prompt('Reason for rejection (required):');
        if (!note?.trim()) return;
        btn.disabled = true; btn.textContent = '…';
        try { await adminAPI.verifyAdvocate(btn.dataset.id, 'rejected', note); btn.closest('[data-id]').remove(); loadStats(container); }
        catch (err) { alert(err.message); btn.disabled = false; }
      });
    });

    list.querySelectorAll('.review-v').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true; btn.textContent = '…';
        try { await adminAPI.verifyAdvocate(btn.dataset.id, 'under_review'); btn.closest('[data-id]').remove(); loadStats(container); }
        catch (err) { alert(err.message); btn.disabled = false; }
      });
    });

  } catch (err) {
    list.innerHTML = `<div class="error-msg" style="margin:20px;">${err.message}</div>`;
  }
}
