# 🛍️ Product Online Store

A full-stack e-commerce web application built with **React + Node.js**, featuring product browsing, wishlists, curated experiences, a support ticket system (with real-time Firebase updates), and a full admin panel.

---

## 🚀 What It Does

Users can browse and search products, save them to a wishlist, create curated "experiences" (collections of products), raise support tickets, and manage their profile — all behind a secure JWT-authenticated system. Admins get a separate panel to manage products, categories, users, and tickets.

---

## 🧱 Tech Stack

### Frontend — `my-react-app`
| Tech | Purpose |
|---|---|
| React 19 + Vite | UI framework & build tool |
| React Router v7 | Client-side routing |
| Axios | HTTP requests to the backend API |
| Firebase (Client SDK v12) | Real-time ticket updates via `onSnapshot` |
| GSAP | Animations |
| React Icons | Icon library |
| Context API | Global auth state, wishlist count |

### Backend — `my-node-api`
| Tech | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Primary database (users, products, tickets, etc.) |
| Firebase Admin SDK | Firestore — secondary DB for live ticket system |
| JWT (jsonwebtoken) | Authentication & authorization |
| Bcrypt | Password hashing |
| Multer | File uploads (products, experiences, tickets, avatars) |
| Nodemailer | Email notifications (ticket events) |
| dotenv | Environment variable management |

---

## ✨ Features

### 🔐 Auth System
- Register, Login, Logout
- Forgot Password / Reset Password via email token
- JWT stored in `sessionStorage`, auto-logout on token expiry
- Axios response interceptor catches 401s and logs out automatically
- Role-based access: `user` and `admin`

### 🛒 Products
- Browse all products with pagination
- Search products by name
- Filter products by category, subcategory, price range
- Product cards with image, price, and wishlist toggle
- Logged-in users see their wishlist state on each product

### ❤️ Wishlist
- Toggle any product in/out of wishlist
- Wishlist count shown live in the navbar
- Dedicated wishlist page for logged-in users

### ⚡ Experiences
- Users create named "experiences" — curated product collections
- Add products to an experience
- Join someone else's experience via an **invite code**
- Archive / unarchive experiences
- Paginated experience list with full detail view

### 🎫 Support Tickets (Dual System)

#### MongoDB Tickets (`/ticket`)
- Create tickets with subject, description, and file attachments (up to 7 files, max 3MB)
- View open / closed tickets with pagination
- Reply thread between user and admin
- Reopen closed tickets
- Email notifications sent to user and admin on ticket creation and replies

#### Firebase Tickets (`/ticket-fire`) 🔴 Live
- Same ticket flow but stored in **Firestore**
- Ticket detail page uses `onSnapshot` — replies appear **instantly** without any page refresh
- Admin replies from the admin panel → user sees it live in real time
- Uses `FieldValue.arrayUnion` to safely append replies

### 📸 Capture Page
- Screenshot / capture feature using `html2canvas` and `html-to-image`

### 👤 User Profile
- View profile with avatar
- Update name, email, avatar (image upload)
- Change password (requires current password)

### 🛠️ Admin Panel
- Separate admin routes protected by `adminAuth` middleware (role check)
- Manage products (create, edit, delete, image upload)
- Manage categories and subcategories
- View and manage all users (activate/deactivate)
- View all tickets, update status (Open / In Progress / Closed), reply to tickets

### 📧 Email Notifications
- Ticket raised → confirmation email to user + alert to admin
- Admin replies → email to user
- User replies → email to admin
- Forgot password → reset link email

---

## 📁 Project Structure

