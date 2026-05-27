import { Link } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiStar } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="product-card">
      <div className="product-card-img-wrap">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
          />
        </Link>
        <button
          className={`wishlist-btn ${wishlisted ? "active" : ""}`}
          onClick={() => toggleWishlist(product)}
        >
          <FiHeart />
        </button>
        {product.stock === 0 && (
          <span className="out-of-stock-badge">Out of Stock</span>
        )}
        {/* Condition Badge */}
        {product.condition && product.condition !== "New" && (
          <span
            className={`condition-badge ${product.condition.toLowerCase()}`}
          >
            {product.condition === "Used" ? "🔄 Used" : "🔧 Refurbished"}
          </span>
        )}
        {product.isNew && <span className="new-badge">NEW</span>}
      </div>

      <div className="product-card-body">
        <span className="product-brand">{product.brand}</span>
        <Link to={`/products/${product.id}`} className="product-name">
          {product.name}
        </Link>

        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <FiStar
              key={i}
              className={
                i < Math.round(product.rating || 4) ? "star filled" : "star"
              }
            />
          ))}
          <span>({product.reviews || 0})</span>
        </div>

        <div className="product-card-footer">
          <div className="product-price">
            <span className="current-price">
              ₦{product.price?.toLocaleString()}
            </span>
            {product.oldPrice && (
              <span className="old-price">
                ₦{product.oldPrice?.toLocaleString()}
              </span>
            )}
          </div>
          <button
            className="add-to-cart-btn"
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
          >
            <FiShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
}
