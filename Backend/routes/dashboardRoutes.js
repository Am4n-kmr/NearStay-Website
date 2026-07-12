import express from "express";
import {
  getStudentDashboard,
  getOwnerDashboard,
  getAdminDashboard,
} from "../controllers/dashboardController.js";
import authenticate, { authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/student", authenticate, authorizeRoles("student", "tenant"), getStudentDashboard);
router.get("/owner", authenticate, authorizeRoles("owner"), getOwnerDashboard);
router.get("/admin", authenticate, authorizeRoles("admin"), getAdminDashboard);

export default router;