import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
});

// Connection handlers
export const connectSocket = (token) => {
  if (!socket.connected) {
    socket.auth = { token };
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Chat event handlers
export const joinChat = (chatId) => {
  socket.emit("join-chat", chatId);
};

export const leaveChat = (chatId) => {
  socket.emit("leave-chat", chatId);
};

export const sendMessage = (chatId, content) => {
  socket.emit("send-message", { chatId, content });
};

export const sendTypingIndicator = (chatId, isTyping) => {
  socket.emit("typing", { chatId, isTyping });
};

export const sendMessageRead = (chatId) => {
  socket.emit("message-read", { chatId });
};

// Listeners
export const onNewMessage = (callback) => {
  socket.on("new-message", callback);
};

export const onUserTyping = (callback) => {
  socket.on("user-typing", callback);
};

export const onMessageRead = (callback) => {
  socket.on("message-read", callback);
};

export const onNewNotification = (callback) => {
  socket.on("new-notification", callback);
};

export const removeListeners = () => {
  socket.off("new-message");
  socket.off("user-typing");
  socket.off("message-read");
  socket.off("new-notification");
};