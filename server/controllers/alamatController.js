const AlamatPengiriman = require("../models/alamat_pengiriman.js"); // Ensure the correct path to your model
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

exports.createAlamatPengiriman = async (req, res) => {
  const { address, province, city, description, postal_code } = req.body;
  let id_pengguna = req.user._id;

  try {
    // Validate required fields
    if (!address || !province || !city || !description || !postal_code) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new AlamatPengiriman document
    const alamat = new AlamatPengiriman({
      id_pengguna, // Assuming req.userId is set by authentication middleware
      address,
      province,
      city,
      description,
      postal_code,
      // currentStatus, currentLocation, and lastUpdated are automatically set by the schema's default values
    });

    // Save the document to the database
    await alamat.save();

    // Respond with the created address
    res
      .status(201)
      .json({ message: "Alamat pengiriman created successfully", alamat });
  } catch (error) {
    console.error("Error creating alamat pengiriman:", error);
    res
      .status(500)
      .json({
        message: "An error occurred while creating alamat pengiriman",
        error: error.message,
      });
  }
};

exports.getAllAlamatPengiriman = async (req, res) => {
  try {
    // Find all addresses for the current user
    const alamat = await AlamatPengiriman.find({ id_pengguna: req.user._id });

    // Respond with the addresses
    res.status(200).json({ message: "Success", alamat });
  } catch (error) {
    console.error("Error fetching alamat pengiriman:", error);
    res
      .status(500)
      .json({
        message: "An error occurred while fetching alamat pengiriman",
        error: error.message,
      });
  }
};

exports.deleteAlamatPengiriman = async (req, res) => {
  const { _id } = req.params;
  try {
    const alamat = await AlamatPengiriman.deleteOne({ _id });
    if (alamat.deletedCount === 0) {
      return res.status(404).json({
        status: 404,
        message: "address not found or already deleted",
      });
    }
    res.status(200).json({
      status: 200,
      message: `${alamat.deletedCount} alamat(s) deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
