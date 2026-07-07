import express from "express";
import {
  getOrCreateChat,
  getMyChats,
  getChatMessages,
  sendMessage,
} from "../controllers/chatController.js";
import authenticate from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, getOrCreateChat);
router.get("/", authenticate, getMyChats);
router.get("/:chatId/messages", authenticate, getChatMessages);
router.post("/:chatId/messages", authenticate, sendMessage);

export default router;