import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

// Connect to database
connectDB();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO middleware for authentication
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const jwt = (await import("jsonwebtoken")).default;
    const User = (await import("./models/userModel.js")).default;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return next(new Error("User not found"));
    }
    
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.fullName} (${socket.user._id})`);

  // Join user to their personal room for notifications
  socket.join(`user:${socket.user._id}`);

  // Join chat room
  socket.on("join-chat", (chatId) => {
    socket.join(`chat:${chatId}`);
    console.log(`User ${socket.user._id} joined chat ${chatId}`);
  });

  // Leave chat room
  socket.on("leave-chat", (chatId) => {
    socket.leave(`chat:${chatId}`);
    console.log(`User ${socket.user._id} left chat ${chatId}`);
  });

  // Send message
  socket.on("send-message", async (data) => {
    try {
      const { chatId, content } = data;
      const Message = (await import("./models/chatModel.js")).Message;
      
      const message = new Message({
        chat: chatId,
        sender: socket.user._id,
        content,
      });

      const saved = await message.save();
      
      // Update chat's last message
      const Chat = (await import("./models/chatModel.js")).Chat;
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: content,
        lastMessageAt: new Date(),
      });

      // Populate sender info
      const populated = await saved.populate("sender", "fullName profileImage");

      // Emit to all users in the chat room
      io.to(`chat:${chatId}`).emit("new-message", populated);

      // Send notification to other participants
      const chat = await Chat.findById(chatId);
      if (chat) {
        const otherParticipants = chat.participants.filter(
          (p) => p.toString() !== socket.user._id.toString()
        );

        for (const participantId of otherParticipants) {
          const notification = new (await import("./models/notificationModel.js")).default({
            user: participantId,
            title: "New Message",
            message: `${socket.user.fullName} sent you a message`,
            type: "general",
            link: `/dashboard/${socket.user.role === "owner" ? "student" : "owner"}/messages`,
          });
          await notification.save();

          // Emit real-time notification
          io.to(`user:${participantId}`).emit("new-notification", notification);
        }
      }
    } catch (error) {
      console.error("Socket send-message error:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on("typing", (data) => {
    const { chatId, isTyping } = data;
    socket.to(`chat:${chatId}`).emit("user-typing", {
      userId: socket.user._id,
      isTyping,
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.fullName}`);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});