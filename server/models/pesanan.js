const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the schema for the detail of each order item
const detailPesananSchema = new Schema({
  id_product: { type: Schema.Types.ObjectId, required: true, ref: "Menu" },
  Jumlah: { type: Number, required: true },
  total_harga: { type: Number, required: true, min: 0 },
});

// Define the main order schema
const pesananSchema = new Schema({
  id_MetodePembayaran: {
    type: Schema.Types.ObjectId,
    ref: "MetodePembayaran",
    required: true,
  },
  id_alamat_pengiriman: {
    type: Schema.Types.ObjectId,
    ref: "AlamatPengiriman",
  },
  id_pembayaran: {
    type: Schema.Types.ObjectId,
    ref: "Pembayaran",
    required: true,
  },
  id_pengguna: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  metode_pengambilan: { type: String },
  duration: {
    days: { type: Number, min: 0, default: 0 },
    hours: { type: Number, min: 0, max: 23, default: 0 },
    minutes: { type: Number, min: 0, max: 59, default: 0 },
  },
  detail_pesanan: [detailPesananSchema], // Embed the detail schema
  total_harga: { type: Number, required: true, min: 0 },
  tanggal_pesanan: { type: Date, default: Date.now, required: true },
  status_pesanan: {
    type: String,
    required: true,
    enum: ["Pending", "Completed", "Cancelled"],
  }, // Example statuses
  isActive: { type: Boolean, default: true },
});

// Define and export the Pesanan model
const collectionName = "Pesanan";
const Pesanan = mongoose.model("Pesanan", pesananSchema, collectionName);
module.exports = Pesanan;
