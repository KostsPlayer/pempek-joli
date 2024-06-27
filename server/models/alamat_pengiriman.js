const mongoose = require('mongoose');
const { Schema } = mongoose;


const alamatPengirimanSchema = new Schema({
    id_pengguna: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    address: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    description: { type: String, required: true },
    postal_code: { type: Number, required: true },
    lastUpdated: { type: Date, default: Date.now } // Timestamp for the last update
});

const collectionName = 'AlamatPengiriman';
const AlamatPengiriman = mongoose.model('AlamatPengiriman', alamatPengirimanSchema, collectionName);
module.exports = AlamatPengiriman;
