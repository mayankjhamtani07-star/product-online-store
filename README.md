# 🛍️ Product Online Store

A full-stack e-commerce web application built with **React + Node.js**, featuring product browsing, wishlists, curated experiences, a support ticket system (with real-time Firebase + Socket.IO updates), FCM push notifications, a cart, and Razorpay payment gateway.

---

## 🚀 What It Does

Users can browse and search products, add them to a cart, pay via Razorpay, save products to a wishlist, create curated "experiences", raise support tickets with real-time replies, and manage their profile — all behind a secure JWT-authenticated system. Admins get a separate panel to manage products, categories, users, tickets, and orders.

---

## 🧱 Tech Stack

### Frontend — `my-react-app`
| Tech | Purpose |
|---|---|
| React 19 + Vite | UI framework & build tool |
| React Router v7 | Client-side routing |
| Axios | HTTP requests to the backend API |
| Firebase (Client SDK) | Firestore `onSnapshot` for live tickets + FCM push notifications |
| Socket.IO Client | Real-time MongoDB ticket replies |
| Razorpay Checkout JS | Payment gateway (loaded dynamically) |
| GSAP | Animations |
| React Icons | Icon library |
| Context API | Global auth state, wishlist count |

### Backend — `my-node-api`
| Tech | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Primary database (users, products, tickets, cart, orders) |
| Firebase Admin SDK | Firestore — secondary DB for live ticket system + FCM push |
| Socket.IO | Real-time events for MongoDB ticket replies |
| Razorpay Node SDK | Payment order creation & signature verification |
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

### 🛒 Cart & Checkout
- Add / remove products from cart
- Cart page with order summary (subtotal + shipping)
- Razorpay payment gateway integration (test mode)
- Razorpay checkout script loaded **dynamically** on checkout click (no preload warnings)
- MongoDB order created **only after** payment signature is verified
- Cart cleared automatically after successful payment
- Redirect to orders page on success

### 📦 Orders
- View all past orders with status (Pending / Processing / Shipped / Delivered / Cancelled)
- Order detail shows items, subtotal, shipping, total, payment ID
- Admin can view all orders and update order status

### ⚡ Experiences
- Users create named "experiences" — curated product collections
- Add products to an experience
- Join someone else's experience via an **invite code**
- Archive / unarchive experiences
- Paginated experience list with full detail view

### 🎫 Support Tickets — Dual System

#### MongoDB Tickets (`/ticket`) — Socket.IO Real-Time
- Create tickets with subject, description, and file attachments (up to 7 files, max 3MB)
- View open / closed tickets with pagination
- Reply thread between user and admin
- Reopen closed tickets
- **Socket.IO** — new replies and status changes appear instantly without page refresh
- Email notifications sent to user and admin on ticket creation and replies

#### Firebase Tickets (`/ticket-fire`) — Firestore Real-Time
- Same ticket flow but stored in **Firestore**
- Ticket detail page uses `onSnapshot` — replies appear **instantly** without any page refresh
- Admin replies from the admin panel → user sees it live in real time
- Uses `FieldValue.arrayUnion` to safely append replies

### 🔔 FCM Push Notifications
- Browser push notifications via Firebase Cloud Messaging
- FCM token saved to DB on login (separate for user and admin)
- **User gets notified** when admin replies to their Firebase ticket
- **Admin gets notified** when user replies to a Firebase ticket
- Foreground notifications handled by `onMessage` in React
- Background notifications handled by service worker (`firebase-messaging-sw.js`)
- `data`-only FCM payload used to prevent duplicate notifications (no SW auto-show conflict)

### 📸 Capture Page
- Screenshot / capture feature using `html2canvas` and `html-to-image`

### 👤 User Profile
- View profile with avatar
- Update name, email, avatar (image upload)
- Change password (requires current password)
- Two-column layout with tabs (Edit Profile / Change Password)

