const Cart = require("../models/cart.js");
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

// exports.createCart = async (req, res) => {
//     const { id_product, jumlah_product_cart, total_pesanan } = req.body;
//     let id_pengguna = req.user._id; // Extracted from the token by the authenticate middleware

//     try {
//       const newCart = new Cart({
//         id_product,
//         id_pengguna,
//         jumlah_product_cart,
//         total_pesanan,
//       });
//       await newCart.save();
//       res.status(201).json({
//         status: 201,
//         message: "Cart created successfully",
//         data: {
//           id_product: newCart.id_product,
//           id_pengguna: newCart.id_pengguna,
//           jumlah_product_cart: newCart.jumlah_product_cart,
//           total_pesanan: newCart.total_pesanan,
//         },
//       });
//     } catch (error) {
//       // Error handling code here
//       res.status(500).json({
//         status: 500,
//         message: "Internal server error",
//         error: error.message,
//       });
//     }
//   };

exports.createCart = async (req, res) => {
  const { products } = req.body;
  let id_pengguna = req.user._id;

  try {
    const cart = await Cart.findOne({ id_pengguna });

    if (cart) {
      // User already has a cart, update it
      products.forEach((product) => {
        const existingProductIndex = cart.products.findIndex(
          (p) => p.id_product.toString() === product.id_product.toString()
        );

        if (existingProductIndex >= 0) {
          // Product already in cart, update its quantity
          cart.products[existingProductIndex].jumlah_product_cart +=
            product.jumlah_product_cart;
        } else {
          // Product not in cart, add it
          cart.products.push(product);
        }
      });

      // Save the updated cart
      await cart.save();

      res.status(200).json({
        status: 200,
        message: "Cart updated successfully",
        data: {
          cart,
        },
      });
    } else {
      const newCart = new Cart({
        id_pengguna,
        products,
      });

      await newCart.save();

      res.status(201).json({
        status: 201,
        message: "Cart created successfully",
        data: {
          cart: newCart,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateCart = async (req, res) => {
  const { _id } = req.params;
  let { id_product, jumlah_product_cart } = req.body;

  // Jika input bukan array, bungkus dalam array
  if (!Array.isArray(id_product)) {
    id_product = [id_product];
  }
  if (!Array.isArray(jumlah_product_cart)) {
    jumlah_product_cart = [jumlah_product_cart];
  }

  // Periksa apakah panjang array sama
  if (id_product.length !== jumlah_product_cart.length) {
    return res.status(400).json({
      status: 400,
      message:
        "id_product, jumlah_product_cart, and isActive arrays must be of equal length",
    });
  }

  try {
    const cart = await Cart.findOne({ _id: _id });

    if (!cart) {
      return res.status(404).json({
        status: 404,
        message: "Cart not found",
      });
    }

    // Update atau tambahkan produk
    id_product.forEach((productId, index) => {
      const jumlah = jumlah_product_cart[index];
      const productIndex = cart.products.findIndex(
        (product) => product.id_product.toString() === productId
      );

      if (productIndex !== -1) {
        // Jika produk sudah ada, perbarui
        cart.products[productIndex].jumlah_product_cart = jumlah;
      } else {
        // Jika produk tidak ada, tambahkan ke keranjang
        cart.products.push({
          id_product: productId,
          jumlah_product_cart: jumlah,
        });
      }
    });

    // Hapus produk yang tidak ada di array id_product yang diperbarui
    cart.products = cart.products.filter((product) =>
      id_product.includes(product.id_product.toString())
    );

    await cart.save();

    res.status(200).json({
      status: 200,
      message: "Cart updated successfully",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.deleteCart = async (req, res) => {
  let id_pengguna = req.user._id;

  try {
    const cart = await Cart.deleteMany({ id_pengguna });

    if (cart.deletedCount === 0) {
      return res.status(404).json({
        status: 404,
        message: "Cart not found or already deleted",
      });
    }

    res.status(200).json({
      status: 200,
      message: `${cart.deletedCount} cart(s) deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.deleteProductFromCart = async (req, res) => {
  const { _id } = req.params; // _id should be the cart's ID
  const { id_product } = req.body; // id_product should be in the request body

  try {
    const cart = await Cart.findOne({ _id });

    if (!cart) {
      return res.status(404).json({
        status: 404,
        message: "Cart not found",
      });
    }

    // Find the index of the product in the cart's products array
    const productIndex = cart.products.findIndex(
      (product) => product.id_product.toString() === id_product
    );

    if (productIndex !== -1) {
      // Remove the product from the cart
      cart.products.splice(productIndex, 1);
      // Check if the cart's products array is empty after removal
      if (cart.products.length === 0) {
        // Delete the cart if no products are left
        await cart.deleteOne();
        return res.status(200).json({
          status: 200,
          message: "Cart deleted successfully as it became empty",
        });
      } else {
        // Save the updated cart if there are still products left
        await cart.save();
        return res.status(200).json({
          status: 200,
          message: "Product removed from cart successfully",
          data: cart,
        });
      }
    } else {
      return res.status(404).json({
        status: 404,
        message: "Product not found in the cart",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//   exports.getAllCartById = async (req, res) => {
//     const id_pengguna = req.user._id; // Extracted from the token by the authenticate middleware

//     try {
//         const carts = await Cart.find({ id_pengguna }).populate('id_product');

//         if (!carts || carts.length === 0) {
//             return res.status(404).json({
//                 status: 404,
//                 message: "No carts found for this user"
//             });
//         }

//         res.status(200).json({
//             status: 200,
//             message: "Carts retrieved successfully",
//             data: carts
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             message: "Internal server error",
//             error: error.message
//         });
//     }
// };

exports.getAllCart = async (req, res) => {
  let id_pengguna = req.user._id;
  try {
    const carts = await Cart.find({ id_pengguna: id_pengguna }).select(
      "_id id_pengguna products"
    );

    if (!carts || carts.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No carts found for this user",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Carts retrieved successfully",
      data: carts,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateStatusCart = async (req, res) => {
  const { _id } = req.params;
  const { id_product, isActive } = req.body;

  try {
    const cart = await Cart.findOne({ _id });

    if (!cart) {
      return res.status(404).json({
        status: 404,
        message: "Cart not found",
      });
    }
    // Find the product in the cart's products array
    const productIndex = cart.products.findIndex(
      (product) => product.id_product.toString() === id_product
    );

    if (productIndex !== -1) {
      // Update the isActive status of the found product
      cart.products[productIndex].isActive = isActive;

      await cart.save();

      // Respond with a success message and the updated cart data
      return res.status(200).json({
        status: 200,
        message: "Product status updated successfully",
        data: cart,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "Product not found in the cart",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};