```
product/
├── my-node-api/          # Express REST API
│   ├── config/
│   │   ├── db.js             # MongoDB connection
│   │   └── firebaseAdmin.js  # Firebase Admin SDK init
│   ├── controllers/          # Route handlers
│   ├── middleware/
│   │   ├── auth.js           # JWT user auth
│   │   ├── adminAuth.js      # JWT admin role check
│   │   └── upload.js         # Multer file upload config
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express routers
│   ├── services/             # DB abstraction layer
│   ├── utils/
│   │   ├── asyncHandler.js   # Async error wrapper
│   │   └── sendEmail.js      # Nodemailer helper
│   ├── server.js             # App entry point
│   └── serviceAccountKey.json  # Firebase credentials (keep secret!)
│
├── my-react-app/         # React + Vite frontend
│   └── src/
│       ├── api/
│       │   ├── axios.jsx         # Axios instance with auth header
│       │   └── services.jsx      # All API call functions
│       ├── config/
│       │   └── firebase.js       # Firebase client SDK init
│       ├── context/
│       │   └── authContext.jsx   # Global auth + wishlist state
│       ├── hooks/                # Custom hooks
│       ├── components/           # Reusable UI components
│       ├── pages/
│       │   ├── public/           # Login, Signup, ForgotPassword, ResetPassword
│       │   └── private/          # Experience, Wishlist, Tickets, Profile
│       ├── routes/               # Route config + private/public guards
│       └── layouts/              # Dynamic, private, public layout wrappers
│
└── uploads/              # Uploaded files served statically
    ├── products/
    ├── experiences/
    ├── tickets/
    └── users/
```

---

## ⚙️ Setup & Running

### Prerequisites
- Node.js v18+
- MongoDB running locally or a MongoDB Atlas URI
- A Firebase project with Firestore enabled
- A `serviceAccountKey.json` downloaded from Firebase Console

### Backend

```bash
cd my-node-api
npm install
```

Create a `.env` file:
```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/product-store
JWT_SECRET=your_jwt_secret
EMAIL=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Place your `serviceAccountKey.json` in `my-node-api/`.

```bash
npm run dev
```

### Frontend

```bash
cd my-react-app
npm install
npm run dev
```

---

## 🔌 API Routes Overview

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/users/register` | Register user | Public |
| POST | `/api/users/login` | Login | Public |
| POST | `/api/users/forgot-password` | Send reset email | Public |
| PUT | `/api/users/reset-password/:token` | Reset password | Public |
| GET | `/api/users/me` | Get current user | User |
| GET | `/api/products` | Get all products (paginated) | Public |
| GET | `/api/products/search` | Search products | Public |
| GET | `/api/products/filter` | Filter products | Public |
| POST | `/api/wishlist/:productId` | Toggle wishlist | User |
| GET | `/api/experiences` | Get experiences | User |
| POST | `/api/experiences/join` | Join via invite code | User |
| GET | `/api/tickets` | Get user tickets (MongoDB) | User |
| POST | `/api/tickets` | Create ticket (MongoDB) | User |
| POST | `/api/tickets/:id/reply` | Reply to ticket | User |
| GET | `/api/tickets-fire` | Get user tickets (Firebase) | User |
| POST | `/api/tickets-fire` | Create ticket (Firebase) | User |
| POST | `/api/tickets-fire/:id/reply` | Reply — triggers live update | User |
| GET | `/api/admin/...` | Admin management routes | Admin |

---

## 🔴 Real-Time Tickets (How It Works)

The Firebase ticket detail page uses Firestore's `onSnapshot` listener directly from React:

```
User opens ticket detail page
        ↓
onSnapshot(doc(db, "tickets", ticketId)) opens a WebSocket to Firestore
        ↓
Admin replies via admin panel → Node updates Firestore with arrayUnion
        ↓
Firestore pushes the change → onSnapshot fires → React state updates
        ↓
New reply appears on screen instantly — no refresh needed
```

---

## 🔒 Security Notes

- `serviceAccountKey.json` is gitignored — never commit it
- Passwords are hashed with bcrypt before storing
- JWT tokens expire automatically; the frontend auto-logs out on expiry
- Admin routes are protected by a separate `adminAuth` middleware that checks `role === "admin"` in the token
- File uploads are validated by type and size before saving
