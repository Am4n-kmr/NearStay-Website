import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  toggleBlockUser,
  changeUserRole,
  getPendingProperties,
  getAllProperties,
  moderateProperty,
} from "../controllers/adminController.js";
import authenticate, { authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorizeRoles("admin"));

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/block", toggleBlockUser);
router.patch("/users/:id/role", changeUserRole);
router.get("/properties/pending", getPendingProperties);
router.get("/properties", getAllProperties);
router.patch("/properties/:id/moderate", moderateProperty);

export default router;