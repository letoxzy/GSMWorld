import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiGrid, FiShoppingCart, FiHeart, FiUser } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import '../styles/BottomNav.css'

export default function BottomNav() {
  const location = useLocation()
  const { cartCount } = useCart()
  const { currentUser } = useAuth()

  const links = [
    { to: '/', icon: <FiHome />, label: 'Home' },
    { to: '/products', icon: <FiGrid />, label: 'Shop' },
    { to: '/cart', icon: <FiShoppingCart />, label: 'Cart', badge: cartCount },
    { to: '/wishlist', icon: <FiHeart />, label: 'Saved' },
    { to: currentUser ? '/profile' : '/login', icon: <FiUser />, label: currentUser ? 'Me' : 'Login' },
  ]

  return (
    <nav className="bottom-nav">
      {links.map(({ to, icon, label, badge }) => (
        <Link
          key={to}
          to={to}
          className={`bottom-nav-item ${location.pathname === to ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">
            {icon}
            {badge > 0 && <span className="bottom-badge">{badge}</span>}
          </span>
          <span className="bottom-nav-label">{label}</span>
        </Link>
      ))}
    </nav>
  )
}
