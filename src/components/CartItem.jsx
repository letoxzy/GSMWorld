import { Link } from 'react-router-dom'
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi'
import { useCart } from '../context/CartContext'

export default function CartItem({ item }) {
  const { removeFromCart, updateQuantity } = useCart()

  return (
    <div className="cart-item">
      <Link to={`/products/${item.id}`} className="cart-item-img">
        <img src={item.imageUrl || '/placeholder.png'} alt={item.name} />
      </Link>

      <div className="cart-item-info">
        <Link to={`/products/${item.id}`} className="cart-item-name">{item.name}</Link>
        <span className="cart-item-brand">{item.brand}</span>
        <span className="cart-item-price">₦{item.price?.toLocaleString()}</span>
      </div>

      <div className="cart-item-controls">
        <div className="qty-control">
          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><FiMinus /></button>
          <span>{item.quantity}</span>
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><FiPlus /></button>
        </div>
        <span className="cart-item-subtotal">₦{(item.price * item.quantity).toLocaleString()}</span>
        <button className="remove-btn" onClick={() => removeFromCart(item.id)}><FiTrash2 /></button>
      </div>
    </div>
  )
}
