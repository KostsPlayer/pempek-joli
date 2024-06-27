const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment');

const userSchema = new Schema({
    fullName: { type: String, required: true },
    nickname: { type: String },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, unique: false },
    password: { type: String, required: true },
    isActive: { type: String, default: true },
    role: { type: String, default: 'user' }
}, { timestamps: true });


const User = mongoose.model('Users', userSchema);
module.exports = User;
