import { Link } from "react-router-dom";
import "../styles/Footer.css";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiFacebook,
  FiInstagram,
  FiTwitter,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <img src="/logo.png" alt="Logo" className="footer-logo" />
          <div className="footer-brand-text">
            <span className="footer-name">JOE, BEST</span>
            <span className="footer-sub">Communication System</span>
            <span className="footer-gsm">G.S.M WORLD</span>
          </div>
          <p className="footer-desc">
            Your #1 trusted mobile phone shop in Enugu. Quality phones and
            accessories at the best prices.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook">
              <FiFacebook />
            </a>
            <a href="#" aria-label="Instagram">
              <FiInstagram />
            </a>
            <a href="#" aria-label="Twitter">
              <FiTwitter />
            </a>
            <a href="https://wa.me/2348064093705" aria-label="WhatsApp">
              <FaWhatsapp />
            </a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/orders">My Orders</Link>
        </div>

        <div className="footer-links">
          <h4>Categories</h4>
          <Link to="/products?category=smartphones">Smartphones</Link>
          <Link to="/products?category=accessories">Accessories</Link>
          <Link to="/products?category=tablets">Tablets</Link>
          <Link to="/products?category=earphones">Earphones</Link>
          <Link to="/products?category=chargers">Chargers</Link>
        </div>

        <div className="footer-contact">
          <h4>Contact Us</h4>
          <div className="contact-item">
            <FiMapPin />
            <span>B139 Railway Line Ogbete Main Market, Enugu.</span>
          </div>
          <div className="contact-item">
            <FiPhone />
            <a href="tel:08064093705">08064093705</a>
          </div>
          <div className="contact-item">
            <FaWhatsapp />
            <a href="https://wa.me/2348064093705">08064093705</a>
          </div>
          <div className="contact-item">
            <FiMail />
            <a href="mailto:joebest@.com">joebest@gmail.com</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} JOE, BEST Communication System G.S.M
          WORLD. All rights reserved.
        </p>
        <p>B139 Railway Line Ogbete Main Market, Enugu</p>
      </div>
    </footer>
  );
}
