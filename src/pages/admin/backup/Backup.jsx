import React, { useState, useEffect, useRef } from 'react';
import { adminService } from '../../../api/services';
import { formatDateLong, getErrorMsg } from '../../../utils/helpers';
import toast from 'react-hot-toast';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Spinner from '../../../components/common/Spinner';
import './Backup.css';

// ─── Mock backup history (replace with API when backend is ready) ──────────
const MOCK_BACKUPS = [
  {
    id: 'bkp_001',
    label: 'Full System Backup',
    type: 'AUTO',
    size: '12.4 MB',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'SUCCESS',
    includes: ['tenants', 'invoices', 'customers', 'products', 'payments'],
  },
  {
    id: 'bkp_002',
    label: 'Manual Backup',
    type: 'MANUAL',
    size: '11.8 MB',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'SUCCESS',
    includes: ['tenants', 'invoices', 'customers', 'products', 'payments'],
  },
  {
    id: 'bkp_003',
    label: 'Full System Backup',
    type: 'AUTO',
    size: '10.9 MB',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    status: 'SUCCESS',
    includes: ['tenants', 'invoices', 'customers', 'products', 'payments'],
  },
  {
    id: 'bkp_004',
    label: 'Full System Backup',
    type: 'AUTO',
    size: '—',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    status: 'FAILED',
    includes: [],
  },
];

const INCLUDE_OPTIONS = [
  { key: 'tenants', label: 'Tenants & Users' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'customers', label: 'Customers' },
  { key: 'products', label: 'Products & Inventory' },
  { key: 'payments', label: 'Payments' },
  { key: 'subscriptions', label: 'Subscriptions' },
  { key: 'branding', label: 'Branding Settings' },
];

