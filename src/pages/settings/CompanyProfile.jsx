import React, { useState } from 'react';
import { useTenant } from '../../hooks/useTenant';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

export default function CompanyProfile() {
  const { tenant, updateTenant } = useTenant();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: tenant?.companyName || '',
    gstNumber: tenant?.gstNumber || '',
    phone: tenant?.phone || '',
    address: tenant?.address || '',
    city: tenant?.city || '',
    state: tenant?.state || '',
    pincode: tenant?.pincode || '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateTenant(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Company Profile">
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              name="companyName"
              className="form-input"
              value={form.companyName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">GST Number</label>
            <input
              type="text"
              name="gstNumber"
              className="form-input"
              value={form.gstNumber}
              onChange={handleChange}
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
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={tenant?.email || ''}
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
            value={form.address}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              name="city"
              className="form-input"
              value={form.city}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">State</label>
            <input
              type="text"
              name="state"
              className="form-input"
              value={form.state}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Pincode</label>
            <input
              type="text"
              name="pincode"
              className="form-input"
              value={form.pincode}
              onChange={handleChange}
            />
          </div>
        </div>

        <Button type="submit" variant="primary" loading={loading}>
          Update Profile
        </Button>
      </form>
    </Card>
  );
}