### 🛠️ Admin Panel
- Separate admin routes protected by `adminAuth` middleware (role check)
- Manage products (create, edit, delete, image upload)
- Manage categories and subcategories
- View and manage all users (activate/deactivate)
- View all MongoDB tickets, update status, reply (Socket.IO push to user)
- View all Firebase tickets, update status, reply (FCM push to user)
- View and manage all orders, update order status

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
│   │   ├── db.js                 # MongoDB connection
│   │   ├── firebaseAdmin.js      # Firebase Admin SDK init
│   │   ├── socketInstance.js     # setIO/getIO pattern (avoids circular deps)
│   │   └── razorpay.js           # Razorpay instance
│   ├── controllers/
│   │   ├── userControlers.js     # Auth, profile, FCM token
│   │   ├── ticketController.js   # MongoDB tickets + Socket.IO
│   │   ├── ticketsControllers.js # Firebase tickets + FCM push
│   │   ├── adminController.js    # Admin handlers + Socket.IO + FCM push
│   │   ├── cartController.js     # Cart CRUD
│   │   └── orderController.js    # Razorpay order creation & verification
│   ├── middleware/
│   │   ├── auth.js               # JWT user auth
│   │   ├── adminAuth.js          # JWT admin role check
│   │   └── upload.js             # Multer file upload config
│   ├── models/
│   │   ├── user.js               # fcmToken field added
│   │   ├── cart.js               # Cart model
│   │   └── order.js              # Order model (isPaid, paymentId, status)
│   ├── routes/
│   │   ├── cartRoutes.js
│   │   └── orderRoutes.js
│   ├── services/                 # DB abstraction layer
│   ├── utils/
│   │   ├── asyncHandler.js       # Async error wrapper
│   │   └── sendEmail.js          # Nodemailer helper
│   └── server.js                 # App entry point + Socket.IO setup
│
├── my-react-app/         # React + Vite frontend
│   └── src/
│       ├── api/
│       │   ├── axios.jsx             # Axios instance with auth header
│       │   └── services.jsx          # All API call functions
│       ├── config/
│       │   ├── firebase.js           # Firebase client SDK init
│       │   └── socket.js             # Socket.IO client instance
│       ├── context/
│       │   └── authContext.jsx       # Global auth + wishlist + FCM onMessage
│       ├── pages/
│       │   └── private/
│       │       ├── cart.jsx          # Cart + dynamic Razorpay checkout
│       │       ├── orders.jsx        # Order history
│       │       ├── ticketDetail.jsx  # MongoDB ticket (Socket.IO live)
│       │       ├── ticketsfire.jsx   # Firebase ticket list (onSnapshot)
│       │       └── ticketDetailfire.jsx # Firebase ticket detail (onSnapshot)
│       ├── admin/
│       │   ├── context/adminContext.jsx  # Admin auth + FCM onMessage
│       │   └── pages/manageOrders.jsx    # Admin order management
│       └── public/
│           └── firebase-messaging-sw.js  # FCM background notification SW
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
- A Razorpay account (test mode keys)

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
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Place your `serviceAccountKey.json` in `my-node-api/`.

```bash
npm run dev
```

### Frontend

```bash
cd my-react-app
npm install
```

Create a `.env` file:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

```bash
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
| POST | `/api/users/fcm-token` | Save FCM token | User |
| GET | `/api/products` | Get all products (paginated) | Public |
| GET | `/api/products/search` | Search products | Public |
| GET | `/api/products/filter` | Filter products | Public |
| POST | `/api/wishlist/:productId` | Toggle wishlist | User |
| GET | `/api/cart` | Get cart | User |
| POST | `/api/cart/:productId` | Add to cart | User |
| DELETE | `/api/cart/:id` | Remove from cart | User |
| DELETE | `/api/cart` | Clear cart | User |
| POST | `/api/orders/create-payment` | Create Razorpay order | User |
| POST | `/api/orders/verify-payment` | Verify & save order | User |
| GET | `/api/orders` | Get user orders | User |
| GET | `/api/experiences` | Get experiences | User |
| POST | `/api/experiences/join` | Join via invite code | User |
| GET | `/api/tickets` | Get user tickets (MongoDB) | User |
| POST | `/api/tickets` | Create ticket (MongoDB) | User |
| POST | `/api/tickets/:id/reply` | Reply to ticket | User |
| GET | `/api/tickets-fire` | Get user tickets (Firebase) | User |
| POST | `/api/tickets-fire` | Create ticket (Firebase) | User |
| POST | `/api/tickets-fire/:id/reply` | Reply — triggers FCM push | User |
| GET | `/api/admin/...` | Admin management routes | Admin |
| POST | `/api/admin/fcm-token` | Save admin FCM token | Admin |

---

## 🔴 Real-Time Features

### Socket.IO — MongoDB Tickets
```
User opens ticket detail page
        ↓
Socket.IO client joins room by ticket ID
        ↓
Admin replies via admin panel → server emits "new_reply" to room
        ↓
React receives event → appends reply to state instantly
```

### Firestore onSnapshot — Firebase Tickets
```
User opens ticket detail page
        ↓
onSnapshot(doc(db, "tickets", ticketId)) opens WebSocket to Firestore
        ↓
Admin replies → Node updates Firestore with arrayUnion
        ↓
Firestore pushes change → onSnapshot fires → React state updates instantly
```

### FCM Push Notifications
```
Admin replies to Firebase ticket
        ↓
Backend sends FCM data-only message to user's FCM token
        ↓
If app is open → onMessage in React shows Notification
If app is in background → Service Worker onBackgroundMessage shows Notification
        ↓
No duplicate notifications (data-only payload avoids SW auto-show)
```

---

## 💳 Payment Flow (Razorpay)

```
User clicks "Proceed to Checkout"
        ↓
Razorpay script loaded dynamically (only on first checkout)
        ↓
POST /api/orders/create-payment → Razorpay order created
        ↓
Razorpay popup opens → user completes payment
        ↓
POST /api/orders/verify-payment → signature verified
        ↓
MongoDB order created (isPaid: true) + cart cleared
        ↓
User redirected to /orders
```

---

## 🔒 Security Notes

- `serviceAccountKey.json` is gitignored — never commit it
- Passwords are hashed with bcrypt before storing
- JWT tokens expire automatically; the frontend auto-logs out on expiry
- Admin routes are protected by a separate `adminAuth` middleware that checks `role === "admin"` in the token
- File uploads are validated by type and size before saving
- Razorpay Key Secret is only in backend `.env` — never exposed to frontend
- FCM uses `data`-only payloads to prevent duplicate browser notifications
