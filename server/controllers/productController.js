const Produk = require("../models/product.js");
const Supabase = require("../config/supabase.js");
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
  const { nama_menu, harga_menu, stock_menu, description, jenis_menu } = req.body;
  const { file } = req;

  try {
    let img_menu = null;

    // Upload gambar ke Supabase jika ada file yang diunggah
    if (file) {
      const filePath = `products/${Date.now()}_${file.originalname}`;
      const { data, error } = await Supabase.storage
        .from('payments-image') // Ganti dengan nama bucket Anda
        .upload(filePath, file.buffer, {
          cacheControl: '3600',
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

      // Simpan nama asli file di database
      img_menu = file.originalname;
    }

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
        nama_menu: newProduct.nama_menu,
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

exports.editProduct = async (req, res) => {
  const { _id } = req.params;
  const { nama_menu, harga_menu, stock_menu, description, jenis_menu } = req.body;
  const { file } = req;

  try {
    const product = await Produk.findById(_id);
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
      });
    }

    // Upload gambar baru ke Supabase jika ada file yang diunggah
    if (file) {
      const filePath = `products/${Date.now()}_${file.originalname}`;
      const { data, error } = await Supabase.storage
        .from('payments-image') // Ganti dengan nama bucket Anda
        .upload(filePath, file.buffer, {
          cacheControl: '3600',
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

      // Simpan nama asli file di database
      product.img_menu = file.originalname;
    }

    // Update product details
    product.nama_menu = nama_menu;
    product.harga_menu = harga_menu;
    product.stock_menu = stock_menu;
    product.description = description;
    product.jenis_menu = jenis_menu;

    await product.save();

    res.status(200).json({
      status: 200,
      message: "Product updated successfully",
      data: {
        nama_menu: product.nama_menu,
        harga_menu: product.harga_menu,
        stock_menu: product.stock_menu,
        description: product.description,
        img_menu: product.img_menu,
        jenis_menu: product.jenis_menu,
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

exports.deleteProduct = async (req, res) => {
  const { _id } = req.params;

  try {
    const product = await Produk.findById(_id);
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
      });
    }

    // Hapus gambar dari Supabase jika ada
    if (product.img_menu) {
      const filePath = `products/${product.img_menu}`;
      const { error } = await Supabase.storage
        .from('payments-image') // Ganti dengan nama bucket Anda
        .remove([filePath]);

      if (error) {
        console.error("Error deleting file from Supabase:", error);
        return res.status(500).json({
          status: 500,
          message: "Internal server error",
          error: error.message,
        });
      }
    }

    await product.deleteOne();

    res.status(200).json({
      status: 200,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
}