import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import {
  FiPackage,
  FiUsers,
  FiShoppingCart,
  FiGrid,
  FiShield,
  FiUser,
  FiHome,
  FiMenu,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import "../../styles/Admin.css";

export default function AdminUsers() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const snap = await getDocs(collection(db, "users"));
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  async function toggleRole(user) {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      await updateDoc(doc(db, "users", user.id), { role: newRole });
      setUsers(
        users.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)),
      );
      toast.success(`${user.displayName} is now ${newRole}`);
    } catch (e) {
      toast.error("Failed to update role");
    }
  }

  const filtered = users.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="admin-layout">
      {/* Mobile Top Bar */}
      <div className="admin-mobile-topbar">
        <div className="admin-mobile-brand">
          <img src="/logo.png" alt="Logo" />
          <span>G.S.M WORLD</span>
        </div>
        <button className="admin-hamburger" onClick={() => setDrawerOpen(true)}>
          <FiMenu />
        </button>
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
            className="admin-nav-item"
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
            <FiShoppingCart /> Orders
          </Link>
          <Link
            to="/admin/users"
            className="admin-nav-item active"
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
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <h1>Users Management</h1>
          <span className="orders-count">{users.length} registered users</span>
        </div>

        <div className="admin-search-bar">
          <input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="table-loading">
                    Loading users...
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="avatar"
                          className="user-avatar-thumb"
                        />
                      ) : (
                        <div className="user-avatar-placeholder">
                          {user.displayName?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </td>
                    <td>{user.displayName}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === "admin" ? (
                          <>
                            <FiShield /> Admin
                          </>
                        ) : (
                          <>
                            <FiUser /> User
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <button
                        className={`role-toggle-btn ${user.role === "admin" ? "demote" : "promote"}`}
                        onClick={() => toggleRole(user)}
                      >
                        {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Bottom Nav */}
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
          >
            <FiShoppingCart />
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
