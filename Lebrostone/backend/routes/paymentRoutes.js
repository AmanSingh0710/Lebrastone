const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');

// URL: PUT /api/payments/update-payment/:orderId
router.put('/update-payment/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body; // Status: "Received" ya "Pending"

        // 1. Order ka Payment Status update karein
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId, 
            { paymentStatus: status }, 
            { returnDocument: "after" }
        ).populate('user');

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // 2. Agar payment Received hui hai, to Transaction collection mein record save karein
        if (status === "Received") {
            const newTransaction = new Transaction({
                orderId: updatedOrder._id,
                userId: updatedOrder.user._id,
                userName: updatedOrder.user.name,
                userEmail: updatedOrder.user.email,
                amountPaid: updatedOrder.finalTotal,
                products: updatedOrder.products, // Pure products ki copy
                status: "Received"
            });
            await newTransaction.save();
        } else {
            // Agar Admin ne galti se Received karke wapas Pending kiya, to transaction delete karein
            await Transaction.findOneAndDelete({ orderId: updatedOrder._id });
        }

        res.status(200).json({ success: true, message: "Payment status updated!" });
    } catch (error) {
        console.error("Payment Route Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET: Sabhi transactions dikhane ke liye (Payment.jsx ke liye)
router.get('/transactions/all', async (req, res) => {
    try {
        const data = await Transaction.find().sort({ transactionDate: -1 });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;