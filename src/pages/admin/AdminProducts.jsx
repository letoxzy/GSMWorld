import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import {
  FiPackage,
  FiUsers,
  FiShoppingCart,
  FiGrid,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSave,
  FiUpload,
  FiHome,
  FiMenu,
} from "react-icons/fi";
import toast from "react-hot-toast";
import "../../styles/Admin.css";

const EMPTY_PRODUCT = {
  name: "",
  brand: "",
  category: "Smartphones",
  price: "",
  oldPrice: "",
  stock: "",
  description: "",
  imageUrl: "",
  isNew: false,
  condition: "New",
  specs: { Storage: "", RAM: "", Battery: "", Display: "" },
};

const CLOUD_NAME = "dedpaxzta";
const UPLOAD_PRESET = "joebest_products";

export default function AdminProducts() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  async function fetchProducts() {
    try {
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      toast.error("Failed to load products");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function openAdd() {
    setEditProduct(null);
    setForm(EMPTY_PRODUCT);
    setImageFile(null);
    setShowModal(true);
  }

  function openEdit(product) {
    setEditProduct(product);
    setForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "Smartphones",
      price: product.price || "",
      oldPrice: product.oldPrice || "",
      stock: product.stock || "",
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      isNew: product.isNew || false,
      condition: product.condition || "New",
      specs: product.specs || {
        Storage: "",
        RAM: "",
        Battery: "",
        Display: "",
      },
    });
    setImageFile(null);
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    setSaving(true);
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("folder", "gsmworld/products");
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData },
        );
        const data = await res.json();
        if (!data.secure_url) throw new Error("Cloudinary upload failed");
        imageUrl = data.secure_url;
      }
      const productData = {
        ...form,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        stock: Number(form.stock),
        imageUrl,
        updatedAt: serverTimestamp(),
      };
      if (editProduct) {
        await updateDoc(doc(db, "products", editProduct.id), productData);
        toast.success("Product updated!");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
          rating: 4,
          reviews: 0,
        });
        toast.success("Product added!");
      }
      setShowModal(false);
      fetchProducts();
    } catch (e) {
      toast.error("Failed to save product");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch (e) {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  }

  // Increase or decrease a product's stock by `delta` (e.g. +1 or -1).
  // Stock can never go below 0.
  async function adjustStock(product, delta) {
    const newStock = Math.max(0, (Number(product.stock) || 0) + delta);
    try {
      await updateDoc(doc(db, "products", product.id), { stock: newStock });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p)),
      );
    } catch (e) {
      toast.error("Failed to update stock");
      console.error(e);
    }
  }

  const filtered = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()),
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
            className="admin-nav-item active"
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
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <h1>Products Management</h1>
          <button className="admin-add-btn" onClick={openAdd}>
            <FiPlus /> Add Product
          </button>
        </div>

        <div className="admin-search-bar">
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span>{filtered.length} products</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="table-loading">
                    Loading products...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="table-empty">
                    No products found
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={p.imageUrl || "/placeholder.png"}
                        alt={p.name}
                        className="admin-product-thumb"
                      />
                    </td>
                    <td className="product-name-cell">{p.name}</td>
                    <td>{p.brand}</td>
                    <td>
                      <span className="category-tag">{p.category}</span>
                    </td>
                    <td>
                      <span
                        className={`condition-badge-table ${p.condition?.toLowerCase() || "new"}`}
                      >
                        {p.condition || "New"}
                      </span>
                    </td>
                    <td>₦{Number(p.price).toLocaleString()}</td>
                    <td>
                      <div className="stock-adjust">
                        <button
                          className="stock-adjust-btn"
                          onClick={() => adjustStock(p, -1)}
                          disabled={p.stock <= 0}
                          title="Decrease stock"
                        >
                          −
                        </button>
                        <span className="stock-adjust-value">{p.stock}</span>
                        <button
                          className="stock-adjust-btn"
                          onClick={() => adjustStock(p, 1)}
                          title="Increase stock"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`stock-badge ${p.stock > 0 ? "in-stock" : "out-stock"}`}
                      >
                        {p.stock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="edit-action-btn"
                        onClick={() => openEdit(p)}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="delete-action-btn"
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editProduct ? "Edit Product" : "Add New Product"}</h2>
              <button onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-grid">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Samsung Galaxy A55"
                  />
                </div>
                <div className="form-group">
                  <label>Brand *</label>
                  <input
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                    placeholder="e.g. Samsung"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    {[
                      "Smartphones",
                      "Accessories",
                      "Tablets",
                      "Earphones",
                      "Chargers",
                      "Cases",
                    ].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (₦) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="e.g. 250000"
                  />
                </div>
                <div className="form-group">
                  <label>Old Price (₦)</label>
                  <input
                    type="number"
                    value={form.oldPrice}
                    onChange={(e) =>
                      setForm({ ...form, oldPrice: e.target.value })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    placeholder="e.g. 20"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Product description..."
                />
              </div>

              <div className="form-group">
                <label>Product Image</label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    id="img-upload"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="img-upload" className="upload-label">
                    <FiUpload />{" "}
                    {imageFile ? imageFile.name : "Click to upload image"}
                  </label>
                  {(form.imageUrl || imageFile) && (
                    <img
                      src={
                        imageFile
                          ? URL.createObjectURL(imageFile)
                          : form.imageUrl
                      }
                      alt="preview"
                      className="image-preview"
                    />
                  )}
                </div>
                <input
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                  placeholder="Or paste image URL"
                  style={{ marginTop: 8 }}
                />
              </div>

              <div className="form-group">
                <label>Condition</label>
                <div className="condition-toggle">
                  {["New", "Used", "Refurbished"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`condition-btn ${form.condition === c ? "active" : ""}`}
                      onClick={() => setForm({ ...form, condition: c })}
                    >
                      {c === "New" ? "✨" : c === "Used" ? "🔄" : "🔧"} {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="specs-grid">
                <h4>Specifications</h4>
                {Object.keys(form.specs).map((key) => (
                  <div className="form-group" key={key}>
                    <label>{key}</label>
                    <input
                      value={form.specs[key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          specs: { ...form.specs, [key]: e.target.value },
                        })
                      }
                      placeholder={key}
                    />
                  </div>
                ))}
              </div>

              <label className="is-new-check">
                <input
                  type="checkbox"
                  checked={form.isNew}
                  onChange={(e) =>
                    setForm({ ...form, isNew: e.target.checked })
                  }
                />
                Mark as New Arrival
              </label>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-modal-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="save-modal-btn"
                onClick={handleSave}
                disabled={saving}
              >
                <FiSave />{" "}
                {saving
                  ? "Saving..."
                  : editProduct
                    ? "Update Product"
                    : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

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
