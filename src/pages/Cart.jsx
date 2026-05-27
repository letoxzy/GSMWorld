import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CartItem from "../components/CartItem";
import {
  FiShoppingCart,
  FiArrowRight,
  FiTrash2,
  FiCreditCard,
  FiSmartphone,
  FiBriefcase,
} from "react-icons/fi";
import { FaMoneyBillWave, FaWhatsapp } from "react-icons/fa";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import MapPicker from "../components/MapPicker";
import toast from "react-hot-toast";
import "../styles/Cart.css";

const DELIVERY_METHODS = [
  {
    id: "door",
    label: "Door Delivery",
    icon: "🚚",
    desc: "Delivered to your address",
    duration: "1 - 2 business days",
    price: 1500,
    detail: "Our rider will deliver to your doorstep within Enugu",
  },
  {
    id: "pickup",
    label: "Pick Up from Store",
    icon: "🏪",
    desc: "Pick up at our Ogbete Market store",
    duration: "Ready within 24 hours",
    price: 0,
    detail: "B139 Railway Line Ogbete Main Market, Enugu • Mon-Sat 8am-6pm",
  },
];

const PAYMENT_METHODS = [
  {
    id: "transfer",
    label: "Bank Transfer",
    icon: <FiBriefcase />,
    desc: "Transfer to our bank account",
    detail: "MONIEPOINT • 8035604475 • NWONU VICTOR CHISOM",
  },
  {
    id: "cash",
    label: "Cash on Delivery",
    icon: <FaMoneyBillWave />,
    desc: "Pay when your order arrives",
    detail: "Available within Enugu only",
  },
  {
    id: "ussd",
    label: "USSD / Mobile Money",
    icon: <FiSmartphone />,
    desc: "Pay via USSD code",
    detail: "*737# GTBank • *770# UBA • *919# Access",
  },
  {
    id: "whatsapp",
    label: "Pay via WhatsApp",
    icon: <FaWhatsapp />,
    desc: "Send payment proof on WhatsApp",
    detail: "08064093705 / 08123817997",
  },
  {
    id: "card",
    label: "Debit / Credit Card",
    icon: <FiCreditCard />,
    desc: "Pay with your card (coming soon)",
    detail: "Visa, Mastercard, Verve",
    disabled: true,
  },
];

