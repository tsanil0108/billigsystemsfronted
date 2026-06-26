import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../api/services';
import { getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import './Signup.css';

export default function Signup() {
  const [form, setForm] = useState({
    companyName: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    gstNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.signup(form);
      const { token, fullName, role, tenantId } = res.data;
      login(token, { fullName, role, tenantId });
      toast.success('Welcome to BillMaster!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-container-wide">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div>
              <h1 className="auth-logo-name">BillMaster</h1>
              <p className="auth-logo-sub">Start Free Trial</p>
            </div>
          </div>

          <div className="auth-header">
            <h2>Create your account</h2>
            <p>14 days free trial — no credit card required</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="companyName"
                  className="form-input"
                  placeholder="Your Company"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  placeholder="Amit Kumar"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password <span className="required">*</span></label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  minLength="6"
                  required
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
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  className="form-input"
                  placeholder="27ABCDE1234F1Z5"
                  value={form.gstNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="auth-submit">
              Create Free Account
            </Button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}