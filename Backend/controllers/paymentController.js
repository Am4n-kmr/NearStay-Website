import Payment from "../models/paymentModel.js";
import Booking from "../models/bookingModel.js";
import Property from "../models/propertyModel.js";
import Notification from "../models/notificationModel.js";
import crypto from "crypto";
import getRazorpay from "../lib/razorpayClient.js";

async function findPaymentByRazorpayOrder(razorpay_order_id) {
  let payment = await Payment.findOne({ gatewayOrderId: razorpay_order_id });
  if (payment) return payment;

  payment = await Payment.findOne({ "metadata.gatewayOrderId": razorpay_order_id });
  if (payment) return payment;

  const razorpay = getRazorpay();
  if (!razorpay) return null;

  try {
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const bookingId = order?.notes?.bookingId;
    if (!bookingId) return null;

    return Payment.findOne({ booking: bookingId, status: "pending" }).sort({ createdAt: -1 });
  } catch {
    return null;
  }
}

async function markPaymentCompleted(payment, razorpay_payment_id) {
  payment.status = "completed";
  payment.transactionId = razorpay_payment_id;
  payment.paidAt = new Date();

  const booking = await Booking.findById(payment.booking);
  if (booking) {
    if (payment.paymentType === "full") {
      booking.paymentStatus = "paid";
    } else if (payment.paymentType === "advance" || payment.paymentType === "security_deposit") {
      booking.paymentStatus = "partial";
    }
    await booking.save();

    const notification = new Notification({
      user: booking.owner,
      title: "Payment Received",
      message: `Payment of ₹${payment.amount} received for booking.`,
      type: "payment",
      link: `/dashboard/owner/bookings/${booking._id}`,
    });
    await notification.save();
  }

  await payment.save();
  return payment;
}

// Create payment order
export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId, paymentMethod, paymentType, amount } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Verify user is authorized
    if (booking.tenant.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ message: "Booking is already paid" });
    }

    const expectedAmount = booking.totalAmount;
    if (Math.round(amount) !== Math.round(expectedAmount)) {
      return res.status(400).json({ message: "Payment amount does not match booking total" });
    }

    // Generate unique payment ID
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payment = new Payment({
      booking: bookingId,
      user: req.user.userId,
      property: booking.property,
      amount,
      paymentMethod,
      paymentType,
      paymentId,
      gateway: paymentMethod,
      status: "pending",
    });

    const saved = await payment.save();

    // Create Razorpay order
    const razorpay = getRazorpay();

    if (!razorpay) {
      // If keys not provided, return mock response to avoid crashing in dev
      return res.status(201).json({
        payment: saved,
        order: { id: paymentId },
        amount: amount * 100,
        currency: "INR",
        key: null,
      });
    }

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: paymentId,
      notes: { bookingId: bookingId.toString() },
    };

    const order = await razorpay.orders.create(options);

    saved.gatewayOrderId = order.id;
    saved.metadata.set("gatewayOrderId", order.id);
    saved.markModified("metadata");
    await saved.save();

    res.status(201).json({
      payment: saved,
      order,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("createPaymentOrder error:", error);
    res.status(500).json({ message: "Server error creating payment order" });
  }
};

// Verify payment (webhook/callback)
export const verifyPayment = async (req, res) => {
  try {
    // Expecting Razorpay callback payload: razorpay_payment_id, razorpay_order_id, razorpay_signature
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
      // verify signature
      const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (generated_signature !== razorpay_signature) {
        return res.status(400).json({ message: "Invalid signature" });
      }

      const payment = await findPaymentByRazorpayOrder(razorpay_order_id);
      if (!payment) return res.status(404).json({ message: "Payment not found" });

      if (payment.status === "completed") {
        return res.json(payment);
      }

      const updated = await markPaymentCompleted(payment, razorpay_payment_id);
      return res.json(updated);
    }

    // Fallback to legacy verify payload
    const { paymentId, transactionId, status } = req.body;
    const payment = await Payment.findOne({ paymentId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.status = status === "success" ? "completed" : "failed";
    payment.transactionId = transactionId;
    payment.paidAt = new Date();

    if (status === "success") {
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        if (payment.paymentType === "full") {
          booking.paymentStatus = "paid";
        } else if (payment.paymentType === "advance" || payment.paymentType === "security_deposit") {
          booking.paymentStatus = "partial";
        }
        await booking.save();
      }

      const notification = new Notification({
        user: booking?.owner,
        title: "Payment Received",
        message: `Payment of ₹${payment.amount} received for booking.`,
        type: "payment",
        link: `/dashboard/owner/bookings/${booking?._id}`,
      });
      await notification.save();
    }

    await payment.save();
    res.json(payment);
  } catch (error) {
    console.error("verifyPayment error:", error);
    res.status(500).json({ message: "Server error verifying payment" });
  }
};

