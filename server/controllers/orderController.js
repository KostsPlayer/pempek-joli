const Order = require("../models/pesanan.js");
const Cart = require("../models/cart.js");
const MetodePembayaran = require("../models/metode_pembayaran.js");
const AlamatPengiriman = require("../models/alamat_pengiriman.js");
const Produk = require("../models/product.js");
const Pembayaran = require("../models/pembayaran.js");

exports.createOrder = async (req, res) => {
  try {
    let id_pengguna = req.user._id;
    const {
      id_MetodePembayaran,
      id_alamat_pengiriman, // This field can be null or undefined
      detail_pesanan,
      total_harga, // Directly use total_harga from req.body
      metode_pengambilan,
    } = req.body;

    // Find the active cart for the user
    const cart = await Cart.findOne({
      id_pengguna: id_pengguna,
      "products.isActive": true,
    });
    if (!cart) {
      return res.status(404).json({ message: "Active cart not found" });
    }

    // Validate the payment method ID
    const paymentMethod = await MetodePembayaran.findById(id_MetodePembayaran);
    if (!paymentMethod) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    // Validate the shipping address ID if provided
    let shippingAddress = null;
    if (id_alamat_pengiriman) {
      shippingAddress = await AlamatPengiriman.findById(id_alamat_pengiriman);
      if (!shippingAddress) {
        return res.status(404).json({ message: "Shipping address not found" });
      }
    }

    // Create the payment record
    const payment = new Pembayaran({
      metode_pembayaran: paymentMethod.nama_metode, // Assuming the payment method has a `nama_metode` field
      status_pembayaran: "Pending", // Initial status for payment
      id_pengguna: id_pengguna,
    });
    await payment.save();
    // Set a timeout to update payment status to "c ancelled" if no proof is uploaded within 5 minutes
    setTimeout(async () => {
      try {
        const pembayaran = await Pembayaran.findById(payment._id);
        if (pembayaran && pembayaran.status_pembayaran === "Pending") {
          pembayaran.status_pembayaran = "Cancelled";
          await pembayaran.save();
          console.log(
            `Payment ${payment._id} cancelled due to no proof of payment`
          );
        }
      } catch (err) {
        console.error(`Error cancelling payment ${payment._id}:`, err);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Prepare order details
    const orderDetails = detail_pesanan.map((item) => ({
      id_product: item.id_product,
      Jumlah: item.jumlah,
      total_harga: item.total_harga, // Assumes detail_pesanan in req.body includes total_harga for each item
    }));

    // Create a new Order document
    const newOrder = new Order({
      id_MetodePembayaran,
      id_alamat_pengiriman: id_alamat_pengiriman || null, // Set to null if not provided
      id_pembayaran: payment._id, // Reference the created payment record
      id_pengguna: id_pengguna,
      metode_pengambilan,
      detail_pesanan: orderDetails,
      total_harga: total_harga, // Use the total_harga from req.body
      tanggal_pesanan: new Date(),
      status_pesanan: "Pending",
      isActive: true,
    });

    // Save the new order to the database
    await newOrder.save();

    // Reduce the stock quantity for each product
    await Promise.all(
      detail_pesanan.map(async (item) => {
        const product = await Produk.findById(item.id_product);
        if (!product) {
          throw new Error(`Product with ID ${item.id_product} not found`);
        }
        if (product.stock_menu < item.jumlah) {
          throw new Error(
            `Insufficient stock for product with ID ${item.id_product}`
          );
        }
        product.stock_menu -= item.jumlah;
        await product.save();
      })
    );

    // Mark the cart products as inactive and update status_final
    cart.products.forEach((product) => {
      if (product.isActive) {
        product.isActive = false;
        product.status_final = true; // Add status_final field and set it to true
      }
    });

    // Save the updated cart
    await cart.save();

    res.status(201).json({
      status: 201,
      message: "Order created successfully",
      data: {
        id_MetodePembayaran: newOrder.id_MetodePembayaran,
        id_alamat_pengiriman: newOrder.id_alamat_pengiriman,
        id_pembayaran: newOrder.id_pembayaran,
        metode_pengambilan: newOrder.metode_pengambilan,
        id_pengguna: newOrder.id_pengguna,
        detail_pesanan: newOrder.detail_pesanan,
        total_harga: newOrder.total_harga,
        tanggal_pesanan: newOrder.tanggal_pesanan,
        status_pesanan: newOrder.status_pesanan,
        isActive: newOrder.isActive,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.getOrdersByUserId = async (req, res) => {
  try {
    let id_pengguna = req.user._id;

    // Find all orders for the given user ID
    const orders = await Order.find({ id_pengguna });

    // If no orders found, return a 404 status
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No orders found for the user",
      });
    }

    // Respond with the found orders
    res.status(200).json({
      status: 200,
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.GetCountOrderByIdPengguna = async (req, res) => {
  const { id_pengguna } = req.params;
  try {
    const countOrder = await Order.countDocuments({ id_pengguna });

    res.status(200).json({
      message: "Order count retrieved successfully",
      data: {
        id_pengguna,
        countOrder,
      },
    });
  } catch (error) {
    console.error("Error retrieving order count:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { _id } = req.params; // Ambil orderId dari parameter URL
  const { status_pesanan } = req.body; // Ambil status_pesanan dari body permintaan

  // Validasi status_pesanan
  const validStatuses = ["Pending", "Completed", "Cancelled"];
  if (!validStatuses.includes(status_pesanan)) {
    return res.status(400).json({
      message: "Invalid status",
      error: 400,
    });
  }

  try {
    // Temukan pesanan berdasarkan ID dan perbarui status
    const updatedOrder = await Order.findByIdAndUpdate(
      _id,
      { status_pesanan },
      { new: true } // Mengembalikan dokumen yang sudah diperbarui
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found",
        error: 404,
      });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.deleteOrder = async (req, res) => {
  const { _id } = req.params; // Ambil orderId dari parameter URL

  try {
    // Temukan dan hapus pesanan berdasarkan ID
    const deletedOrder = await Order.findByIdAndDelete(_id);

    if (!deletedOrder) {
      return res.status(404).json({
        message: "Order not found",
        error: 404,
      });
    }

    res.status(200).json({
      message: "Order deleted successfully",
      data: deletedOrder,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
