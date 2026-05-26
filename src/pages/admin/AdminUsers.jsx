import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
} from "react-icons/fi";
import toast from "react-hot-toast";
import "../../styles/Admin.css";

export default function AdminUsers() {
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
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/logo.png" alt="Logo" className="admin-logo" />
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
          <Link to="/admin/orders" className="admin-nav-item">
            <FiShoppingCart /> Orders
          </Link>
          <Link to="/admin/users" className="admin-nav-item">
            <FiUsers /> Users
          </Link>

          <Link to="/" className="admin-nav-item store-link" target="_blank">
            <FiHome /> View Store
          </Link>
        </nav>
      </aside>

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
    </div>
  );
}
