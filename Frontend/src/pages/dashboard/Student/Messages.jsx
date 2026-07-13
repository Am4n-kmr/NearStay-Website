import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Send, MessageCircle, ArrowLeft, Check, CheckCheck } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Skeleton } from "../../../components/ui/skeleton";
import DashboardLayout from "../../../components/DashboardLayout";
import { chatApi } from "../../../lib/api";
import { useToast } from "../../../hooks/use-toast";
import {
  connectSocket,
  disconnectSocket,
  joinChat,
  leaveChat,
  sendMessage,
  sendTypingIndicator,
  sendMessageRead,
  onMessageRead,
  removeListeners,
  socket,
} from "../../../lib/socket";

const TYPING_TIMEOUT = 2000;

export default function StudentMessages() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { toast } = useToast();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const selectedChatRef = useRef(selectedChat);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Fetch chats on mount and wire socket listeners
  useEffect(() => {
    if (token) {
      connectSocket(token);
    }

    const handleIncomingMessage = (message) => {
      const chatId = message.chat?._id || message.chat;
      const isCurrentUser = message.sender?._id === user._id;
      const isActiveChat = selectedChatRef.current?._id === chatId;

      setChats((prev) =>
        prev.map((chat) => {
          if (chat._id !== chatId) return chat;
          const unreadCount = isCurrentUser || isActiveChat ? 0 : (chat.unreadCount ?? 0) + 1;
          return {
            ...chat,
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            unreadCount,
          };
        })
      );

      if (isActiveChat) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    };

    const handleMessageRead = ({ chatId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender?._id === user._id ? { ...msg, isRead: true } : msg
        )
      );
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
        )
      );
    };

    const handleTyping = (data) => {
      if (data.chatId === selectedChatRef.current?._id && data.userId !== user._id) {
        setIsTyping(data.isTyping);
      }
    };

    socket.on("new-message", handleIncomingMessage);
    socket.on("message-read", handleMessageRead);
    socket.on("user-typing", handleTyping);

    fetchChats();

    return () => {
      socket.off("new-message", handleIncomingMessage);
      socket.off("message-read", handleMessageRead);
      socket.off("user-typing", handleTyping);
      disconnectSocket();
      removeListeners();
    };
  }, [token, user._id]);

  // Handle selected chat changes - join room, fetch messages, mark as read
  useEffect(() => {
    if (!selectedChat) return;

    const chatId = selectedChat._id;
    joinChat(chatId);

    const loadMessages = async () => {
      await fetchMessages(chatId);
      sendMessageRead(chatId);
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
        )
      );
    };

    loadMessages();

    return () => {
      leaveChat(chatId);
    };
  }, [selectedChat]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const fetchChats = async () => {
    try {
      const data = await chatApi.getMyChats();
      setChats(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chats",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const data = await chatApi.getMessages(chatId);
      setMessages(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const content = newMessage.trim();
    const now = new Date().toISOString();

    setChats((prev) =>
      prev.map((chat) =>
        chat._id === selectedChat._id
          ? { ...chat, lastMessage: content, lastMessageAt: now }
          : chat
      )
    );
    setSelectedChat((prev) =>
      prev && prev._id === selectedChat._id
        ? { ...prev, lastMessage: content, lastMessageAt: now }
        : prev
    );

    sendMessage(selectedChat._id, content);
    setNewMessage("");

    // Turn off typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    sendTypingIndicator(selectedChat._id, false);
  };

  const handleTyping = useCallback((e) => {
    setNewMessage(e.target.value);

    if (!selectedChat) return;

    // Send typing indicator
    sendTypingIndicator(selectedChat._id, true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after delay
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(selectedChat._id, false);
    }, TYPING_TIMEOUT);
  }, [selectedChat]);

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const filteredChats = chats.filter((chat) => {
    const otherUser = chat.participants.find((p) => p._id !== user._id);
    return otherUser?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getOtherUser = (chat) => {
    return chat.participants.find((p) => p._id !== user._id) || {};
  };

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const formatMessageTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <DashboardLayout title="Messages">
      <div className="h-[calc(100vh-8rem)] flex dashboard-card overflow-hidden">
        {/* Chat list */}
        <div className={`w-full md:w-80 border-r border-border flex flex-col ${selectedChat ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-lg mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChats.length > 0 ? (
              filteredChats.map((chat) => {
                const otherUser = getOtherUser(chat);
                return (
                  <div
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedChat?._id === chat._id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
                        {otherUser.fullName?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-sm truncate">{otherUser.fullName || "User"}</h3>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {chat.lastMessageAt && formatTime(chat.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.lastMessage || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat messages */}
        <div className={`flex-1 flex flex-col ${!selectedChat ? "hidden md:flex" : "flex"}`}>
          {selectedChat ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <button onClick={() => setSelectedChat(null)} className="md:hidden">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {getOtherUser(selectedChat).fullName?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{getOtherUser(selectedChat).fullName || "User"}</h3>
                  <p className="text-xs text-muted-foreground">
                    {getOtherUser(selectedChat).role === "owner" ? "Property Owner" : "Student"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((msg, idx) => {
                  const isMe = msg.sender._id === user._id;
                  const showReadStatus = isMe && idx === messages.length - 1;
                  return (
                    <div key={msg._id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isMe
                            ? "bg-emerald-500 text-white rounded-br-sm"
                            : "bg-gray-100 dark:bg-gray-800 rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${
                          isMe ? "text-white/70" : "text-gray-400"
                        }`}>
                          <span className="text-[10px] leading-none">{formatMessageTime(msg.createdAt)}</span>
                          {isMe && (
                            msg.isRead ? (
                              <CheckCheck className="h-3 w-3 text-blue-300" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full"
                  />
                  <Button type="submit" size="icon" className="rounded-full" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/40">
              <div className="text-center px-6 py-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-10 w-10 text-primary/60" />
                </div>
                <p className="font-semibold text-lg mb-2">Your Messages</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Select a conversation from the list to start chatting with property owners
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}