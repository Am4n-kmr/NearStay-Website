import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} from "../controllers/wishlistController.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, getWishlist);
router.post("/", authenticate, addToWishlist);
router.delete("/:propertyId", authenticate, removeFromWishlist);
router.get("/check/:propertyId", authenticate, checkWishlist);

export default router;