export default function Backup() {
  const [backups, setBackups] = useState(MOCK_BACKUPS);
  const [taking, setTaking] = useState(false);
  const [restoring, setRestoring] = useState(null);
  const [selected, setSelected] = useState(['tenants', 'invoices', 'customers', 'products', 'payments']);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [scheduleFreq, setScheduleFreq] = useState('daily');
  const [confirmRestore, setConfirmRestore] = useState(null);
  const [progress, setProgress] = useState(null);
  const fileRef = useRef();

  const toggleInclude = (key) => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const simulateProgress = (label, onDone) => {
    setProgress({ label, pct: 0 });
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.floor(Math.random() * 18) + 5;
      if (pct >= 100) {
        pct = 100;
        clearInterval(iv);
        setTimeout(() => {
          setProgress(null);
          onDone();
        }, 400);
      }
      setProgress({ label, pct });
    }, 280);
  };

  const handleTakeBackup = () => {
    if (selected.length === 0) {
      toast.error('Select at least one data type to backup');
      return;
    }
    setTaking(true);
    simulateProgress('Creating backup…', () => {
      const newBkp = {
        id: `bkp_${Date.now()}`,
        label: 'Manual Backup',
        type: 'MANUAL',
        size: `${(10 + Math.random() * 5).toFixed(1)} MB`,
        createdAt: new Date().toISOString(),
        status: 'SUCCESS',
        includes: [...selected],
      };
      setBackups(prev => [newBkp, ...prev]);
      toast.success('Backup created successfully!');
      setTaking(false);
    });
  };

  const handleDownload = (bkp) => {
    // In production: call API to get signed download URL
    const blob = new Blob([JSON.stringify({ backup: bkp, note: 'Mock backup file' }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billmaster_backup_${bkp.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup downloaded');
  };

  const handleRestore = (bkp) => {
    setConfirmRestore(bkp);
  };

  const confirmAndRestore = () => {
    const bkp = confirmRestore;
    setConfirmRestore(null);
    setRestoring(bkp.id);
    simulateProgress('Restoring backup…', () => {
      toast.success(`Restored from: ${new Date(bkp.createdAt).toLocaleString()}`);
      setRestoring(null);
    });
  };

  const handleFileRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRestoring('file');
    simulateProgress(`Restoring from file: ${file.name}`, () => {
      toast.success('System restored from uploaded file!');
      setRestoring(null);
    });
    e.target.value = '';
  };

  const handleDeleteBackup = (id) => {
    if (!window.confirm('Delete this backup permanently?')) return;
    setBackups(prev => prev.filter(b => b.id !== id));
    toast.success('Backup deleted');
  };

  const formatRelative = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return 'Just now';
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="backup-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Backup & Restore</h1>
          <p className="page-subtitle">Protect your platform data with full system backups</p>
        </div>
      </div>

      {/* Progress overlay */}
      {progress && (
        <div className="backup-progress-overlay">
          <div className="backup-progress-box">
            <div className="backup-progress-label">{progress.label}</div>
            <div className="backup-progress-bar-wrap">
              <div className="backup-progress-bar" style={{ width: `${progress.pct}%` }} />
            </div>
            <div className="backup-progress-pct">{progress.pct}%</div>
          </div>
        </div>
      )}

      {/* Restore confirm modal */}
      {confirmRestore && (
        <div className="backup-modal-overlay">
          <div className="backup-modal">
            <div className="backup-modal-icon">⚠️</div>
            <h3>Restore this backup?</h3>
            <p>This will overwrite all current data with the backup from <strong>{formatRelative(confirmRestore.createdAt)}</strong>. This action cannot be undone.</p>
            <div className="backup-modal-actions">
              <Button variant="outline" onClick={() => setConfirmRestore(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmAndRestore}>Yes, Restore</Button>
            </div>
          </div>
        </div>
      )}

      <div className="backup-grid">
        {/* Left: Take Backup */}
        <div className="backup-left">
          <Card title="Create New Backup">
            <div className="backup-include-label">Include in backup:</div>
            <div className="backup-include-list">
              {INCLUDE_OPTIONS.map(opt => (
                <label key={opt.key} className="backup-checkbox-row">
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.key)}
                    onChange={() => toggleInclude(opt.key)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            <Button
              variant="primary"
              onClick={handleTakeBackup}
              loading={taking}
              className="backup-btn-full"
            >
              <UploadIcon /> Take Backup Now
            </Button>
          </Card>

          <Card title="Restore from File">
            <p className="backup-restore-note">Upload a previously downloaded <code>.json</code> backup file to restore system data.</p>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileRestore}
            />
            <Button
              variant="outline"
              onClick={() => fileRef.current.click()}
              loading={restoring === 'file'}
              className="backup-btn-full"
            >
              <FileIcon /> Upload & Restore File
            </Button>
          </Card>

          <Card title="Auto Backup Schedule">
            <div className="schedule-row">
              <label className="schedule-toggle-label">
                <span>Auto Backup</span>
                <div
                  className={`toggle-switch ${scheduleEnabled ? 'on' : ''}`}
                  onClick={() => {
                    setScheduleEnabled(p => !p);
                    toast.success(scheduleEnabled ? 'Auto backup disabled' : 'Auto backup enabled');
                  }}
                />
              </label>
            </div>
            {scheduleEnabled && (
              <div className="schedule-freq">
                <label>Frequency</label>
                <select value={scheduleFreq} onChange={e => setScheduleFreq(e.target.value)}>
                  <option value="hourly">Every Hour</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => toast.success(`Auto backup set to: ${scheduleFreq}`)}
                >
                  Save Schedule
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Backup History */}
        <div className="backup-right">
          <Card title={`Backup History (${backups.length})`}>
            {backups.length === 0 ? (
              <div className="backup-empty">No backups yet</div>
            ) : (
              <div className="backup-list">
                {backups.map(bkp => (
                  <div key={bkp.id} className="backup-item">
                    <div className="backup-item-top">
                      <div className="backup-item-left">
                        <div className="backup-item-name">{bkp.label}</div>
                        <div className="backup-item-meta">
                          <Badge color={bkp.type === 'AUTO' ? 'info' : 'primary'}>{bkp.type}</Badge>
                          <Badge color={bkp.status === 'SUCCESS' ? 'success' : 'danger'}>{bkp.status}</Badge>
                          <span className="backup-item-size">{bkp.size}</span>
                          <span className="backup-item-time">{formatRelative(bkp.createdAt)}</span>
                        </div>
                        {bkp.includes.length > 0 && (
                          <div className="backup-item-tags">
                            {bkp.includes.map(k => (
                              <span key={k} className="backup-tag">{k}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="backup-item-actions">
                        {bkp.status === 'SUCCESS' && (
                          <>
                            <button
                              className="backup-action-btn"
                              title="Download"
                              onClick={() => handleDownload(bkp)}
                            >
                              <DownloadIcon />
                            </button>
                            <button
                              className="backup-action-btn restore"
                              title="Restore"
                              onClick={() => handleRestore(bkp)}
                              disabled={!!restoring}
                            >
                              {restoring === bkp.id ? <Spinner size="xs" /> : <RestoreIcon />}
                            </button>
                          </>
                        )}
                        <button
                          className="backup-action-btn danger"
                          title="Delete"
                          onClick={() => handleDeleteBackup(bkp.id)}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                    <div className="backup-item-date">{formatDateLong(bkp.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function UploadIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:6,verticalAlign:'middle'}}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
}
function FileIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:6,verticalAlign:'middle'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function DownloadIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function RestoreIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>;
}
function TrashIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}