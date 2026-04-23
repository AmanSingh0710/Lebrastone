const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: String,
    userEmail: String,
    amountPaid: { type: Number, required: true },
    paymentMethod: { type: String, default: "COD" },
    status: { type: String, default: "Received" },
    products: Array, 
    transactionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);