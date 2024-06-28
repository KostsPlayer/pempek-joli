const mongoose = require('mongoose');
const { Schema } = mongoose;

const pembayaranSchema = new Schema({
    id_pengguna: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    metode_pembayaran: { type: String, required: true },
    bukti_pembayaran: { type: String },
    status_pembayaran: { type: String, required: true, default: "Pending" }
}, { timestamps: true });

const collectionName = 'Pembayaran';
const Pembayaran = mongoose.model('Pembayaran', pembayaranSchema, collectionName);
module.exports = Pembayaran;
