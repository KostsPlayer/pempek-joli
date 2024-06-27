const mongoose = require('mongoose');
const { Schema } = mongoose;

const metodePembayaranSchema = new Schema({
    nama_metode: { type: String, required: true },
    deskripsi_metode_pembayaran: { type: String, required: true }
});

const collectionName = 'MetodePembayaran';
const MetodePembayaran = mongoose.model('MetodePembayaran', metodePembayaranSchema, collectionName);
module.exports = MetodePembayaran;
