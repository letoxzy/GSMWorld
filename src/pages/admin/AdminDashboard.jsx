import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import {
  FiPackage,
  FiUsers,
  FiShoppingCart,
  FiDollarSign,
  FiLogOut,
  FiGrid,
  FiList,
  FiSettings,
  FiTrendingUp,
  FiHome,
  FiMenu,
  FiX,
  FiBell,
} from "react-icons/fi";
import "../../styles/Admin.css";

export default function AdminDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [newOrders, setNewOrders] = useState([]);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch general stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const [products, orders, users] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(collection(db, "orders")),
          getDocs(collection(db, "users")),
        ]);
        const allOrders = orders.docs.map((d) => ({ id: d.id, ...d.data() }));
        const revenue = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        allOrders.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
        );
        setStats({
          products: products.size,
          orders: orders.size,
          users: users.size,
          revenue,
        });
        setRecentOrders(allOrders.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Real-time pending orders listener
  useEffect(() => {
    const pendingQuery = query(
      collection(db, "orders"),
      where("status", "==", "pending"),
    );
    const unsub = onSnapshot(pendingQuery, (snap) => {
      const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      orders.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      );
      setPendingCount(orders.length);
      setNewOrders(orders.slice(0, 5));
    });
    return () => unsub();
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const STATUS_COLORS = {
    pending: "#f59e0b",
    confirmed: "#3b82f6",
    shipped: "#8b5cf6",
    delivered: "#10b981",
    cancelled: "#ef4444",
  };

  return (
    <div className="admin-layout">
      {/* Mobile Top Bar */}
      <div className="admin-mobile-topbar">
        <div className="admin-mobile-brand">
          <img src="/logo.png" alt="Logo" />
          <span>G.S.M WORLD</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Mobile notification bell */}
          <button
            className="admin-notif-btn"
            onClick={() => setShowNotif(!showNotif)}
            style={{ position: "relative" }}
          >
            <FiBell />
            {pendingCount > 0 && (
              <span className="admin-notif-badge">{pendingCount}</span>
            )}
          </button>
          <button
            className="admin-hamburger"
            onClick={() => setDrawerOpen(true)}
          >
            <FiMenu />
          </button>
        </div>
      </div>

      {/* Drawer Overlay */}
      <div
        className={`admin-drawer-overlay ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${drawerOpen ? "drawer-open" : ""}`}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "0.5rem 1rem",
          }}
        >
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              color: "var(--text-muted)",
              fontSize: "1.2rem",
              display: "flex",
            }}
          >
            <FiX />
          </button>
        </div>

        <div className="admin-brand">
          <img src="/logo.png" alt="Logo" className="admin-logo" />
          <div>
            <p className="admin-brand-name">JOE, BEST</p>
            <p className="admin-brand-gsm">G.S.M WORLD</p>
          </div>
        </div>

        <nav className="admin-nav">
          <Link
            to="/admin"
            className="admin-nav-item active"
            onClick={() => setDrawerOpen(false)}
          >
            <FiGrid /> Dashboard
          </Link>
          <Link
            to="/admin/products"
            className="admin-nav-item"
            onClick={() => setDrawerOpen(false)}
          >
            <FiPackage /> Products
          </Link>
          <Link
            to="/admin/orders"
            className="admin-nav-item"
            onClick={() => setDrawerOpen(false)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flex: 1,
              }}
            >
              <FiShoppingCart /> Orders
              {pendingCount > 0 && (
                <span className="sidebar-order-badge">{pendingCount}</span>
              )}
            </div>
          </Link>
          <Link
            to="/admin/users"
            className="admin-nav-item"
            onClick={() => setDrawerOpen(false)}
          >
            <FiUsers /> Users
          </Link>
          <Link
            to="/"
            className="admin-nav-item store-link"
            onClick={() => setDrawerOpen(false)}
          >
            <FiHome /> View Store
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">
              {currentUser?.displayName?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <p>{currentUser?.displayName || "Admin"}</p>
              <span>Administrator</span>
            </div>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <h1>Dashboard Overview</h1>
          <div className="admin-topbar-right">
            <span className="admin-date">
              {new Date().toLocaleDateString("en-NG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>

            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button
                className="admin-notif-btn"
                onClick={() => setShowNotif(!showNotif)}
              >
                <FiBell />
                {pendingCount > 0 && (
                  <span className="admin-notif-badge">{pendingCount}</span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotif && (
                <>
                  <div
                    className="notif-overlay"
                    onClick={() => setShowNotif(false)}
                  />
                  <div className="admin-notif-dropdown">
                    <div className="notif-header">
                      <strong>🛒 Pending Orders</strong>
                      <span>{pendingCount} pending</span>
                    </div>
                    {newOrders.length === 0 ? (
                      <p className="notif-empty">No pending orders 🎉</p>
                    ) : (
                      newOrders.map((order) => (
                        <Link
                          to="/admin/orders"
                          key={order.id}
                          className="notif-item"
                          onClick={() => setShowNotif(false)}
                        >
                          <div className="notif-item-info">
                            <span className="notif-order-id">
                              #{order.id.slice(-6).toUpperCase()}
                            </span>
                            <span className="notif-customer">
                              {order.userName || order.userEmail}
                            </span>
                          </div>
                          <div className="notif-item-right">
                            <span className="notif-amount">
                              ₦{order.total?.toLocaleString()}
                            </span>
                            <span className="notif-time">
                              {order.createdAt?.toDate
                                ? order.createdAt.toDate().toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </Link>
                      ))
                    )}
                    <Link
                      to="/admin/orders"
                      className="notif-view-all"
                      onClick={() => setShowNotif(false)}
                    >
                      View All Orders →
                    </Link>
                  </div>
                </>
              )}
            </div>

            <Link to="/" className="view-store-btn">
              View Store
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats-grid">
          {[
            {
              label: "Total Products",
              value: stats.products,
              icon: <FiPackage />,
              color: "#e85d04",
              change: "+12%",
              badge: null,
            },
            {
              label: "Total Orders",
              value: stats.orders,
              icon: <FiShoppingCart />,
              color: "#3b82f6",
              change: "+8%",
              badge: pendingCount,
            },
            {
              label: "Total Users",
              value: stats.users,
              icon: <FiUsers />,
              color: "#8b5cf6",
              change: "+23%",
              badge: null,
            },
            {
              label: "Total Revenue",
              value: `₦${stats.revenue.toLocaleString()}`,
              icon: <FiDollarSign />,
              color: "#10b981",
              change: "+15%",
              badge: null,
            },
          ].map((card, i) => (
            <div
              className="admin-stat-card"
              key={i}
              style={{ "--card-color": card.color }}
            >
              <div className="stat-icon-wrap">
                <div className="stat-icon">{card.icon}</div>
                {card.badge > 0 && (
                  <span className="stat-badge">{card.badge} pending</span>
                )}
              </div>
              <div className="stat-info">
                <p className="stat-label">{card.label}</p>
                <h3 className="stat-value">{loading ? "..." : card.value}</h3>
                <span className="stat-change">
                  <FiTrendingUp /> {card.change} this month
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="admin-quick-actions">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <Link to="/admin/products" className="quick-action-card">
              <FiPackage /> <span>Add Product</span>
            </Link>
            <Link to="/admin/orders" className="quick-action-card">
              <FiList /> <span>Manage Orders</span>
              {pendingCount > 0 && (
                <span className="quick-action-badge">{pendingCount}</span>
              )}
            </Link>
            <Link to="/admin/users" className="quick-action-card">
              <FiUsers /> <span>View Users</span>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders" className="see-all-link">
              View All
            </Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="table-loading">
                      Loading...
                    </td>
                  </tr>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id.slice(-6).toUpperCase()}</td>
                      <td>{order.userName || order.userEmail}</td>
                      <td>{order.items?.length} item(s)</td>
                      <td>₦{order.total?.toLocaleString()}</td>
                      <td>
                        <span
                          className="order-status-badge"
                          style={{
                            background: STATUS_COLORS[order.status] + "22",
                            color: STATUS_COLORS[order.status],
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {order.createdAt?.toDate
                          ? order.createdAt.toDate().toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="table-empty">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="admin-bottom-nav">
        <div className="admin-bottom-nav-items">
          <Link
            to="/admin"
            className={`admin-bottom-nav-item ${location.pathname === "/admin" ? "active" : ""}`}
          >
            <FiGrid />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/products"
            className={`admin-bottom-nav-item ${location.pathname === "/admin/products" ? "active" : ""}`}
          >
            <FiPackage />
            <span>Products</span>
          </Link>
          <Link
            to="/admin/orders"
            className={`admin-bottom-nav-item ${location.pathname === "/admin/orders" ? "active" : ""}`}
            style={{ position: "relative" }}
          >
            <FiShoppingCart />
            {pendingCount > 0 && (
              <span className="bottom-nav-order-badge">{pendingCount}</span>
            )}
            <span>Orders</span>
          </Link>
          <Link
            to="/admin/users"
            className={`admin-bottom-nav-item ${location.pathname === "/admin/users" ? "active" : ""}`}
          >
            <FiUsers />
            <span>Users</span>
          </Link>
          <Link to="/" className="admin-bottom-nav-item">
            <FiHome />
            <span>Store</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
