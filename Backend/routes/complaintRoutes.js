import express from "express";
import {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
} from "../controllers/complaintController.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, createComplaint);
router.get("/mine", authenticate, getMyComplaints);
router.get("/all", authenticate, getAllComplaints);
router.patch("/:id/status", authenticate, updateComplaintStatus);

export default router;