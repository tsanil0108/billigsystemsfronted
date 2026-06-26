import React, { useState, useEffect } from 'react';
import { tenantService, usersService, brandingService } from '../../api/services';  // ✅ Fixed: usersService
import { getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import './Settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [branding, setBranding] = useState(null);

  const loadData = async () => {
    try {
      const [profileRes, usersRes, brandingRes] = await Promise.all([
        tenantService.getProfile(),
        usersService.getAll(),  // ✅ Fixed
        brandingService.get().catch(() => ({ data: {} })),
      ]);
      setProfile(profileRes.data);
      setUsers(usersRes.data || []);
      setBranding(brandingRes.data || {});
    } catch (err) {
      toast.error(getErrorMsg(err));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      await tenantService.updateProfile(data);
      toast.success('Profile updated successfully');
      loadData();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const userColumns = [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { 
      key: 'role', 
      label: 'Role',
      render: (row) => <Badge color={row.role === 'ADMIN' ? 'primary' : 'gray'}>{row.role}</Badge>
    },
    { 
      key: 'active', 
      label: 'Status',
      render: (row) => (
        <Badge color={row.active ? 'success' : 'danger'}>
          {row.active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
  ];

  const tabs = [
    { id: 'profile', label: 'Company Profile' },
    { id: 'users', label: 'Users' },
    { id: 'branding', label: 'Branding' },
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
      </div>

      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <Card title="Company Profile">
          <form onSubmit={handleProfileUpdate}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  className="form-input"
                  defaultValue={profile?.companyName || ''}
                />
              </div>
              <div className="form-group">
                <label className="form-label">GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  className="form-input"
                  defaultValue={profile?.gstNumber || ''}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  defaultValue={profile?.phone || ''}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  defaultValue={profile?.email || ''}
                  disabled
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                className="form-input"
                defaultValue={profile?.address || ''}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  defaultValue={profile?.city || ''}
                />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  className="form-input"
                  defaultValue={profile?.state || ''}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  className="form-input"
                  defaultValue={profile?.pincode || ''}
                />
              </div>
            </div>

            <Button type="submit" variant="primary" loading={loading}>
              Update Profile
            </Button>
          </form>
        </Card>
      )}

      {activeTab === 'users' && (
        <Card title="Users">
          <Table
            columns={userColumns}
            data={users}
            emptyMessage="No users found"
          />
        </Card>
      )}

      {activeTab === 'branding' && (
        <Card title="Branding">
          <p className="branding-note">Customize your invoice and app appearance</p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData.entries());
              await brandingService.save(data);
              toast.success('Branding updated successfully');
              loadData();
            } catch (err) {
              toast.error(getErrorMsg(err));
            } finally {
              setLoading(false);
            }
          }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Logo URL</label>
                <input
                  type="text"
                  name="logoUrl"
                  className="form-input"
                  placeholder="https://cdn.example.com/logo.png"
                  defaultValue={branding?.logoUrl || ''}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Primary Color</label>
                <input
                  type="color"
                  name="primaryColor"
                  className="form-input color-picker"
                  defaultValue={branding?.primaryColor || '#2563EB'}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Invoice Footer Text</label>
              <input
                type="text"
                name="invoiceFooterText"
                className="form-input"
                placeholder="Thank you for your business!"
                defaultValue={branding?.invoiceFooterText || ''}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Terms & Conditions</label>
              <textarea
                name="termsAndConditions"
                className="form-textarea"
                placeholder="Terms and conditions..."
                defaultValue={branding?.termsAndConditions || ''}
              />
            </div>

            <Button type="submit" variant="primary" loading={loading}>
              Save Branding
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}