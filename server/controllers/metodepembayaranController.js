const MetodePembayaran = require('../models/metode_pembayaran.js');
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

exports.createMetodePembayaran = async (req, res) => {
    const { nama_metode, deskripsi_metode_pembayaran } = req.body;
    try {
        const newMetod = new MetodePembayaran({
            nama_metode,
            deskripsi_metode_pembayaran
        });

        await newMetod.save();

        res.status(201).json({
            status: 201,
            message: "Methode created successfully",
            data: {
              method: newMetod,
            },
          });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
          });
    }
}

exports.getAllMetodePembayaran = async (req, res) => {
  try {
    const methodPay = await MetodePembayaran.find();
    res.status(200).json({
      message: "ok",
      data: methodPay,
    });
  } catch (error) {
    res.status(500).json({
      message: "server error",
      serverMessage: error,
    });
  }
}

exports.getMethodById = async (req, res) => {
  const { _id } = req.params;
  try {
    const method = await MetodePembayaran.findById(_id).select(
      "nama_metode deskripsi_metode_pembayaran"
    );
    if (!method) {
      return res.status(404).json({
        message: "method not found",
        error: 404
      });
    }
    res.status(200).json({
      message: "Product found",
      data: method
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}