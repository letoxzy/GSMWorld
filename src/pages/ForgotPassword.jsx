import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import '../styles/Auth.css'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
      toast.success('Reset link sent! Check your email.')
    } catch (err) {
      if (err.code === 'auth/user-not-found') toast.error('No account found with this email')
      else toast.error('Failed to send reset email. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <img src="/logo.png" alt="Logo" className="auth-logo" />
          <h1 className="auth-brand-name">JOE, BEST</h1>
          <p className="auth-brand-sub">Communication System</p>
          <p className="auth-brand-gsm">G.S.M WORLD</p>
        </div>
        <div className="auth-tagline">
          <h2>Password Reset</h2>
          <p>We'll send a verification link to your Gmail to reset your password securely.</p>
          <div className="auth-perks">
            <span>🔐 Secure Reset</span>
            <span>📧 Email Verified</span>
            <span>⚡ Instant Link</span>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <Link to="/login" className="back-link"><FiArrowLeft /> Back to Login</Link>

          {sent ? (
            <div className="reset-success">
              <div className="reset-success-icon"><FiCheckCircle /></div>
              <h2>Check Your Email!</h2>
              <p>
                We've sent a password reset link to <strong>{email}</strong>.
                Click the link in your email to set a new password.
              </p>
              <div className="reset-steps">
                <div className="reset-step">
                  <span className="step-num">1</span>
                  <span>Open your Gmail inbox</span>
                </div>
                <div className="reset-step">
                  <span className="step-num">2</span>
                  <span>Click the reset link from G.S.M WORLD</span>
                </div>
                <div className="reset-step">
                  <span className="step-num">3</span>
                  <span>Set your new password</span>
                </div>
              </div>
              <button
                className="auth-submit-btn"
                onClick={() => { setSent(false); setEmail('') }}
              >
                Send Again
              </button>
              <p className="auth-switch">
                Remember your password? <Link to="/login">Sign In</Link>
              </p>
            </div>
          ) : (
            <>
              <h2 className="auth-title">Forgot Password?</h2>
              <p className="auth-subtitle">
                Enter your Gmail address and we'll send you a secure link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label>Gmail Address</label>
                  <div className="input-wrap">
                    <FiMail className="input-icon" />
                    <input
                      type="email"
                      placeholder="your@gmail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <p className="input-hint">📧 A password reset link will be sent to this Gmail</p>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? <span className="btn-spinner" /> : 'Send Reset Link'}
                </button>
              </form>

              <p className="auth-switch">
                Remember your password? <Link to="/login">Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
