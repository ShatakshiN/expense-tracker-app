const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    paymentId: String,
    orderId: String,
    status: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Order', orderSchema);
