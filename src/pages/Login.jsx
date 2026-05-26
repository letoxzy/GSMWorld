import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ADMIN_EMAIL } from '../context/AuthContext'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import toast from 'react-hot-toast'
import '../styles/Auth.css'

export default function Login() {
  const { login, loginWithGoogle, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back! 👋')
      if (email === ADMIN_EMAIL) navigate('/admin')
      else navigate('/')
    } catch (err) {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      toast.success('Logged in with Google! 🎉')
      navigate('/')
    } catch (err) {
      toast.error('Google sign-in failed')
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
          <h2>Your Trusted Phone Shop in Enugu</h2>
          <p>Quality phones & accessories at Ogbete Main Market</p>
          <div className="auth-perks">
            <span>✅ Genuine Products</span>
            <span>🚚 Fast Delivery</span>
            <span>💯 Best Prices</span>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your account</p>

          <button className="google-btn" onClick={handleGoogle} disabled={googleLoading}>
            <FcGoogle size={20} />
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="auth-divider"><span>or sign in with email</span></div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrap">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrap">
                <FiLock className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="form-row">
              <label className="remember-me">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
