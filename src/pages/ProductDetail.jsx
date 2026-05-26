import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, getDoc, collection, getDocs, query, limit } from 'firebase/firestore'
import { db } from '../firebase'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import ProductCard from '../components/ProductCard'
import { FiHeart, FiShoppingCart, FiStar, FiArrowLeft, FiShare2, FiCheck } from 'react-icons/fi'
import '../styles/ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState(0)
  const [added, setAdded] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    async function fetchProduct() {
      try {
        const snap = await getDoc(doc(db, 'products', id))
        if (snap.exists()) {
          const p = { id: snap.id, ...snap.data() }
          setProduct(p)
          const relSnap = await getDocs(query(collection(db, 'products'), limit(4)))
          setRelated(relSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.id !== id))
        } else {
          navigate('/products')
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchProduct()
    window.scrollTo(0, 0)
  }, [id])

  function handleAddToCart() {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) return (
    <div className="product-detail-loading">
      <div className="detail-skeleton-img" />
      <div className="detail-skeleton-info">
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton-line" />)}
      </div>
    </div>
  )

  if (!product) return null

  const images = product.images?.length ? product.images : [product.imageUrl || '/placeholder.png']

  return (
    <div className="product-detail-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> / <span>{product.name}</span>
      </div>

      <div className="product-detail-layout">
        {/* Images */}
        <div className="product-images">
          <div className="main-image">
            <img src={images[selectedImg]} alt={product.name} />
            {product.stock === 0 && <div className="oos-overlay">Out of Stock</div>}
          </div>
          {images.length > 1 && (
            <div className="image-thumbs">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.name} ${i + 1}`}
                  className={selectedImg === i ? 'active' : ''}
                  onClick={() => setSelectedImg(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-info">
          <div className="product-info-top">
            <span className="product-category-tag">{product.category}</span>
            <button className="share-btn" onClick={handleShare}><FiShare2 /></button>
          </div>

          <h1 className="detail-product-name">{product.name}</h1>
          <p className="detail-product-brand">by {product.brand}</p>

          <div className="detail-rating">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} className={i < Math.round(product.rating || 4) ? 'star filled' : 'star'} />
            ))}
            <span>{product.rating || '4.0'} ({product.reviews || 0} reviews)</span>
          </div>

          <div className="detail-price-block">
            <span className="detail-price">₦{product.price?.toLocaleString()}</span>
            {product.oldPrice && (
              <>
                <span className="detail-old-price">₦{product.oldPrice?.toLocaleString()}</span>
                <span className="detail-discount">
                  {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <div className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
            {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
          </div>

          {product.specs && (
            <div className="quick-specs">
              {Object.entries(product.specs).slice(0, 4).map(([k, v]) => (
                <div className="spec-pill" key={k}><strong>{k}:</strong> {v}</div>
              ))}
            </div>
          )}

          <div className="detail-actions">
            <button
              className={`add-cart-btn ${added ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {added ? <><FiCheck /> Added!</> : <><FiShoppingCart /> Add to Cart</>}
            </button>
            <button
              className={`wishlist-toggle-btn ${isWishlisted(product.id) ? 'active' : ''}`}
              onClick={() => toggleWishlist(product)}
            >
              <FiHeart />
            </button>
          </div>

          <div className="delivery-info">
            <div className="delivery-item">🚚 <span>Delivery available across Enugu</span></div>
            <div className="delivery-item">🔄 <span>7-day easy returns</span></div>
            <div className="delivery-item">✅ <span>Genuine product guaranteed</span></div>
          </div>

          <div className="contact-seller">
            <a href="https://wa.me/2348064093705" target="_blank" rel="noreferrer" className="whatsapp-btn">
              💬 Ask on WhatsApp
            </a>
            <a href="tel:08064093705" className="call-btn">📞 Call Us</a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <div className="tab-headers">
          {['description', 'specifications', 'reviews'].map(tab => (
            <button
              key={tab}
              className={activeTab === tab ? 'active' : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="tab-content">
          {activeTab === 'description' && (
            <p>{product.description || 'No description available for this product.'}</p>
          )}
          {activeTab === 'specifications' && (
            <div className="specs-table">
              {product.specs ? Object.entries(product.specs).map(([k, v]) => (
                <div className="spec-row" key={k}>
                  <span className="spec-key">{k}</span>
                  <span className="spec-val">{v}</span>
                </div>
              )) : <p>No specifications available.</p>}
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="reviews-placeholder">
              <p>⭐ {product.reviews || 0} customer reviews. Review system coming soon!</p>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="related-section">
          <h2>Related Products</h2>
          <div className="products-grid">
            {related.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
