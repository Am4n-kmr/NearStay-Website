import { Router } from "express";
import { aiSearch } from "../controllers/aiController.js";

const router = Router();

// POST /api/ai/search - AI-powered property search
router.post("/search", aiSearch);

export default router;