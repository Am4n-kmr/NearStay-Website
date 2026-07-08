import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getBookingPayments,
  getMyPayments,
  processRefund,
  getAllPayments,
} from "../controllers/paymentController.js";
import authenticate from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Create payment order
router.post("/create-order", authenticate, createPaymentOrder);

// Verify payment
router.post("/verify", authenticate, verifyPayment);

// Get payments for a booking
router.get("/booking/:bookingId", authenticate, getBookingPayments);

// Get my payment history
router.get("/my-payments", authenticate, getMyPayments);

// Process refund (owner or admin)
router.patch("/:paymentId/refund", authenticate, authorizeRoles("owner", "admin"), processRefund);

// Get all payments (admin only)
router.get("/all", authenticate, authorizeRoles("admin"), getAllPayments);

export default router;