// Reconcile a booking payment with Razorpay (for payments that succeeded but weren't verified)
export const reconcileBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (
      booking.tenant.toString() !== req.user.userId &&
      booking.owner.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.paymentStatus === "paid") {
      return res.json({ message: "Already paid", booking });
    }

    const payment = await Payment.findOne({ booking: bookingId, status: "pending" }).sort({ createdAt: -1 });
    if (!payment) {
      return res.status(404).json({ message: "No pending payment found for this booking" });
    }

    const orderId =
      payment.gatewayOrderId ||
      (typeof payment.metadata?.get === "function"
        ? payment.metadata.get("gatewayOrderId")
        : payment.metadata?.gatewayOrderId);
    if (!orderId) {
      return res.status(404).json({ message: "No Razorpay order linked to this payment" });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({ message: "Razorpay is not configured" });
    }

    const orderPayments = await razorpay.orders.fetchPayments(orderId);
    const captured = orderPayments?.items?.find((p) => p.status === "captured");

    if (!captured) {
      return res.status(404).json({ message: "No completed Razorpay payment found for this order" });
    }

    payment.gatewayOrderId = orderId;
    const updated = await markPaymentCompleted(payment, captured.id);
    const refreshedBooking = await Booking.findById(bookingId);

    res.json({ message: "Payment reconciled", payment: updated, booking: refreshedBooking });
  } catch (error) {
    console.error("reconcileBookingPayment error:", error);
    res.status(500).json({ message: "Server error reconciling payment" });
  }
};

// Get payment history for a booking
export const getBookingPayments = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const payments = await Payment.find({ booking: bookingId })
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error("getBookingPayments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get my payment history
export const getMyPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const total = await Payment.countDocuments({ user: req.user.userId });
    const payments = await Payment.find({ user: req.user.userId })
      .populate("property", "title address")
      .populate("booking", "moveInDate status")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      payments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("getMyPayments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Process refund
export const processRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { refundAmount, reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (payment.status !== "completed") {
      return res.status(400).json({ message: "Cannot refund unpaid payment" });
    }

    if (refundAmount > payment.amount) {
      return res.status(400).json({ message: "Refund amount exceeds payment amount" });
    }

    payment.refundStatus = refundAmount === payment.amount ? "refunded" : "partial_refund";
    payment.refundAmount = refundAmount;
    payment.metadata.set("refundReason", reason);
    payment.metadata.set("refundedAt", new Date().toISOString());

    if (refundAmount === payment.amount) {
      payment.status = "refunded";
    } else {
      payment.status = "partially_refunded";
    }

    await payment.save();

    // Notify user
    const notification = new Notification({
      user: payment.user,
      title: "Refund Processed",
      message: `Refund of ₹${refundAmount} has been processed for your payment.`,
      type: "payment",
    });
    await notification.save();

    res.json(payment);
  } catch (error) {
    console.error("processRefund error:", error);
    res.status(500).json({ message: "Server error processing refund" });
  }
};

// Get all payments (admin)
export const getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate("user", "fullName email")
      .populate("property", "title")
      .populate("booking", "moveInDate status")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      payments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("getAllPayments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Dev-only: create a Razorpay order without DB writes (for quick testing)
export const createDevOrder = async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Not allowed in production" });
    }

    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(200).json({
        order: { id: `DEV_${Date.now()}` },
        amount: Math.round(amount * 100),
        currency: "INR",
        key: null,
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `dev_receipt_${Date.now()}`,
    });

    res.json({ order, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("createDevOrder error:", error);
    res.status(500).json({ message: "Server error creating dev order" });
  }
};