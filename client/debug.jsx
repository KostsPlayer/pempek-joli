// const express = require("express");
// require("dotenv").config();
// const connectDB = require("./config/db");
// const cors = require("cors");
// const fs = require("fs");
// const path = require("path");
// const http = require("http");
// const socketIo = require("socket.io");
// const axios = require("axios");

// const authRoutes = require("./routes/authRoutes.js");
// const productRoutes = require("./routes/productRoutes.js");
// const cartRoutes = require("./routes/cartRoutes.js");
// const imageRoutes = require("./routes/imageRoutes.js");
// const metodRoutes = require("./routes/metodRoutes.js");
// const orderRoutes = require("./routes/orderRoutes.js");
// const alamatpengirimanRoutes = require("./routes/alamatpengirimanRoutes.js");

// const alamatpengiriman = require("./models/alamat_pengiriman.js");

// const app = express();
// app.use(express.json());

// // Connect to MongoDB
// connectDB();

// // CORS Configuration
// app.use(
//   cors({
//     origin: ["http://localhost:5173"],
//     methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"],
//     credentials: true,
//     optionsSuccessStatus: 200,
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // Route Handling
// app.use("/api/auth", authRoutes);
// app.use("/api/product", productRoutes);
// app.use("/api/cart", cartRoutes);
// app.use(express.static("img"));
// app.use("/", imageRoutes);
// app.use("/api/payments", metodRoutes);
// app.use("/api/order", orderRoutes);
// app.use("/api/alamatpengiriman", alamatpengirimanRoutes);

// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // Live Tracking
// const googleMapsApiKey = process.env.API_GOOGLE_MAPs; // Replace with your API key

// async function calculateRoute(origin, destination, travelMode) {
//   const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
//     origin
//   )}&destination=${encodeURIComponent(
//     destination
//   )}&mode=${travelMode}&key=${googleMapsApiKey}`;

//   try {
//     const response = await axios.get(url);

//     if (response.data.routes && response.data.routes.length > 0) {
//       const route = response.data.routes[0].legs[0].steps;

//       const steps = route.map((step) => ({
//         lat: step.start_location.lat,
//         lng: step.start_location.lng,
//         duration: step.duration.value, // duration in seconds
//       }));

//       // Add the final destination
//       steps.push({
//         lat: route[route.length - 1].end_location.lat,
//         lng: route[route.length - 1].end_location.lng,
//         duration: 0,
//       });

//       return steps;
//     } else {
//       console.error("No routes found");
//       return [];
//     }
//   } catch (error) {
//     console.error("Error fetching directions", error);
//     return [];
//   }
// }

// const clients = {}; // To store tracking status per client

// io.on("connection", (socket) => {
//   console.log("Client connected");

//   socket.on("startTracking", async ({ origin, destination, travelMode }) => {
//     const steps = await calculateRoute(origin, destination, travelMode);

//     if (steps.length === 0) {
//       console.error("No steps available for the given route");
//       return;
//     }

//     clients[socket.id] = {
//       origin,
//       destination,
//       travelMode,
//       steps,
//       currentIndex: 0,
//       elapsedTime: 0,
//     };

//     const updatePosition = () => {
//       const client = clients[socket.id];
//       if (!client) return;

//       if (client.currentIndex < client.steps.length - 1) {
//         const step = client.steps[client.currentIndex];
//         const nextStep = client.steps[client.currentIndex + 1];

//         client.elapsedTime += 3; // Assuming the interval is 3 seconds

//         if (client.elapsedTime >= step.duration) {
//           client.currentIndex++;
//           client.elapsedTime = 0;
//         }

//         socket.emit("locationUpdate", {
//           lat: step.lat,
//           lng: step.lng,
//         });
//       } else {
//         clearInterval(client.intervalId);
//       }
//     };

//     clients[socket.id].intervalId = setInterval(updatePosition, 3000);

//     socket.on("disconnect", () => {
//       clearInterval(clients[socket.id].intervalId);
//       delete clients[socket.id];
//       console.log("Client disconnected");
//     });
//   });

//   socket.on("resumeTracking", async ({ origin, destination, travelMode }) => {
//     if (!clients[socket.id]) {
//       const steps = await calculateRoute(origin, destination, travelMode);

//       if (steps.length === 0) {
//         console.error("No steps available for the given route");
//         return;
//       }

//       clients[socket.id] = {
//         origin,
//         destination,
//         travelMode,
//         steps,
//         currentIndex: 0,
//         elapsedTime: 0,
//       };
//     }

