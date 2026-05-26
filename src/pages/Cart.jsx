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
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import "../styles/Cart.css";

const PAYMENT_METHODS = [
  {
    id: "transfer",
    label: "Bank Transfer",
    icon: <FiBriefcase />,
    desc: "Transfer to our bank account",
    detail: "GTBank • 0123456789 • JOE BEST COMM SYS",
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

  const [paymentMethod, setPaymentMethod] = useState("");
  const [step, setStep] = useState(1); // 1 = cart, 2 = payment, 3 = confirm
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState("");

  const delivery = cartTotal > 50000 ? 0 : 1500;
  const total = cartTotal + delivery;

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
      toast.error("Please enter your delivery address");
      return;
    }

    setPlacing(true);
    try {
      await addDoc(collection(db, "orders"), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName,
        items: cartItems,
        subtotal: cartTotal,
        delivery,
        total,
        paymentMethod,
        deliveryAddress: address,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      await clearCart();
      toast.success("Order placed successfully! 🎉");
      navigate("/orders");
    } catch (e) {
      toast.error("Failed to place order. Please try again.");
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
        {["Cart", "Payment", "Confirm"].map((s, i) => (
          <div
            key={s}
            className={`checkout-step ${step > i ? "done" : ""} ${step === i + 1 ? "active" : ""}`}
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

        {/* STEP 2 - Payment Method */}
        {step === 2 && (
          <div className="payment-section">
            <h2>Select Payment Method</h2>
            <div className="payment-methods">
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.id}
                  className={`payment-card ${paymentMethod === method.id ? "selected" : ""} ${method.disabled ? "disabled" : ""}`}
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
                      className={`payment-radio ${paymentMethod === method.id ? "checked" : ""}`}
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

            <div className="delivery-address-section">
              <h3>Delivery Address</h3>
              <textarea
                placeholder="Enter your full delivery address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* STEP 3 - Confirm Order */}
        {step === 3 && (
          <div className="confirm-section">
            <h2>Confirm Your Order</h2>

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

            <div className="confirm-block">
              <h4>📍 Delivery Address</h4>
              <p className="confirm-address">{address}</p>
            </div>
          </div>
        )}

        {/* Order Summary - always visible */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal ({cartItems.length} items)</span>
            <span>₦{cartTotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span>
              {delivery === 0 ? "FREE" : `₦${delivery.toLocaleString()}`}
            </span>
          </div>
          {delivery === 0 && (
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
          <div className="summary-row total">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>

          {/* Step Navigation */}
          {step === 1 && (
            <button className="checkout-btn" onClick={() => setStep(2)}>
              Continue to Payment <FiArrowRight />
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
                    toast.error("Enter delivery address");
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
