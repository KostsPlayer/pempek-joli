const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const authRoutes = require("./routes/authRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const imageRoutes = require("./routes/imageRoutes.js");
const metodRoutes = require("./routes/metodRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const alamatpengirimanRoutes = require("./routes/alamatpengirimanRoutes.js");
const pembayaranRoutes = require("./routes/pembayaranRoutes.js");
const Profile = require("./routes/profileRoutes.js");

const Pembayaran = require("./models/pembayaran.js");

const app = express();
app.use(express.json());

<<<<<<< HEAD
app.use(
  cors({
    origin: ["http://localhost:5173", "https://pempek-joli-client.vercel.app"],
    methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
=======
// Connect to MongoDB
connectDB();

>>>>>>> 0c44fbdb1dff562c883b76efa54fc2dc491daaf8


// Connect to MongoDB
connectDB();

// Route Handling
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use(express.static("img"));
app.use("/", imageRoutes);
app.use("/api/payments", metodRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/alamatpengiriman", alamatpengirimanRoutes);
app.use("/api", pembayaranRoutes);
app.use("/api/profile", Profile);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

});
