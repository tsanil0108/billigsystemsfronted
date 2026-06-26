import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../api/services';
import { getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [tab, setTab] = useState('password'); // 'password' | 'loginid'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success('Reset link sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      toast.success('Password reset successful! Please login.');
      setStep(1);
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotLoginId = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotLoginId(phone);
      toast.success('Your login ID has been sent via WhatsApp!');
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <h1 className="auth-logo-name">BillMaster</h1>
              <p className="auth-logo-sub">Account Recovery</p>
            </div>
          </div>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'password' ? 'active' : ''}`}
              onClick={() => setTab('password')}
            >
              Forgot Password
            </button>
            <button
              className={`auth-tab ${tab === 'loginid' ? 'active' : ''}`}
              onClick={() => setTab('loginid')}
            >
              Forgot Login ID
            </button>
          </div>

          {tab === 'password' && (
            <>
              {step === 1 ? (
                <form className="auth-form" onSubmit={handleForgotPassword}>
                  <div className="auth-header">
                    <h2>Reset your password</h2>
                    <p>Enter your email and we'll send a reset link</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" variant="primary" size="lg" loading={loading} className="auth-submit">
                    Send Reset Link
                  </Button>
                </form>
              ) : (
                <form className="auth-form" onSubmit={handleResetPassword}>
                  <div className="auth-header">
                    <h2>Enter new password</h2>
                    <p>Use the token from your email</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reset Token</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Paste token from email"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength="6"
                      required
                    />
                  </div>
                  <Button type="submit" variant="primary" size="lg" loading={loading} className="auth-submit">
                    Reset Password
                  </Button>
                </form>
              )}
            </>
          )}

          {tab === 'loginid' && (
            <form className="auth-form" onSubmit={handleForgotLoginId}>
              <div className="auth-header">
                <h2>Recover Login ID</h2>
                <p>We'll send your registered email to your WhatsApp</p>
              </div>
              <div className="form-group">
                <label className="form-label">Registered Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="primary" size="lg" loading={loading} className="auth-submit">
                Send via WhatsApp
              </Button>
            </form>
          )}

          <p className="auth-footer">
            <Link to="/login" className="auth-link">← Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}