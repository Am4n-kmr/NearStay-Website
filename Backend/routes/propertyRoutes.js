import express from "express";
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getOwnerProperties,
  approveProperty,
} from "../controllers/propertyController.js";
import authenticate, { authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getProperties);
router.get("/:id", getPropertyById);

// Protected routes (owner)
router.post("/", authenticate, createProperty);
router.put("/:id", authenticate, updateProperty);
router.delete("/:id", authenticate, deleteProperty);
router.get("/owner/me", authenticate, getOwnerProperties);

// Admin only
router.patch("/:id/approve", authenticate, authorizeRoles("admin"), approveProperty);

export default router;