import express from "express";
import { addReview, getPropertyReviews, deleteReview } from "../controllers/reviewController.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

// Public: get reviews for a property
router.get("/property/:propertyId", getPropertyReviews);

// Protected: add/update review
router.post("/property/:propertyId", authenticate, addReview);

// Protected: delete review
router.delete("/:id", authenticate, deleteReview);

export default router;