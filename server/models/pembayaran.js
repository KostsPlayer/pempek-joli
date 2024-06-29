const mongoose = require('mongoose');
const { Schema } = mongoose;

const pembayaranSchema = new Schema({
<<<<<<< HEAD
  id_pengguna: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  metode_pembayaran: { type: String, required: true },
  bukti_pembayaran: { type: String }, // Menggunakan sub-skema untuk bukti_pembayaran
  status_pembayaran: { type: String, required: true, default: "Pending" }
});
=======
    id_pengguna: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    metode_pembayaran: { type: String, required: true },
    bukti_pembayaran: { type: String },
    status_pembayaran: { type: String, required: true, default: "Pending" }
}, { timestamps: true });
>>>>>>> 0c44fbdb1dff562c883b76efa54fc2dc491daaf8

const collectionName = 'Pembayaran';
const Pembayaran = mongoose.model('Pembayaran', pembayaranSchema, collectionName);
module.exports = Pembayaran;
