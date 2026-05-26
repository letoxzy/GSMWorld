# JOE, BEST Communication System — G.S.M WORLD 📱

A full-featured e-commerce web app for mobile phones and accessories, built with **React + Vite + Firebase**.

---

## 🗂 Project Structure

```
GSMWorld/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── firebase.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── firebase.js
    ├── components/
    │   ├── Navbar.jsx
    │   ├── BottomNav.jsx
    │   ├── ProductCard.jsx
    │   ├── CartItem.jsx
    │   ├── Footer.jsx
    │   └── ProtectedRoute.jsx
    ├── pages/
    │   ├── Home.jsx
    │   ├── Products.jsx
    │   ├── ProductDetail.jsx
    │   ├── Cart.jsx
    │   ├── Wishlist.jsx
    │   ├── Orders.jsx
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── ForgotPassword.jsx
    │   ├── Profile.jsx
    │   └── admin/
    │       ├── AdminDashboard.jsx
    │       ├── AdminProducts.jsx
    │       ├── AdminOrders.jsx
    │       └── AdminUsers.jsx
    ├── context/
    │   ├── AuthContext.jsx
    │   ├── CartContext.jsx
    │   └── WishlistContext.jsx
    └── styles/
        ├── global.css
        ├── Navbar.css
        ├── Home.css
        ├── Products.css
        ├── ProductDetail.css
        ├── Cart.css
        ├── Auth.css
        ├── Admin.css
        ├── Footer.css
        └── BottomNav.css
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd GSMWorld
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (e.g. `joebest-gsmworld`)
3. Enable these services:
   - **Authentication** → Email/Password + Google
   - **Firestore Database** → Start in test mode
   - **Storage** → Start in test mode
4. Go to Project Settings → Add Web App → Copy config
5. Paste your config into `src/firebase.js`:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### 3. Add Your Logo

Place your logo image at:
```
GSMWorld/public/logo.png
```

### 4. Create Admin Account

In `src/context/AuthContext.jsx`, the admin credentials are:
```
Email:    admin@joebest.com
Password: Admin@GSMWorld2024
```
> ⚠️ Change these before going live!

Register once using these credentials via the Sign Up page — Firebase will create the account, and the app will automatically assign `role: admin`.

### 5. Set Firestore Rules (Production)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /orders/{id} {
      allow read, write: if request.auth != null;
    }
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### 6. Run Locally

```bash
npm run dev
```
Visit: `http://localhost:3000`

### 7. Build for Production

```bash
npm run build
```

---

## 🌐 Deploy to Vercel

1. Push project to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Set Framework: **Vite**
4. Add environment variables if needed
5. Deploy!

The `vercel.json` already handles SPA routing.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🏠 Home | Hero, categories, featured products, map |
| 🛍 Products | Search, filter by category/brand/price, sort |
| 📱 Product Detail | Images, specs, tabs, WhatsApp contact |
| 🛒 Cart | Add/remove/update, order summary, checkout |
| 💖 Wishlist | Save & move to cart |
| 📦 Orders | Track status, order history |
| 🔐 Auth | Login, Register, Google Sign-In |
| 🔑 Forgot Password | Gmail reset link |
| 👤 Profile | Edit info, map location picker |
| 🛡️ Admin | Dashboard, Products CRUD, Orders management, Users |
| 📱 Mobile | Bottom navigation bar (Jumia-style) |
| 🗺️ Map | OpenStreetMap via Leaflet |

---

## 🎨 Color Theme

| Color | Usage |
|---|---|
| `#e85d04` | Primary orange (brand color) |
| `#1a1a2e` | Dark navy background |
| `#12122a` | Card background |
| `#f0f0f0` | Text |

---

## 📞 Store Info

- **Location:** B139 Railway Line Ogbete Main Market, Enugu
- **Phone 1:** 08064093705
- **Phone 2:** 08123817997
