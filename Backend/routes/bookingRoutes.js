import express from "express";
import {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getAllBookings,
} from "../controllers/bookingController.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

// Protected routes
router.post("/", authenticate, createBooking);
router.get("/mine", authenticate, getMyBookings);
router.get("/owner", authenticate, getOwnerBookings);
router.get("/all", authenticate, getAllBookings);
router.get("/:id", authenticate, getBookingById);
router.patch("/:id/status", authenticate, updateBookingStatus);
router.patch("/:id/cancel", authenticate, cancelBooking);

export default router;