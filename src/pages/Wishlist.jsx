import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  function moveToCart(item) {
    addToCart(item)
    removeFromWishlist(item.id)
  }

  if (wishlistItems.length === 0) return (
    <div className="empty-page">
      <div className="empty-icon">💔</div>
      <h2>Your wishlist is empty</h2>
      <p>Save items you love to your wishlist!</p>
      <Link to="/products" className="btn-primary">Browse Products <FiArrowRight /></Link>
    </div>
  )

  return (
    <div className="wishlist-page">
      <div className="page-header">
        <h1><FiHeart /> My Wishlist ({wishlistItems.length})</h1>
      </div>

      <div className="wishlist-grid">
        {wishlistItems.map(item => (
          <div key={item.id} className="wishlist-card">
            <Link to={`/products/${item.id}`} className="wishlist-img">
              <img src={item.imageUrl || '/placeholder.png'} alt={item.name} />
            </Link>
            <div className="wishlist-info">
              <span className="wishlist-brand">{item.brand}</span>
              <Link to={`/products/${item.id}`} className="wishlist-name">{item.name}</Link>
              <span className="wishlist-price">₦{item.price?.toLocaleString()}</span>
            </div>
            <div className="wishlist-actions">
              <button className="move-to-cart-btn" onClick={() => moveToCart(item)}>
                <FiShoppingCart /> Add to Cart
              </button>
              <button className="remove-wish-btn" onClick={() => removeFromWishlist(item.id)}>
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
