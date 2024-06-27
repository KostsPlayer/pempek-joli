const mongoose = require('mongoose');
const { Schema } = mongoose;

const detailPesananSchema = new Schema({
    id_product: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
    id_pesanan: { type: Schema.Types.ObjectId, ref: 'Pesanan', required: true },
    jumlah: { type: Number, required: true },
    total_harga: { type: Number, required: true },
});

const collectionName = 'DetailPesanan';
const DetailPesanan = mongoose.model('DetailPesanan', detailPesananSchema, collectionName);
module.exports = DetailPesanan;
