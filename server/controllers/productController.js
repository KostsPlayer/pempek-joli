const Produk = require("../models/product.js");
const { storage, imageFilter, upload } = require("../middleware/image.js");
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

exports.createProduct = async (req, res) => {
  const { nama_menu, harga_menu, stock_menu, description, img_menu, jenis_menu } = req.body;
  // const img_menu = req.file ? req.file.filename : null; // Ambil nama file gambar jika tersedia
  try {
    const newProduct = new Produk({
      nama_menu,
      harga_menu,
      stock_menu,
      description,
      img_menu,
      jenis_menu,
    });
    await newProduct.save();
    res.status(201).json({
      status: 201, 
      message: "Product created successfully",
      data: {
        nama_menu: newProduct.nama_menu          ,
        harga_menu: newProduct.harga_menu,
        stock_menu: newProduct.stock_menu,
        description: newProduct.description,
        img_menu: newProduct.img_menu,
        jenis_menu: newProduct.jenis_menu,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getAllProduct = async (req, res) => {
  try {
    const produk = await Produk.find();
    res.status(200).json({
      message: "access defined",
      data: produk,
    });
  } catch (error) {
    res.status(500).json({
      message: "server error",
      serverMessage: error,
    });
  }
};

exports.getProductByKategori = async (req, res) => {
  const { jenis_menu } = req.params;
  try {
    const products = await Produk.find({ jenis_menu: jenis_menu }).select(
      "_id nama_menu harga_menu stock_menu description img_menu"
    );

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "Products not found",
        error: 404,
      });
    }

    res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// exports.getProductById = async (req, res) => {
//   const _id = req.params._id;

//   try {
//     const product = await Produk.findById(_id).select(
//       "_id nama_produk harga stock deskripsi gambar kategori"
//     );

//     if (!product) {
//       return res.status(404).json({
//         message: "Product not found"
//       });
//     }

//     res.status(200).json({
//       message: "access defined",
//       data: product
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// }

exports.getProductById = async (req, res) => {
  const { _id } = req.params;

  try {
    // Gunakan findById untuk mencari produk berdasarkan ID
    const product = await Produk.findById(_id).select(
      "_id nama_menu harga_menu stock_menu description img_menu jenis_menu"
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        error: 404
      });
    }
    res.status(200).json({
      message: "Product found",
      data: product
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};