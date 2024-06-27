const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    id_product: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
    jumlah_product_cart: { type: Number, required: true },
    isActive: { type: String, default: true },
    status_final: { type: String, default: false, required: true}
}, {_id: false });

const cartSchema = new Schema({
    id_pengguna: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    products: [productSchema],
});

const collectionName = 'Cart';
const Cart = mongoose.model('Cart', cartSchema, collectionName);
module.exports = Cart;
