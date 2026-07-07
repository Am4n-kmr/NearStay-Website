import express from "express";
import {
  createVisitRequest,
  getMyVisitRequests,
  getOwnerVisitRequests,
  updateVisitRequestStatus,
  cancelVisitRequest,
} from "../controllers/visitRequestController.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, createVisitRequest);
router.get("/mine", authenticate, getMyVisitRequests);
router.get("/owner", authenticate, getOwnerVisitRequests);
router.patch("/:id/status", authenticate, updateVisitRequestStatus);
router.patch("/:id/cancel", authenticate, cancelVisitRequest);

export default router;