import { Chat, Message } from "../models/chatModel.js";

// Get or create a chat between users
export const getOrCreateChat = async (req, res) => {
  try {
    const { participantId, propertyId } = req.body;

    // Find existing chat with both participants
    let chat = await Chat.findOne({
      participants: { $all: [req.user.userId, participantId], $size: 2 },
      ...(propertyId ? { property: propertyId } : {}),
    });

    if (!chat) {
      chat = new Chat({
        participants: [req.user.userId, participantId],
        property: propertyId || null,
      });
      await chat.save();
    }

    res.json(chat);
  } catch (error) {
    console.error("getOrCreateChat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all chats for current user
export const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.userId,
    })
      .populate("participants", "fullName email profileImage role")
      .populate("property", "title images")
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    // Get unread counts
    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chat: chat._id,
          sender: { $ne: req.user.userId },
          isRead: false,
        });
        return { ...chat.toObject(), unreadCount };
      })
    );

    res.json(chatsWithUnread);
  } catch (error) {
    console.error("getMyChats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get messages for a specific chat
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (!chat.participants.includes(req.user.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Mark messages as read
    await Message.updateMany(
      { chat: chatId, sender: { $ne: req.user.userId }, isRead: false },
      { isRead: true }
    );

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "fullName profileImage")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("getChatMessages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (!chat.participants.includes(req.user.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const message = new Message({
      chat: chatId,
      sender: req.user.userId,
      content,
    });

    const saved = await message.save();

    // Update chat's last message
    chat.lastMessage = content;
    chat.lastMessageAt = new Date();
    await chat.save();

    const populated = await saved.populate("sender", "fullName profileImage");
    res.status(201).json(populated);
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: "Server error" });
  }
};