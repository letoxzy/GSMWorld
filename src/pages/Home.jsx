import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import ProductCard from "../components/ProductCard";
import {
  FiArrowRight,
  FiShield,
  FiTruck,
  FiHeadphones,
  FiRefreshCw,
} from "react-icons/fi";
import "../styles/Home.css";

const CATEGORIES = [
  { name: "Smartphones", icon: "📱", key: "smartphones" },
  { name: "Accessories", icon: "🎧", key: "accessories" },
  { name: "Tablets", icon: "📟", key: "tablets" },
  { name: "Chargers", icon: "🔌", key: "chargers" },
  { name: "Earphones", icon: "🎵", key: "earphones" },
  { name: "Cases", icon: "🛡️", key: "cases" },
];

const FEATURES = [
  {
    icon: <FiShield />,
    title: "Genuine Products",
    desc: "100% authentic devices",
  },
  { icon: <FiTruck />, title: "Fast Delivery", desc: "Enugu-wide delivery" },
  {
    icon: <FiHeadphones />,
    title: "24/7 Support",
    desc: "Always here to help",
  },
  { icon: <FiRefreshCw />, title: "Easy Returns", desc: "7-day return policy" },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, "products"), limit(8));
        const snap = await getDocs(q);
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFeatured(all.slice(0, 4));
        setNewArrivals(all.slice(4, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🔥 Enugu's #1 Phone Shop</div>
          <h1 className="hero-title">
            <span className="hero-title-top">JOE, BEST</span>
            <span className="hero-title-mid">Communication System</span>
            <span className="hero-title-gsm">G.S.M WORLD</span>
          </h1>
          <p className="hero-desc">
            Premium phones & accessories at Ogbete Main Market, Enugu. Best
            prices, genuine products, expert service.
          </p>
          <div className="hero-btns">
            <Link to="/products" className="btn-primary">
              Shop Now <FiArrowRight />
            </Link>
            <a
              href="https://wa.me/2348035604475"
              className="btn-outline"
              target="_blank"
              rel="noreferrer"
            >
              Chat on WhatsApp
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <strong>70+</strong>
              <span>Products</span>
            </div>
            <div>
              <strong>20+</strong>
              <span>Customers</span>
            </div>
            <div>
              <strong>5★</strong>
              <span>Rated</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-glow" />
          <img
            src="/hero-phone.png"
            alt="Featured Phone"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>
      </section>

      {/* Features */}
      <section className="features-strip">
        {FEATURES.map((f, i) => (
          <div className="feature-item" key={i}>
            <span className="feature-icon">{f.icon}</span>
            <div>
              <strong>{f.title}</strong>
              <span>{f.desc}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="section categories-section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <Link to="/products" className="see-all">
            See all <FiArrowRight />
          </Link>
        </div>
        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <Link
              to={`/products?category=${cat.key}`}
              className="category-card"
              key={cat.key}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="section-header">
          <h2>Featured Products</h2>
          <Link to="/products" className="see-all">
            See all <FiArrowRight />
          </Link>
        </div>
        {loading ? (
          <div className="products-grid">
            {[...Array(4)].map((_, i) => (
              <div className="product-skeleton" key={i} />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="products-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>
              No products yet.{" "}
              <Link to="/admin/products">Add some products</Link>
            </p>
          </div>
        )}
      </section>

      {/* Promo Banner */}
      <section className="promo-banner">
        <div className="promo-content">
          <span className="promo-tag">LIMITED OFFER</span>
          <h3>Get the Best Deals in Enugu!</h3>
          <p>
            Visit us at B139 Railway Line Ogbete Main Market or call{" "}
            <strong>8035604475</strong>
          </p>
          <Link to="/products" className="btn-primary">
            Browse Deals <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section">
        <div className="section-header">
          <h2>New Arrivals</h2>
          <Link to="/products?sort=newest" className="see-all">
            See all <FiArrowRight />
          </Link>
        </div>
        {loading ? (
          <div className="products-grid">
            {[...Array(4)].map((_, i) => (
              <div className="product-skeleton" key={i} />
            ))}
          </div>
        ) : newArrivals.length > 0 ? (
          <div className="products-grid">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Check back soon for new arrivals!</p>
          </div>
        )}
      </section>

      {/* Location Section */}
      <section className="section location-section">
        <h2>Find Us</h2>
        <p className="location-address">
          📍 B139 Railway Line Ogbete Main Market, Enugu
        </p>
        <div className="location-map-embed">
          <iframe
            title="Store Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.3!2d7.5003!3d6.4698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sOgbete+Main+Market%2C+Enugu!5e0!3m2!1sen!2sng!4v1234567890"
            width="100%"
            height="350"
            style={{ border: 0, borderRadius: "12px" }}
            allowFullScreen=""
            loading="lazy"
          />
        </div>
        <div className="contact-cta">
          <a href="tel:8035604475" className="btn-primary">
            📞 Call Us
          </a>
          <a
            href="https://wa.me/8035604475"
            className="btn-outline"
            target="_blank"
            rel="noreferrer"
          >
            💬 WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
