const Pembayaran = require("../models/pembayaran.js");
const Pesanan = require("../models/pesanan.js");
const path = require("path");
const fs = require("fs");
const Supabase = require("../config/supabase.js");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://pempek-joli-client.vercel.app"],
    methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Function to update the payment proof
exports.updateBuktiPembayaran = async (req, res) => {
  const { _id } = req.params; // Get the payment ID from request parameters
  const { file } = req; // Multer stores the uploaded file info in `req.file`

  try {
    // Find the payment document by ID
    const payment = await Pembayaran.findById(_id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check if a file is uploaded
    if (!file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }
    // Upload the file to Supabase
    const { data, error } = await Supabase.storage
      .from("payments-image") // Ganti dengan nama bucket Anda
      .upload(`payments/${file.originalname}`, file.buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.mimetype,
      });

    if (error) {
      console.error("Error uploading file to Supabase:", error);
      return res.status(500).json({
        status: 500,
        message: "Internal server error",
        error: error.message,
      });
    }

    // Update the payment document with the new proof image path
    payment.bukti_pembayaran =  file.originalname;
    payment.status_pembayaran = "Success";
    payment.tanggal_pembayaran = new Date(); // Set current date as payment date
    await payment.save();

    res.status(200).json({
      status: 200,
      message: "Payment proof updated successfully",
      data: {
        id_pembayaran: payment._id,
        bukti_pembayaran: payment.bukti_pembayaran,
        status_pembayaran: payment.status_pembayaran,
        tanggal_pembayaran: payment.tanggal_pembayaran,
      },
    });
  } catch (error) {
    console.error("Error updating payment proof:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getPaymentsById = async (req, res) => {
  const { _id } = req.params;
  try {
    const payment = await Pembayaran.findById(_id).select(
      "id_pengguna metode_pembayaran status_pembayaran"
    );

    if (!Pembayaran) {
      return res.status(404).send({
        message: "Product not found",
        error: 404,
      });
    }
    // Cari data order berdasarkan id_pembayaran
    const order = await Pesanan.findOne({ id_pembayaran: _id }).select(
      "id_MetodePembayaran id_alamat_pengiriman id_pembayaran id_pengguna metode_pengambilan detail_pesanan total_harga tanggal_pesanan status_pesanan isActive"
    );

    if (!order) {
      return res.status(404).send({
        message: "Order not found",
        error: 404,
      });
    }

    // Gabungkan data dari kedua tabel menjadi satu respons
    res.status(200).json({
      message: "Payment and Order found",
      data: {
        payment: {
          id_pembayaran: payment._id,
          id_pengguna: payment.id_pengguna,
          metode_pembayaran: payment.metode_pembayaran,
          status_pembayaran: payment.status_pembayaran,
          bukti_pembayaran: payment.bukti_pembayaran,
        },
        order: {
          id_MetodePembayaran: order.id_MetodePembayaran,
          id_alamat_pengiriman: order.id_alamat_pengiriman,
          id_pembayaran: order.id_pembayaran,
          id_pengguna: order.id_pengguna,
          metode_pengambilan: order.metode_pengambilan,
          detail_pesanan: order.detail_pesanan,
          total_harga: order.total_harga,
          tanggal_pesanan: order.tanggal_pesanan,
          status_pesanan: order.status_pesanan,
          isActive: order.isActive,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payment = await Pembayaran.find().populate('id_pengguna');
    res.status(200).json({
      message: "All payments found",
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
}
