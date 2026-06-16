import { adminAPI } from '../api.js';

const fmtDT = (d) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' · ' +
    dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export function renderSettings() {
  const container = document.createElement('div');
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:start;">

      <!-- LEFT: Settings -->
      <div style="display:flex;flex-direction:column;gap:22px;">

        <!-- Platform Settings -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Platform Settings</div>
              <div class="card-subtitle">Configure commissions, fees & booking rules</div>
            </div>
          </div>
          <div class="card-body">

            <div class="settings-section">
              <div class="settings-section-title">💰 Financial</div>

              <div class="setting-row">
                <div class="setting-info">
                  <label>Commission Rate</label>
                  <p>Platform cut from each completed booking</p>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <input type="number" id="commission-rate" value="15" min="0" max="50"
                    style="width:72px;text-align:center;font-weight:700;" />
                  <span style="font-size:13px;color:var(--text-secondary);">%</span>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <label>Minimum Consultation Fee</label>
                  <p>Advocates cannot charge below this</p>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="font-size:13px;color:var(--text-secondary);">₹</span>
                  <input type="number" id="min-fee" value="200" min="0"
                    style="width:96px;text-align:center;font-weight:700;" />
                </div>
              </div>
            </div>

            <div class="settings-section">
              <div class="settings-section-title">⚙️ Booking Rules</div>

              <div class="setting-row">
                <div class="setting-info">
                  <label>Advance Booking Days</label>
                  <p>How far in advance clients can book</p>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <input type="number" id="max-advance" value="30" min="1" max="90"
                    style="width:72px;text-align:center;font-weight:700;" />
                  <span style="font-size:13px;color:var(--text-secondary);">days</span>
                </div>
              </div>
            </div>

            <div class="settings-section">
              <div class="settings-section-title">🔧 Feature Flags</div>

              ${[
                { id: 'ai-enabled',            label: 'AI Legal Assistant',    desc: 'Enable AI assistant for clients' },
                { id: 'push-enabled',          label: 'Push Notifications',    desc: 'Deliver push notifications via FCM' },
                { id: 'registrations-enabled', label: 'New Registrations',     desc: 'Allow new users to sign up' },
                { id: 'google-enabled',        label: 'Google Sign-In',        desc: 'Enable Google OAuth login' },
              ].map(f => `
                <div class="setting-row">
                  <div class="setting-info">
                    <label>${f.label}</label>
                    <p>${f.desc}</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" id="${f.id}" checked />
                    <span class="toggle-slider"></span>
                  </label>
                </div>`).join('')}

              <div class="setting-row">
                <div class="setting-info">
                  <label>🔴 Maintenance Mode</label>
                  <p>Blocks all client-facing app access</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" id="maintenance-mode" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div id="settings-feedback" style="display:none;margin-bottom:12px;"></div>
            <button class="btn btn-primary" id="save-settings-btn">💾 Save Settings</button>
          </div>
        </div>

        <!-- Announcement -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">📢 Announcement Banner</div>
            <div class="card-subtitle">Shown to all users on the app home screen</div>
          </div>
          <div class="card-body">
            <div class="form-group" style="margin-bottom:14px;">
              <label class="form-label">Message</label>
              <textarea id="ann-text" rows="3"
                placeholder="e.g. System maintenance on Sunday 2–4 AM. Thank you for your patience."
                style="resize:vertical;"></textarea>
            </div>
            <div class="form-group" style="margin-bottom:20px;">
              <label class="form-label">Banner Type</label>
              <select id="ann-type">
                <option value="">None — Hide Banner</option>
                <option value="info">ℹ️ Info (blue)</option>
                <option value="warning">⚠️ Warning (amber)</option>
                <option value="success">✅ Success (green)</option>
              </select>
            </div>
            <button class="btn btn-primary" id="publish-ann-btn">📢 Publish Announcement</button>
          </div>
        </div>

      </div>

      <!-- RIGHT: Activity Logs -->
      <div class="card" style="position:sticky;top:90px;max-height:calc(100vh - 120px);display:flex;flex-direction:column;">
        <div class="card-header" style="flex-shrink:0;">
          <div>
            <div class="card-title">Activity Logs</div>
            <div class="card-subtitle">Recent platform events</div>
          </div>
          <button class="btn btn-teal-ghost btn-sm" id="refresh-logs">🔄 Refresh</button>
        </div>
        <div style="flex:1;overflow-y:auto;" id="logs-wrapper">
          <div class="loading" style="padding:32px 0;"><div class="spinner"></div></div>
        </div>
      </div>

    </div>
  `;

  // Fetch and populate settings
  const loadSettings = async () => {
    try {
      const { data: s } = await adminAPI.getSettings();
      if (!s) return;
      container.querySelector('#commission-rate').value = s.commissionRate;
      container.querySelector('#min-fee').value = s.minFee;
      container.querySelector('#max-advance').value = s.maxAdvanceBookingDays;
      container.querySelector('#ai-enabled').checked = s.features?.aiEnabled;
      container.querySelector('#push-enabled').checked = s.features?.pushEnabled;
      container.querySelector('#registrations-enabled').checked = s.features?.registrationsEnabled;
      container.querySelector('#google-enabled').checked = s.features?.googleEnabled;
      container.querySelector('#maintenance-mode').checked = s.maintenanceMode;
      container.querySelector('#ann-text').value = s.announcement?.text || '';
      container.querySelector('#ann-type').value = s.announcement?.type || '';
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };
  loadSettings();

  // Save settings
  container.querySelector('#save-settings-btn').addEventListener('click', async () => {
    const btn = container.querySelector('#save-settings-btn');
    const fb = container.querySelector('#settings-feedback');
    btn.disabled = true;
    btn.textContent = 'Saving...';
    try {
      await adminAPI.updateSettings({
        commissionRate: Number(container.querySelector('#commission-rate').value),
        minFee: Number(container.querySelector('#min-fee').value),
        maxAdvanceBookingDays: Number(container.querySelector('#max-advance').value),
        maintenanceMode: container.querySelector('#maintenance-mode').checked,
        features: {
          aiEnabled: container.querySelector('#ai-enabled').checked,
          pushEnabled: container.querySelector('#push-enabled').checked,
          registrationsEnabled: container.querySelector('#registrations-enabled').checked,
          googleEnabled: container.querySelector('#google-enabled').checked,
        }
      });
      fb.className = 'badge badge-green';
      fb.textContent = '✅ Settings saved successfully!';
      fb.style.display = 'block';
    } catch (err) {
      fb.className = 'badge badge-red';
      fb.textContent = `❌ Error: ${err.message}`;
      fb.style.display = 'block';
    }
    btn.disabled = false;
    btn.textContent = '💾 Save Settings';
    setTimeout(() => { fb.style.display = 'none'; }, 5000);
  });

  // Publish announcement
  container.querySelector('#publish-ann-btn').addEventListener('click', async () => {
    const text = container.querySelector('#ann-text').value.trim();
    const type = container.querySelector('#ann-type').value;
    const btn = container.querySelector('#publish-ann-btn');
    if (!type && text) { alert('Select a banner type before publishing.'); return; }
    if (!text && type) { alert('Please enter an announcement message or select None.'); return; }
    
    btn.disabled = true;
    btn.textContent = 'Publishing...';
    try {
      await adminAPI.updateSettings({
        announcement: { text, type }
      });
      alert(`✅ Announcement published!\n\nIt is now live on the mobile app.`);
    } catch (err) {
      alert(`❌ Error publishing announcement: ${err.message}`);
    }
    btn.disabled = false;
    btn.textContent = '📢 Publish Announcement';
  });

  // Logs
  const loadLogs = async () => {
    const wrapper = container.querySelector('#logs-wrapper');
    wrapper.innerHTML = `<div class="loading" style="padding:32px 0;"><div class="spinner"></div></div>`;
    try {
      const { data } = await adminAPI.getLogs(1);
      if (!data.length) {
        wrapper.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>No activity yet</p></div>`;
        return;
      }
      wrapper.innerHTML = data.map(log => `
        <div class="log-item">
          <div class="log-icon ${log.type === 'booking' ? 'log-booking' : log.type === 'user' ? 'log-user' : 'log-verification'}">
            ${log.type === 'booking' ? '📅' : log.type === 'user' ? '👤' : '🔍'}
          </div>
          <div class="log-content">
            <p>${log.action}</p>
            <time>${fmtDT(log.timestamp)}</time>
          </div>
        </div>
      `).join('');
    } catch (err) {
      wrapper.innerHTML = `<div class="error-msg" style="margin:16px;">${err.message}</div>`;
    }
  };

  container.querySelector('#refresh-logs').addEventListener('click', loadLogs);
  loadLogs();

  return container;
}
