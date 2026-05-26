import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { FiPackage, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
}

export default function Orders() {
  const { currentUser } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    async function fetchOrders() {
      if (!currentUser) return
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid)
        )
        const snap = await getDocs(q)
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setOrders(data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchOrders()
  }, [currentUser])

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>

  if (orders.length === 0) return (
    <div className="empty-page">
      <div className="empty-icon">📦</div>
      <h2>No orders yet</h2>
      <p>Start shopping to see your orders here!</p>
      <Link to="/products" className="btn-primary">Shop Now <FiArrowRight /></Link>
    </div>
  )

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1><FiPackage /> My Orders ({orders.length})</h1>
      </div>

      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
              <div className="order-meta">
                <span className="order-id">Order #{order.id.slice(-6).toUpperCase()}</span>
                <span className="order-date">
                  {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
              <div className="order-summary">
                <span className="order-total">₦{order.total?.toLocaleString()}</span>
                <span className="order-status" style={{ color: STATUS_COLORS[order.status] || '#888' }}>
                  ● {order.status?.toUpperCase()}
                </span>
                <span className="expand-icon">{expanded === order.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expanded === order.id && (
              <div className="order-details">
                <div className="order-items">
                  {order.items?.map((item, i) => (
                    <div className="order-item-row" key={i}>
                      <img src={item.imageUrl || '/placeholder.png'} alt={item.name} />
                      <div>
                        <p className="order-item-name">{item.name}</p>
                        <p className="order-item-brand">{item.brand}</p>
                        <p className="order-item-qty">Qty: {item.quantity} × ₦{item.price?.toLocaleString()}</p>
                      </div>
                      <span className="order-item-sub">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="order-totals">
                  <div><span>Subtotal:</span><span>₦{order.subtotal?.toLocaleString()}</span></div>
                  <div><span>Delivery:</span><span>{order.delivery === 0 ? 'FREE' : `₦${order.delivery?.toLocaleString()}`}</span></div>
                  <div className="order-grand-total"><span>Total:</span><span>₦{order.total?.toLocaleString()}</span></div>
                </div>
                <div className="order-track">
                  <div className={`track-step ${['pending','confirmed','shipped','delivered'].includes(order.status) ? 'done' : ''}`}>Order Placed</div>
                  <div className={`track-step ${['confirmed','shipped','delivered'].includes(order.status) ? 'done' : ''}`}>Confirmed</div>
                  <div className={`track-step ${['shipped','delivered'].includes(order.status) ? 'done' : ''}`}>Shipped</div>
                  <div className={`track-step ${order.status === 'delivered' ? 'done' : ''}`}>Delivered</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