//     const client = clients[socket.id];
//     const updatePosition = () => {
//       if (client.currentIndex < client.steps.length - 1) {
//         const step = client.steps[client.currentIndex];
//         const nextStep = client.steps[client.currentIndex + 1];

//         client.elapsedTime += 3; // Assuming the interval is 3 seconds

//         if (client.elapsedTime >= step.duration) {
//           client.currentIndex++;
//           client.elapsedTime = 0;
//         }

//         socket.emit("locationUpdate", {
//           lat: step.lat,
//           lng: step.lng,
//         });
//       } else {
//         clearInterval(client.intervalId);
//       }
//     };

//     client.intervalId = setInterval(updatePosition, 3000);

//     socket.on("disconnect", () => {
//       clearInterval(client.intervalId);
//       delete clients[socket.id];
//       console.log("Client disconnected");
//     });
//   });
// });

// server.listen(4000, () => {
//   console.log(`Socket running on port ${4000}`);
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// exports.createOrder = async (req, res) => {
//     try {
//       let id_pengguna = req.user._id;
//       const { id_MetodePembayaran, id_alamat_pengiriman, detail_pesanan } =
//         req.body;
  
//       // Find the active cart for the user
//       const cart = await Cart.findOne({
//         id_pengguna: id_pengguna,
//         "products.isActive": true,
//       });
//       if (!cart) {
//         return res.status(404).json({ message: "Active cart not found" });
//       }
  
//       // Validate the payment method ID
//       const paymentMethod = await MetodePembayaran.findById(id_MetodePembayaran);
//       if (!paymentMethod) {
//         return res.status(404).json({ message: "Payment method not found" });
//       }
  
//       // Validate the shipping address ID
//       const shippingAddress = await AlamatPengiriman.findById(
//         id_alamat_pengiriman
//       );
//       if (!shippingAddress) {
//         return res.status(404).json({ message: "Shipping address not found" });
//       }
  
//       // Create the payment record
//       const payment = new Pembayaran({
//         metode_pembayaran: paymentMethod.nama_metode, // Assuming the payment method has a `name` or `type` field
//         status_pembayaran: "Pending", // Initial status for payment
//         id_pengguna: id_pengguna,
//       });
//       await payment.save();
  
//       // Prepare order details
//       let totalOrderPrice = 0;
//       const orderDetails = await Promise.all(
//         detail_pesanan.map(async (item) => {
//           // Fetch the latest product price from the Produk model
//           const productDetails = await Produk.findById(item.id_product);
//           if (!productDetails) {
//             throw new Error(`Product with ID ${item.id_product} not found`);
//           }
  
//           // Calculate total price for this item
//           const itemTotalPrice = productDetails.harga_menu * item.Jumlah;
  
//           // Add to the total order price
//           totalOrderPrice += itemTotalPrice;
  
//           // Create the order detail object
//           return {
//             id_product: item.id_product,
//             Jumlah: item.Jumlah,
//             total_harga: itemTotalPrice,
//           };
//         })
//       );
  
//       // Create a new Order document
//       const newOrder = new Order({
//         id_MetodePembayaran,
//         id_alamat_pengiriman,
//         id_pembayaran: payment._id, // Reference the created payment record
//         id_pengguna: id_pengguna,
//         detail_pesanan: orderDetails,
//         total_harga: totalOrderPrice,
//         tanggal_pesanan: new Date(),
//         status_pesanan: "Pending",
//         isActive: true,
//       });
  
//       // Save the new order to the database
//       await newOrder.save();
  
//       // Mark the cart products as inactive
//       cart.products.forEach((product) => {
//         if (product.isActive) {
//           product.isActive = false;
//         }
//       });
  
//       // Save the updated cart
//       await cart.save();
//       res.status(201).json({
//         status: 201,
//         message: "Order created successfully",
//         data: {
//           id_MetodePembayaran: newOrder.id_MetodePembayaran,
//           id_alamat_pengiriman: newOrder.id_alamat_pengiriman,
//           id_pembayaran: newOrder.id_pembayaran,
//           id_pengguna: newOrder.id_pengguna,
//           detail_pesanan: newOrder.detail_pesanan,
//           total_harga: newOrder.total_harga,
//           tanggal_pesanan: newOrder.tanggal_pesanan,
//           status_pesanan: newOrder.status_pesanan,
//           isActive: newOrder.isActive,
//         },
//       });
//     } catch (error) {
//       console.error("Error creating order:", error);
//       res.status(500).json({
//         status: 500,
//         message: "Internal server error",
//         error: error.message,
//       });
//     }
//   };
  