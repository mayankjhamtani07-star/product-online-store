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
const path = require("path");

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
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
