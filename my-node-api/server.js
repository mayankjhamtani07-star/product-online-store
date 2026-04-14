require("dotenv").config();
const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")

const app = express();

const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const wishRoutes = require("./routes/wishRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const leadRoutes = require("./routes/leadRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const ticketFireRoutes = require("./routes/ticketFireRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const path = require("path");

const http = require("http");
const { Server } = require("socket.io");
const { setIO } = require("./config/socketInstance");

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
setIO(io);

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wishlist", wishRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/tickets-fire", ticketFireRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

io.on("connection", (socket) => {
    
    socket.on("join_ticket", (ticketId) => {
        socket.join(ticketId);  // joins a room named after ticketId
    });

    socket.on("disconnect", () => {});
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
