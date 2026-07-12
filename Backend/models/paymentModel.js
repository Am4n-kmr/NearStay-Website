import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "stripe", "paypal", "upi", "google_pay", "phonepe", "paytm", "debit_card", "credit_card", "net_banking"],
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["advance", "full", "security_deposit", "monthly_rent"],
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    gatewayOrderId: {
      type: String,
      default: null,
      index: true,
    },
    transactionId: {
      type: String,
      default: null,
    },
    gateway: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },
    refundStatus: {
      type: String,
      enum: ["not_refunded", "processing", "refunded", "partial_refund"],
      default: "not_refunded",
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;