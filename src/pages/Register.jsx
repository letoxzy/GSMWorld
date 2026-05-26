import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import toast from 'react-hot-toast'
import '../styles/Auth.css'

export default function Register() {
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form.email, form.password, form.name)
      toast.success('Account created! Welcome 🎉')
      navigate('/')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') toast.error('Email already registered')
      else toast.error('Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      toast.success('Account created with Google! 🎉')
      navigate('/')
    } catch (err) {
      toast.error('Google sign-up failed')
    } finally {
      setGoogleLoading(false)
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
          <h2>Join G.S.M WORLD Today</h2>
          <p>Get access to exclusive deals, track your orders and save your favourites.</p>
          <div className="auth-perks">
            <span>🎁 Exclusive Deals</span>
            <span>📦 Order Tracking</span>
            <span>💖 Save Wishlist</span>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join thousands of happy customers</p>

          <button className="google-btn" onClick={handleGoogle} disabled={googleLoading}>
            <FcGoogle size={20} />
            {googleLoading ? 'Creating account...' : 'Sign up with Google'}
          </button>

          <div className="auth-divider"><span>or register with email</span></div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrap">
                <FiUser className="input-icon" />
                <input type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrap">
                <FiMail className="input-icon" />
                <input type="email" name="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrap">
                <FiLock className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-wrap">
                <FiLock className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="confirm"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="password-strength">
              {['Weak', 'Fair', 'Good', 'Strong'].map((s, i) => (
                <div key={s} className={`strength-bar ${form.password.length > i * 3 ? 'active' : ''}`} />
              ))}
            </div>

            <label className="terms-check">
              <input type="checkbox" required />
              I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </label>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
