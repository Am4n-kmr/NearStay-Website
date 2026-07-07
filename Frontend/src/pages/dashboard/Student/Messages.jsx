import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Skeleton } from "../../../components/ui/skeleton";
import DashboardLayout from "../../../components/DashboardLayout";
import { cn } from "../../../lib/utils";

export default function StudentMessages() {
  const search = typeof window !== "undefined" ? window.location.search : "";
  const initialChatId = new URLSearchParams(search.replace(/^\?/, "")).get("chatId");
  const [selectedChatId, setSelectedChatId] = useState(initialChatId);
  const [msgText, setMsgText] = useState("");
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const chats = [];
  const messages = [];
  const chatsLoading = false;
  const messagesLoading = false;

  const chatList = chats ?? [];
  const msgList = messages ?? [];

  const selectedChat = chatList.find((c) => c.id === selectedChatId);
  const otherParticipant = selectedChat?.participants?.find((p) => p.id !== String(user?._id));

  const handleSend = async () => {
    if (!msgText.trim() || !selectedChatId) return;
    setMsgText("");
  };

  return (
    <DashboardLayout title="Messages">
      <div className="h-[calc(100vh-8rem)] flex border border-border rounded-xl overflow-hidden bg-card">
        {/* Sidebar */}
        <div className={cn("w-full md:w-72 border-r border-border flex flex-col", selectedChatId ? "hidden md:flex" : "flex")}>
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chatsLoading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 flex gap-3"><Skeleton className="h-10 w-10 rounded-full shrink-0" /><div className="flex-1 space-y-1.5"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-full" /></div></div>
            )) : chatList.length > 0 ? chatList.map((chat) => {
              const other = chat.participants?.find((p) => p.id !== String(user?._id));
              return (
                <button key={chat.id} onClick={() => setSelectedChatId(chat.id)}
                  className={cn("w-full p-4 flex gap-3 items-start hover:bg-muted transition-colors text-left", selectedChatId === chat.id ? "bg-muted" : "")}>
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={other?.avatar ?? undefined} />
                    <AvatarFallback>{other?.name?.charAt(0) ?? "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium truncate">{other?.name}</span>
                      {chat.unreadCount > 0 && <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 ml-1 shrink-0">{chat.unreadCount}</span>}
                    </div>
                    {chat.lastMessage && <p className="text-xs text-muted-foreground truncate mt-0.5">{chat.lastMessage}</p>}
                  </div>
                </button>
              );
            }) : (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat area */}
        {selectedChatId ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <button onClick={() => setSelectedChatId(null)} className="md:hidden mr-1"><ArrowLeft className="h-5 w-5" /></button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={otherParticipant?.avatar ?? undefined} />
                <AvatarFallback>{otherParticipant?.name?.charAt(0) ?? "U"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">{otherParticipant?.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{otherParticipant?.role}</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesLoading ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={cn("flex", i % 2 === 0 ? "" : "justify-end")}>
                  <Skeleton className="h-10 w-48 rounded-2xl" />
                </div>
              )) : msgList.length > 0 ? msgList.map((msg) => {
                const isMine = String(msg.sender?._id || msg.senderId) === String(user?._id);
                return (
                  <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "")}>
                    <div className={cn("max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm", isMine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm")}>
                      <p>{msg.content}</p>
                      <p className={cn("text-xs mt-1", isMine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No messages yet. Start a conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <Input value={msgText} onChange={(e) => setMsgText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..." className="flex-1" />
              <Button onClick={handleSend} size="icon" disabled={!msgText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground flex-col gap-2">
            <MessageSquare className="h-10 w-10 opacity-30" />
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}