export default function Cart() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [deliveryMethod, setDeliveryMethod] = useState("door");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState("");
  const [mapPosition, setMapPosition] = useState(null);

  const deliveryFee =
    deliveryMethod === "pickup" ? 0 : cartTotal > 50000 ? 0 : 1500;
  const total = cartTotal + deliveryFee;

  async function handleCheckout() {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    if (!address.trim()) {
      toast.error(
        deliveryMethod === "door"
          ? "Please enter your delivery address"
          : "Please enter your phone number",
      );
      return;
    }

    setPlacing(true);
    try {
      const userSnap = await getDoc(doc(db, "users", currentUser.uid));
      const userProfile = userSnap.data();

      await addDoc(collection(db, "orders"), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName,
        items: cartItems,
        subtotal: cartTotal,
        delivery: deliveryFee,
        total,
        paymentMethod,
        deliveryMethod,
        deliveryAddress: address,
        userLocation: mapPosition
          ? { lat: mapPosition[0], lng: mapPosition[1] }
          : userProfile?.location || null,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      await clearCart();
      toast.success("Order placed successfully! 🎉");
      navigate("/orders");
    } catch (e) {
      toast.error("Failed to place order. Please try again.");
      console.error(e);
    } finally {
      setPlacing(false);
    }
  }

  if (cartItems.length === 0)
    return (
      <div className="empty-page">
        <div className="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some amazing products to your cart!</p>
        <Link to="/products" className="btn-primary">
          Shop Now <FiArrowRight />
        </Link>
      </div>
    );

  return (
    <div className="cart-page">
      <div className="page-header">
        <h1>
          <FiShoppingCart /> Shopping Cart
        </h1>
        {step === 1 && (
          <button className="clear-cart-btn" onClick={clearCart}>
            <FiTrash2 /> Clear Cart
          </button>
        )}
      </div>

      {/* Step Indicator */}
      <div className="checkout-steps">
        {["Cart", "Delivery & Payment", "Confirm"].map((s, i) => (
          <div
            key={s}
            className={`checkout-step ${step > i ? "done" : ""} ${
              step === i + 1 ? "active" : ""
            }`}
          >
            <div className="step-circle">{step > i + 1 ? "✓" : i + 1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <div className="cart-layout">
        {/* STEP 1 - Cart Items */}
        {step === 1 && (
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* STEP 2 - Delivery & Payment */}
        {step === 2 && (
          <div className="payment-section">
            {/* DELIVERY METHOD */}
            <h2>Choose Delivery Method</h2>
            <div className="delivery-methods">
              {DELIVERY_METHODS.map((method) => (
                <div
                  key={method.id}
                  className={`delivery-card ${
                    deliveryMethod === method.id ? "selected" : ""
                  }`}
                  onClick={() => setDeliveryMethod(method.id)}
                >
                  <div className="delivery-card-top">
                    <span className="delivery-icon">{method.icon}</span>
                    <div className="delivery-info">
                      <strong>{method.label}</strong>
                      <span>{method.desc}</span>
                      <span className="delivery-duration">
                        🕐 {method.duration}
                      </span>
                    </div>
                    <div className="delivery-price-col">
                      <span className="delivery-price">
                        {method.price === 0
                          ? "FREE"
                          : `₦${method.price.toLocaleString()}`}
                      </span>
                    </div>
                    <div
                      className={`payment-radio ${
                        deliveryMethod === method.id ? "checked" : ""
                      }`}
                    />
                  </div>
                  {deliveryMethod === method.id && (
                    <div className="delivery-detail">📍 {method.detail}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Delivery notice */}
            <div className="delivery-notice">
              <span>⏰</span>
              <div>
                <strong>Delivery Information</strong>
                <p>
                  Orders placed before 12pm are processed same day. Orders after
                  12pm are processed next business day.
                </p>
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <h2 style={{ marginTop: "1.5rem" }}>Select Payment Method</h2>
            <div className="payment-methods">
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.id}
                  className={`payment-card ${
                    paymentMethod === method.id ? "selected" : ""
                  } ${method.disabled ? "disabled" : ""}`}
                  onClick={() =>
                    !method.disabled && setPaymentMethod(method.id)
                  }
                >
                  <div className="payment-card-top">
                    <span className="payment-icon">{method.icon}</span>
                    <div className="payment-info">
                      <strong>{method.label}</strong>
                      <span>{method.desc}</span>
                    </div>
                    <div
                      className={`payment-radio ${
                        paymentMethod === method.id ? "checked" : ""
                      }`}
                    />
                  </div>
                  {paymentMethod === method.id && (
                    <div className="payment-detail">ℹ️ {method.detail}</div>
                  )}
                  {method.disabled && (
                    <span className="coming-soon-tag">Coming Soon</span>
                  )}
                </div>
              ))}
            </div>

            {/* ADDRESS / CONTACT */}
            <div className="delivery-address-section">
              <h3>
                {deliveryMethod === "door"
                  ? "Delivery Address"
                  : "Contact Number for Pickup"}
              </h3>
              <textarea
                placeholder={
                  deliveryMethod === "door"
                    ? "Enter your full delivery address..."
                    : "Enter your phone number for pickup notification..."
                }
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
              />

              {/* Map only for door delivery */}
              {deliveryMethod === "door" && (
                <div className="cart-map-section">
                  <p className="cart-map-label">
                    📍 Pin your exact delivery location on the map
                    <span className="cart-map-optional">
                      (optional but recommended)
                    </span>
                  </p>
                  <MapPicker
                    position={mapPosition}
                    setPosition={setMapPosition}
                    height="280px"
                    fullscreenable={true}
                  />
                  {mapPosition && (
                    <p className="cart-map-pinned">
                      ✅ Location pinned — we'll use this for accurate delivery
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 - Confirm Order */}
        {step === 3 && (
          <div className="confirm-section">
            <h2>Confirm Your Order</h2>

            {/* Items */}
            <div className="confirm-block">
              <h4>📦 Items ({cartItems.length})</h4>
              {cartItems.map((item) => (
                <div className="confirm-item" key={item.id}>
                  <img
                    src={item.imageUrl || "/placeholder.png"}
                    alt={item.name}
                  />
                  <div>
                    <p>{item.name}</p>
                    <span>
                      Qty: {item.quantity} × ₦{item.price?.toLocaleString()}
                    </span>
                  </div>
                  <strong>
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </strong>
                </div>
              ))}
            </div>

            {/* Delivery Method */}
            <div className="confirm-block">
              <h4>🚚 Delivery Method</h4>
              <div className="confirm-payment">
                <span style={{ fontSize: "1.5rem" }}>
                  {DELIVERY_METHODS.find((m) => m.id === deliveryMethod)?.icon}
                </span>
                <span>
                  {DELIVERY_METHODS.find((m) => m.id === deliveryMethod)?.label}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "0.78rem",
                    color: "var(--primary)",
                    fontWeight: 600,
                  }}
                >
                  {
                    DELIVERY_METHODS.find((m) => m.id === deliveryMethod)
                      ?.duration
                  }
                </span>
              </div>
              <p className="confirm-payment-detail">
                {DELIVERY_METHODS.find((m) => m.id === deliveryMethod)?.detail}
              </p>
            </div>

            {/* Payment Method */}
            <div className="confirm-block">
              <h4>💳 Payment Method</h4>
              <div className="confirm-payment">
                {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.icon}
                <span>
                  {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
                </span>
              </div>
              <p className="confirm-payment-detail">
                {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.detail}
              </p>
            </div>

            {/* Address */}
            <div className="confirm-block">
              <h4>
                {deliveryMethod === "door"
                  ? "📍 Delivery Address"
                  : "📞 Pickup Contact"}
              </h4>
              <p className="confirm-address">{address}</p>
              {mapPosition && (
                <a
                  href={`https://www.google.com/maps?q=${mapPosition[0]},${mapPosition[1]}`}
                  target="_blank"
                  rel="noreferrer"
                  className="view-map-btn"
                  style={{ marginTop: "0.5rem", display: "inline-flex" }}
                >
                  📍 View Pinned Location
                </a>
              )}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal ({cartItems.length} items)</span>
            <span>₦{cartTotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span>
              {deliveryFee === 0 ? (
                <span style={{ color: "var(--success)" }}>FREE</span>
              ) : (
                `₦${deliveryFee.toLocaleString()}`
              )}
            </span>
          </div>
          {deliveryMethod === "pickup" && (
            <p className="free-delivery-note">
              🏪 Pick up at Ogbete Market — No delivery fee!
            </p>
          )}
          {deliveryMethod === "door" &&
            deliveryFee === 0 &&
            cartTotal > 50000 && (
              <p className="free-delivery-note">
                🎉 Free delivery on orders above ₦50,000!
              </p>
            )}
          {paymentMethod && (
            <div className="summary-row">
              <span>Payment</span>
              <span>
                {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
              </span>
            </div>
          )}
          {mapPosition && (
            <div className="summary-row">
              <span>📍 Location</span>
              <span style={{ color: "var(--success)", fontSize: "0.82rem" }}>
                Pinned ✅
              </span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>

          {/* Navigation */}
          {step === 1 && (
            <button className="checkout-btn" onClick={() => setStep(2)}>
              Continue <FiArrowRight />
            </button>
          )}
          {step === 2 && (
            <div className="step-btns">
              <button className="back-step-btn" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                className="checkout-btn"
                onClick={() => {
                  if (!paymentMethod) {
                    toast.error("Select a payment method");
                    return;
                  }
                  if (!address.trim()) {
                    toast.error(
                      deliveryMethod === "door"
                        ? "Enter delivery address"
                        : "Enter your phone number",
                    );
                    return;
                  }
                  setStep(3);
                }}
              >
                Review Order <FiArrowRight />
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="step-btns">
              <button className="back-step-btn" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={placing}
              >
                {placing ? "Placing Order..." : "Place Order 🎉"}
              </button>
            </div>
          )}

          <Link to="/products" className="continue-shopping">
            ← Continue Shopping
          </Link>
          <div className="secure-badge">
            🔒 Secure checkout • Genuine products
          </div>
        </div>
      </div>
    </div>
  );
}
