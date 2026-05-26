import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import {
  FiPackage,
  FiUsers,
  FiShoppingCart,
  FiGrid,
  FiChevronDown,
  FiHome,
} from "react-icons/fi";
import toast from "react-hot-toast";
import "../../styles/Admin.css";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const STATUS_COLORS = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

function getPaymentLabel(method) {
  const methods = {
    transfer: "🏦 Bank Transfer",
    cash: "💵 Cash on Delivery",
    ussd: "📱 USSD / Mobile Money",
    whatsapp: "💬 Pay via WhatsApp",
    card: "💳 Debit / Credit Card",
  };
  return methods[method] || "Not specified";
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const snap = await getDocs(collection(db, "orders"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
        );
        setOrders(data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  async function updateStatus(orderId, status) {
    setUpdating(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      );
      toast.success(`Order marked as ${status}`);
    } catch (e) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  }

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/assets/logo.png" alt="Logo" className="admin-logo" />
          <div>
            <p className="admin-brand-name">JOE, BEST</p>
            <p className="admin-brand-gsm">G.S.M WORLD</p>
          </div>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className="admin-nav-item">
            <FiGrid /> Dashboard
          </Link>
          <Link to="/admin/products" className="admin-nav-item">
            <FiPackage /> Products
          </Link>
          <Link to="/admin/orders" className="admin-nav-item active">
            <FiShoppingCart /> Orders
          </Link>
          <Link to="/admin/users" className="admin-nav-item">
            <FiUsers /> Users
          </Link>
          <Link to="/" className="admin-nav-item store-link">
            <FiHome /> View Store
          </Link>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <h1>Orders Management</h1>
          <span className="orders-count">{filtered.length} orders</span>
        </div>

        {/* Status Filter Tabs */}
        <div className="status-filter-tabs">
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              className={`status-tab ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="tab-count">
                {s === "all"
                  ? orders.length
                  : orders.filter((o) => o.status === s).length}
              </span>
            </button>
          ))}
        </div>

        <div className="orders-admin-list">
          {loading ? (
            <div className="table-loading">Loading orders...</div>
          ) : filtered.length === 0 ? (
            <div className="table-empty">No {filter} orders found</div>
          ) : (
            filtered.map((order) => (
              <div key={order.id} className="admin-order-card">
                {/* Order Header */}
                <div
                  className="admin-order-header"
                  onClick={() =>
                    setExpanded(expanded === order.id ? null : order.id)
                  }
                >
                  <div className="order-id-info">
                    <strong>#{order.id.slice(-6).toUpperCase()}</strong>
                    <span>{order.userName || order.userEmail}</span>
                  </div>
                  <div className="order-meta-right">
                    <span className="admin-order-total">
                      ₦{order.total?.toLocaleString()}
                    </span>
                    <span
                      className="order-status-badge"
                      style={{
                        background: STATUS_COLORS[order.status] + "22",
                        color: STATUS_COLORS[order.status],
                      }}
                    >
                      {order.status}
                    </span>
                    <span className="order-date-small">
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleDateString()
                        : "N/A"}
                    </span>
                    <FiChevronDown
                      className={`expand-arrow ${expanded === order.id ? "rotated" : ""}`}
                    />
                  </div>
                </div>

                {/* Order Body */}
                {expanded === order.id && (
                  <div className="admin-order-body">
                    {/* Items */}
                    <div className="admin-order-items">
                      {order.items?.map((item, i) => (
                        <div className="admin-order-item" key={i}>
                          <img
                            src={item.imageUrl || "/assets/placeholder.png"}
                            alt={item.name}
                          />
                          <div>
                            <p>{item.name}</p>
                            <span>
                              {item.brand} • Qty: {item.quantity}
                            </span>
                          </div>
                          <span>
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Info */}
                    <div className="order-extra-info">
                      <div className="order-info-item">
                        <span>💳 Payment Method</span>
                        <strong>{getPaymentLabel(order.paymentMethod)}</strong>
                      </div>
                      <div className="order-info-item">
                        <span>📍 Delivery Address</span>
                        <strong>
                          {order.deliveryAddress || "Not provided"}
                        </strong>
                      </div>
                      <div className="order-info-item">
                        <span>📧 Customer Email</span>
                        <strong>{order.userEmail}</strong>
                      </div>
                      <div className="order-info-item">
                        <span>👤 Customer Name</span>
                        <strong>{order.userName || "N/A"}</strong>
                      </div>
                      {order.userLocation && (
                        <div className="order-info-item">
                          <span>🗺️ Pinned Location</span>
                          <a
                            href={`https://www.google.com/maps?q=${order.userLocation.lat},${order.userLocation.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="view-map-btn"
                          >
                            📍 Open in Google Maps
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Totals */}
                    <div className="admin-order-totals">
                      <span>Subtotal: ₦{order.subtotal?.toLocaleString()}</span>
                      <span>
                        Delivery:{" "}
                        {order.delivery === 0
                          ? "FREE"
                          : `₦${order.delivery?.toLocaleString()}`}
                      </span>
                      <strong>Total: ₦{order.total?.toLocaleString()}</strong>
                    </div>

                    {/* Status Update */}
                    <div className="status-update-row">
                      <label>Update Status:</label>
                      <div className="status-buttons">
                        {STATUSES.map((s) => (
                          <button
                            key={s}
                            className={`status-update-btn ${order.status === s ? "current" : ""}`}
                            style={{ "--status-color": STATUS_COLORS[s] }}
                            onClick={() => updateStatus(order.id, s)}
                            disabled={updating === order.id}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
