import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX, FiLogOut, FiPackage, FiSettings } from 'react-icons/fi'
import '../styles/Navbar.css'

export default function Navbar() {
  const { currentUser, isAdmin, logout } = useAuth()
  const { cartCount } = useCart()
  const { wishlistItems } = useWishlist()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/')
    setDropdownOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <img src="/logo.png" alt="Logo" className="navbar-logo" />
          <div className="brand-text">
            <span className="brand-name">JOE, BEST</span>
            <span className="brand-sub">Communication System</span>
            <span className="brand-gsm">G.S.M WORLD</span>
          </div>
        </Link>

        {/* Search */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search phones, accessories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit"><FiSearch /></button>
        </form>

        {/* Actions */}
        <div className="navbar-actions">
          <Link to="/wishlist" className="nav-icon-btn">
            <FiHeart />
            {wishlistItems.length > 0 && <span className="badge">{wishlistItems.length}</span>}
          </Link>
          <Link to="/cart" className="nav-icon-btn">
            <FiShoppingCart />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>

          {currentUser ? (
            <div className="user-dropdown" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="user-avatar">
                {currentUser.photoURL
                  ? <img src={currentUser.photoURL} alt="avatar" />
                  : <span>{currentUser.displayName?.[0]?.toUpperCase() || 'U'}</span>
                }
              </div>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}><FiUser /> Profile</Link>
                  <Link to="/orders" onClick={() => setDropdownOpen(false)}><FiPackage /> My Orders</Link>
                  {isAdmin() && <Link to="/admin" onClick={() => setDropdownOpen(false)}><FiSettings /> Admin Panel</Link>}
                  <button onClick={handleLogout}><FiLogOut /> Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-register">Sign Up</Link>
            </div>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit"><FiSearch /></button>
          </form>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</Link>
          <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>
          {currentUser ? (
            <>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              {isAdmin() && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
