import Payment from "../models/paymentModel.js";
import Booking from "../models/bookingModel.js";
import Property from "../models/propertyModel.js";
import Notification from "../models/notificationModel.js";

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

    // In production, here you would:
    // - Call Razorpay/Stripe/PayPal API to create order
    // - Return order details with gateway-specific data
    // For now, return mock order data
    res.status(201).json({
      payment: saved,
      orderId: paymentId,
      amount: amount * 100, // Convert to paise for Razorpay
      currency: "INR",
    });
  } catch (error) {
    console.error("createPaymentOrder error:", error);
    res.status(500).json({ message: "Server error creating payment order" });
  }
};

// Verify payment (webhook/callback)
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, transactionId, status } = req.body;

    const payment = await Payment.findOne({ paymentId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.status = status === "success" ? "completed" : "failed";
    payment.transactionId = transactionId;
    payment.paidAt = new Date();

    if (status === "success") {
      // Update booking payment status
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        if (payment.paymentType === "full") {
          booking.paymentStatus = "paid";
        } else if (payment.paymentType === "advance" || payment.paymentType === "security_deposit") {
          booking.paymentStatus = "partial";
        }
        await booking.save();
      }

      // Notify owner
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
    res.json(payment);
  } catch (error) {
    console.error("verifyPayment error:", error);
    res.status(500).json({ message: "Server error verifying payment" });
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