const mongoose = require('mongoose');
const { Schema } = mongoose;

const transaksiSchema = new Schema({
    id_transaksi: { type: Number, required: true, unique: true },
    id_pembayaran: { type: Schema.Types.ObjectId, ref: 'Pembayaran', required: true },
    tanggal_transaksi: { type: Date.now, required: true },
    total_bayar: { type: Number, required: true }
});

const collectionName = 'Transaksi';
const Transaksi = mongoose.model('Transaksi', transaksiSchema, collectionName);
module.exports = Transaksi;
