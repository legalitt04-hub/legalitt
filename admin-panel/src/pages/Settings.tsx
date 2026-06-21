import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Settings as SettingsIcon, Save, Megaphone, Activity } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import api from '../lib/api';

const Settings = () => {
  const [settings, setSettings] = useState<any>({
    commissionRate: 15,
    minFee: 200,
    maxAdvanceBookingDays: 30,
    maintenanceMode: false,
    features: { aiEnabled: false, pushEnabled: false, registrationsEnabled: true, googleEnabled: true },
    announcement: { text: '', type: '' }
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [setRes, logsRes] = await Promise.all([
        api.get('/admin/settings'),
        api.get('/admin/logs?page=1&limit=20')
      ]);
      if (setRes.data.data) setSettings(setRes.data.data);
      if (logsRes.data.data) setLogs(logsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback('');
    try {
      await api.put('/admin/settings', settings);
      setFeedback('Settings saved successfully!');
      setTimeout(() => setFeedback(''), 3000);
    } catch (err: any) {
      setFeedback(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any, isFeature = false) => {
    if (isFeature) {
      setSettings((prev: any) => ({ ...prev, features: { ...prev.features, [field]: value } }));
    } else {
      setSettings((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const handleAnnouncementChange = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, announcement: { ...prev.announcement, [field]: value } }));
  };

  if (loading) return <div className="text-white text-center py-20">Loading Settings...</div>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-8">
      <div className="xl:col-span-2 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
          <div className="flex items-center gap-3">
            {feedback && <span className={`text-sm ${feedback.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>{feedback}</span>}
            <Button onClick={handleSave} disabled={saving} className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-medium">
              {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
            </Button>
          </div>
        </div>

        {/* Financial & Bookings */}
        <Card className="bg-slate-900/50 border-slate-800 p-8 backdrop-blur-sm space-y-8">
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-teal-500" />
              Financial & Booking Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Commission Rate (%)</label>
                <Input 
                  type="number" 
                  value={settings.commissionRate} 
                  onChange={(e) => handleChange('commissionRate', Number(e.target.value))}
                  className="bg-slate-950/50 border-slate-800 text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Min Consultation Fee (₹)</label>
                <Input 
                  type="number" 
                  value={settings.minFee} 
                  onChange={(e) => handleChange('minFee', Number(e.target.value))}
                  className="bg-slate-950/50 border-slate-800 text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Max Advance Booking (Days)</label>
                <Input 
                  type="number" 
                  value={settings.maxAdvanceBookingDays} 
                  onChange={(e) => handleChange('maxAdvanceBookingDays', Number(e.target.value))}
                  className="bg-slate-950/50 border-slate-800 text-white" 
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Feature Flags */}
        <Card className="bg-slate-900/50 border-slate-800 p-8 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-teal-500" />
            Feature Flags
          </h3>
          <div className="space-y-4">
            {[
              { id: 'aiEnabled', label: 'AI Legal Assistant', desc: 'Enable AI assistant for clients' },
              { id: 'pushEnabled', label: 'Push Notifications', desc: 'Deliver push notifications via FCM' },
              { id: 'registrationsEnabled', label: 'New Registrations', desc: 'Allow new users to sign up' },
              { id: 'googleEnabled', label: 'Google Sign-In', desc: 'Enable Google OAuth login' },
            ].map((f) => (
              <div key={f.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/30">
                <div>
                  <p className="font-medium text-white">{f.label}</p>
                  <p className="text-sm text-slate-400">{f.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.features[f.id]} onChange={(e) => handleChange(f.id, e.target.checked, true)} />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
              </div>
            ))}
            <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <div>
                <p className="font-medium text-red-400">Maintenance Mode</p>
                <p className="text-sm text-red-400/70">Blocks all client-facing app access</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.maintenanceMode} onChange={(e) => handleChange('maintenanceMode', e.target.checked)} />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Announcement Banner */}
        <Card className="bg-slate-900/50 border-slate-800 p-8 backdrop-blur-sm">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-teal-500" />
            Announcement Banner
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Message</label>
              <textarea 
                value={settings.announcement?.text || ''}
                onChange={(e) => handleAnnouncementChange('text', e.target.value)}
                rows={3} 
                className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                placeholder="e.g. System maintenance on Sunday..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Banner Type</label>
              <select 
                value={settings.announcement?.type || ''}
                onChange={(e) => handleAnnouncementChange('type', e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-teal-500/50 appearance-none"
              >
                <option value="">None — Hide Banner</option>
                <option value="info">ℹ️ Info (blue)</option>
                <option value="warning">⚠️ Warning (amber)</option>
                <option value="success">✅ Success (green)</option>
              </select>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-slate-800 hover:bg-slate-700 text-white">Publish Announcement</Button>
          </div>
        </Card>
      </div>

      {/* Activity Logs Sidebar */}
      <div className="xl:col-span-1">
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm flex flex-col h-full max-h-[calc(100vh-120px)] sticky top-24">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-500" />
              Activity Logs
            </h3>
            <button onClick={fetchData} className="text-xs text-teal-400 hover:text-teal-300">Refresh</button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto hidden-scrollbar space-y-4">
            {logs.length === 0 ? (
              <div className="text-center text-slate-500 text-sm py-10">No activity yet.</div>
            ) : (
              logs.map((log, i) => (
                <div key={log._id || i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm flex-shrink-0">
                    {log.type === 'booking' ? '📅' : log.type === 'user' ? '👤' : '🔍'}
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">{log.action}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
