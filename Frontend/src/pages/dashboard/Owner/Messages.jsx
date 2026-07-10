import { useState, useEffect, useRef } from "react";
import { Search, Send, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Skeleton } from "../../../components/ui/skeleton";
import DashboardLayout from "../../../components/DashboardLayout";
import { chatApi } from "../../../lib/api";
import { useToast } from "../../../hooks/use-toast";
import { connectSocket, disconnectSocket, joinChat, leaveChat, sendMessage, sendTypingIndicator, onNewMessage, onUserTyping, removeListeners } from "../../../lib/socket";

export default function OwnerMessages() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      connectSocket(token);
    }
    fetchChats();

    return () => {
      disconnectSocket();
      removeListeners();
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      joinChat(selectedChat._id);
      fetchMessages(selectedChat._id);

      onNewMessage((message) => {
        if (message.chat === selectedChat._id) {
          setMessages((prev) => [...prev, message]);
        }
      });

      onUserTyping((data) => {
        if (data.chatId === selectedChat._id && data.userId !== user._id) {
          setIsTyping(data.isTyping);
        }
      });
    }

    return () => {
      if (selectedChat) {
        leaveChat(selectedChat._id);
      }
    };
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

    sendMessage(selectedChat._id, newMessage);
    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now().toString(),
        chat: selectedChat._id,
        sender: { _id: user._id, fullName: user.fullName, profileImage: "" },
        content: newMessage,
        isRead: false,
        createdAt: new Date(),
      },
    ]);
    setNewMessage("");
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (selectedChat) {
      sendTypingIndicator(selectedChat._id, true);
    }
  };

  const filteredChats = chats.filter((chat) => {
    const otherUser = chat.participants.find((p) => p._id !== user._id);
    return otherUser?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getOtherUser = (chat) => {
    return chat.participants.find((p) => p._id !== user._id) || {};
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <DashboardLayout title="Messages">
      <div className="h-[calc(100vh-8rem)] flex bg-card border border-border rounded-xl overflow-hidden">
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
                          <span className="text-xs text-muted-foreground">
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
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMe = msg.sender._id === user._id;
                  return (
                    <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isMe ? "bg-primary text-white" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? "text-white/70" : "text-muted-foreground"}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <p className="text-xs text-muted-foreground">Typing...</p>
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
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
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
                  Select a conversation from the list to start chatting with students
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}