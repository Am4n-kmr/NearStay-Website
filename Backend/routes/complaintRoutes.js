import express from "express";
import {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  replyToComplaint,
} from "../controllers/complaintController.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, createComplaint);
router.get("/mine", authenticate, getMyComplaints);
router.get("/all", authenticate, getAllComplaints);
router.patch("/:id/status", authenticate, updateComplaintStatus);
router.patch("/:id/reply", authenticate, replyToComplaint);

export default router;
