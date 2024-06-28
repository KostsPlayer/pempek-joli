const mongoose = require('mongoose');
const { Schema } = mongoose;

const pembayaranSchema = new Schema({
  id_pengguna: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  metode_pembayaran: { type: String, required: true },
  bukti_pembayaran: { type: String }, // Menggunakan sub-skema untuk bukti_pembayaran
  status_pembayaran: { type: String, required: true, default: "Pending" }
});

const collectionName = 'Pembayaran';
const Pembayaran = mongoose.model('Pembayaran', pembayaranSchema, collectionName);
module.exports = Pembayaran;
