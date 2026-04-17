// Realistic Chat UI — Dark theme matching Finx aesthetic
// Only UI/styling changes — all logic, hooks, and data calls are unchanged

import { useEffect, useMemo, useRef, useState } from "react";
import { io as socketIOClient } from "socket.io-client";
import { MainLayout } from "../components/layout/MainLayout";
import { useAuth } from "../contexts/AuthContext";
import { useFinance } from "../contexts/FinanceContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Send,
  Search,
  ArrowLeft,
  Phone,
  MoreVertical,
  Paperclip,
  MessageSquare,
  Trash2,
} from "lucide-react";

type ChatUser = {
  _id: string;
  name: string;
  profilePicture?: string;
  email?: string;
};

type Conversation = {
  userId: string;
  name: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

type MessageItem = {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
};

function getInitials(name?: string) {
  if (!name) return "?";

  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "#7c3aed", // violet-600
  "#06b6d4", // cyan-500
  "#8b5cf6", // violet-500
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ec4899", // pink-500
  "#6366f1", // indigo-500
];

function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function Avatar({ user, size = 40 }: { user: ChatUser; size?: number }) {
  const name = user?.name || "Unknown";

  if (user.profilePicture) {
    return (
      <img
        src={user.profilePicture}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0 ring-2 ring-slate-700/60"
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        background: avatarColor(user._id || "x"),
        fontSize: size * 0.35,
      }}
      className="rounded-full flex items-center justify-center flex-shrink-0 font-medium text-white select-none ring-2 ring-slate-700/60"
    >
      {getInitials(name)}
    </div>
  );
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatConvTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000 && d.getDate() === now.getDate())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 172800000) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short" });
}

export function Chat() {
  const { user, token } = useAuth();
  const {
    getChatUsers,
    getChatConversations,
    getChatMessages,
    sendMessage,
    deleteMessage,
    clearConversation,
  } = useFinance();

  const [newMessage, setNewMessage] = useState("");
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<any | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const loadChatData = async () => {
    const [users, convs] = await Promise.all([
      getChatUsers(),
      getChatConversations(),
    ]);
    setChatUsers(users);
    setConversations(convs);
    if (!activeChat) {
      const firstConversation = convs[0];
      const initialUser =
        users.find((u) => u._id === firstConversation?.userId) ||
        users[0] ||
        null;
      setActiveChat(initialUser);
    }
  };

  const loadMessages = async (userId: string) => {
    const fetched = await getChatMessages(userId);
    setMessages(fetched || []);
  };

  useEffect(() => {
    loadChatData().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!user) return;
    const SOCKET_URL =
      (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";
    const socket = socketIOClient(SOCKET_URL, {
      withCredentials: true,
      auth: { token },
    });
    socketRef.current = socket;
    socket.on("newMessage", (message: MessageItem) => {
      if (
        activeChat &&
        (message.senderId === activeChat._id ||
          message.receiverId === activeChat._id)
      ) {
        loadMessages(activeChat._id).catch(() => undefined);
      }
      loadChatData().catch(() => undefined);
    });
    return () => {
      try {
        socket.disconnect();
      } catch {}
      socketRef.current = null;
    };
  }, [user, activeChat?._id]);

  useEffect(() => {
    if (!activeChat) return;
    loadMessages(activeChat._id).catch(() => undefined);
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const conversationMap = useMemo(
    () => new Map(conversations.map((c) => [c.userId, c])),
    [conversations],
  );

  const filteredChatUsers = useMemo(() => {
    const norm = (searchTerm || "").toLowerCase();

    return chatUsers
      .filter((u) => {
        const name = (u.name || "").toLowerCase();
        const email = (u.email || "").toLowerCase();

        return name.includes(norm) || email.includes(norm);
      })
      .sort((a, b) => {
        const ac = conversationMap.get(a._id);
        const bc = conversationMap.get(b._id);

        if (ac && bc) {
          return (
            new Date(bc.lastMessageAt).getTime() -
            new Date(ac.lastMessageAt).getTime()
          );
        }

        if (ac) return -1;
        if (bc) return 1;

        return (a.name || "").localeCompare(b.name || "");
      });
  }, [chatUsers, conversationMap, searchTerm]);

  const handleSelectChat = (userItem: ChatUser) => {
    setActiveChat(userItem);
    setShowChat(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || !newMessage.trim()) return;
    await sendMessage({
      receiverId: activeChat._id,
      content: newMessage.trim(),
    });
    setNewMessage("");
    await Promise.all([loadMessages(activeChat._id), loadChatData()]);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!activeChat) return;
    await deleteMessage(messageId);
    await loadMessages(activeChat._id);
  };

  const handleClearConversation = async () => {
    if (!activeChat) return;
    await clearConversation(activeChat._id);
    setMessages([]);
    await loadChatData();
  };

  // Group messages by date for date dividers
  const groupedMessages = useMemo(() => {
    const groups: { date: string; items: MessageItem[] }[] = [];
    messages.forEach((msg) => {
      const d = new Date(msg.createdAt).toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      const last = groups[groups.length - 1];
      if (last && last.date === d) {
        last.items.push(msg);
      } else {
        groups.push({ date: d, items: [msg] });
      }
    });
    return groups;
  }, [messages]);

  return (
    <MainLayout>
      {/*
       * Outer shell — fills the available viewport height
       * On mobile: full height, no rounding (edge-to-edge)
       * On desktop: card with rounded corners and a border
       */}
      <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] flex">
        <div className="flex flex-1 overflow-hidden rounded-xl md:rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-xl shadow-2xl">
          {/* ─────────────────────── SIDEBAR ─────────────────────── */}
          <aside
            className={`
              flex-col border-r border-slate-700/60
              w-full md:w-[300px] lg:w-[320px] flex-shrink-0
              bg-slate-900/70 backdrop-blur-xl
              ${showChat ? "hidden md:flex" : "flex"}
            `}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-slate-700/60">
              <h1 className="text-[17px] font-semibold bg-gradient-to-r from-violet-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent mb-3">
                Messages
              </h1>
              {/* Search */}
              <label
                className="
    group flex items-center gap-2
    bg-[#0F172A]
    border border-[#2E3A59]
    rounded-lg px-3 py-2
    cursor-text

    transition-all duration-200 ease-out

    hover:border-[#6366F1]
    focus-within:border-[#7C3AED]
    focus-within:ring-2 focus-within:ring-[#7C3AED]/25
  "
              >
                <Search
                  className="
      w-[14px] h-[14px]
      text-[#6B7280]
      flex-shrink-0
      transition-colors duration-200

      group-focus-within:text-[#7C3AED]
    "
                />

                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  type="text"
                  placeholder="Search"
                  className="
      w-full bg-transparent border-none outline-none
      text-[13px] font-medium
      text-[#F1F5F9]
      placeholder-[#6B7280]
    "
                />
              </label>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-slate-700/60">
              {filteredChatUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-slate-500 gap-2">
                  <MessageSquare className="w-10 h-10 opacity-30" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                filteredChatUsers.map((userItem) => {
                  const conv = conversationMap.get(userItem._id);
                  const isActive = activeChat?._id === userItem._id;
                  const hasUnread = (conv?.unreadCount ?? 0) > 0;

                  return (
                    <button
                      key={userItem._id}
                      onClick={() => handleSelectChat(userItem)}
                      className={`
                        w-full text-left flex items-center gap-3 px-4 py-3
                        transition-colors duration-100 cursor-pointer
                        ${
                          isActive
                            ? "bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border-l-2 border-violet-500"
                            : "hover:bg-slate-800/50"
                        }
                      `}
                    >
                      <Avatar user={userItem} size={42} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[14px] font-medium truncate ${
                              isActive ? "text-violet-200" : "text-slate-100"
                            }`}
                          >
                            {userItem.name}
                          </span>
                          {conv?.lastMessageAt && (
                            <span
                              className={`text-[11px] flex-shrink-0 ${
                                isActive ? "text-violet-300" : "text-slate-400"
                              }`}
                            >
                              {formatConvTime(conv.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <span
                            className={`text-[12.5px] truncate ${
                              hasUnread
                                ? "text-slate-200 font-medium"
                                : "text-slate-400"
                            }`}
                          >
                            {conv?.lastMessage ?? "Start a conversation"}
                          </span>
                          {hasUnread && (
                            <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-[11px] font-medium flex items-center justify-center px-1 shadow-lg shadow-violet-500/30">
                              {conv!.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* ─────────────────────── MAIN PANEL ─────────────────────── */}
          <main
            className={`
              flex-1 flex flex-col min-w-0
              bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
              ${showChat ? "flex" : "hidden md:flex"}
            `}
          >
            {activeChat ? (
              <>
                {/* ── Chat Header ── */}
                <header className="flex items-center gap-3 px-4 py-3 bg-slate-900/70 backdrop-blur-xl border-b border-slate-700/60 flex-shrink-0">
                  {/* Back button — mobile only */}
                  <button
                    onClick={() => setShowChat(false)}
                    className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-400 hover:bg-slate-800/50 transition-colors"
                    aria-label="Back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <Avatar user={activeChat} size={36} />

                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-slate-100 truncate">
                      {activeChat.name}
                    </p>
                    <p className="text-[11.5px] text-cyan-400 font-medium">
                      Online
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors"
                      aria-label="Voice call"
                    >
                      <Phone className="w-[17px] h-[17px]" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors"
                          aria-label="More options"
                        >
                          <MoreVertical className="w-[17px] h-[17px]" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-slate-800 border-slate-700"
                      >
                        <DropdownMenuItem
                          onClick={handleClearConversation}
                          className="text-red-400 hover:bg-slate-700 focus:bg-slate-700"
                        >
                          Clear all chats
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </header>

                {/* ── Messages ── */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-1">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                      <MessageSquare className="w-14 h-14 opacity-20" />
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs text-slate-600">
                        Say hello to {activeChat.name}!
                      </p>
                    </div>
                  ) : (
                    groupedMessages.map((group) => (
                      <div key={group.date}>
                        {/* Date divider */}
                        <div className="flex items-center justify-center my-4">
                          <span className="text-[11px] text-slate-400 bg-slate-800/40 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-700/60">
                            {group.date}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {group.items.map((message, idx) => {
                            const isMe = message.senderId === user?._id;
                            const prevMsg = group.items[idx - 1];
                            const nextMsg = group.items[idx + 1];

                            // Consecutive message detection (same sender within 2 min)
                            const prevSameSender =
                              prevMsg?.senderId === message.senderId &&
                              new Date(message.createdAt).getTime() -
                                new Date(prevMsg.createdAt).getTime() <
                                120000;
                            const nextSameSender =
                              nextMsg?.senderId === message.senderId &&
                              new Date(nextMsg.createdAt).getTime() -
                                new Date(message.createdAt).getTime() <
                                120000;

                            const isLast = !nextSameSender;

                            // Bubble border-radius: flatten the corner toward the avatar side
                            // for consecutive messages from the same sender
                            const bubbleRadius = isMe
                              ? `rounded-2xl ${isLast ? "rounded-br-[4px]" : ""} ${prevSameSender ? "rounded-tr-[6px]" : ""}`
                              : `rounded-2xl ${isLast ? "rounded-bl-[4px]" : ""} ${prevSameSender ? "rounded-tl-[6px]" : ""}`;

                            return (
                              <div
                                key={message._id}
                                className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"} ${
                                  !prevSameSender && idx !== 0 ? "mt-3" : ""
                                }`}
                                onMouseEnter={() =>
                                  setHoveredMessageId(message._id)
                                }
                                onMouseLeave={() => setHoveredMessageId(null)}
                              >
                                {/* Avatar — only for received, only on last in a group */}
                                {!isMe && (
                                  <div className="w-[26px] flex-shrink-0 mb-0.5">
                                    {isLast ? (
                                      <Avatar user={activeChat} size={26} />
                                    ) : null}
                                  </div>
                                )}

                                <div
                                  className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[72%] md:max-w-[60%]`}
                                >
                                  <div className="relative group">
                                    <div
                                      className={`
                                        px-[13px] py-[8px] text-[13.5px] leading-[1.5]
                                        ${bubbleRadius}
                                        ${
                                          isMe
                                            ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/30"
                                            : "bg-slate-800/70 backdrop-blur-sm text-slate-100 border border-slate-700/60"
                                        }
                                      `}
                                    >
                                      {message.content}
                                    </div>

                                    {/* Delete button — only for sent messages on hover */}
                                    {isMe &&
                                      hoveredMessageId === message._id && (
                                        <button
                                          onClick={() =>
                                            handleDeleteMessage(message._id)
                                          }
                                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                          aria-label="Delete message"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                  </div>

                                  {/* Timestamp — only on last bubble in a group */}
                                  {isLast && (
                                    <div
                                      className={`flex items-center gap-1 mt-1 ${isMe ? "flex-row-reverse" : ""}`}
                                    >
                                      <span className="text-[10.5px] text-slate-400">
                                        {formatTime(message.createdAt)}
                                      </span>
                                      {isMe && (
                                        <span className="text-[10px] text-cyan-400">
                                          ✓✓
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* ── Message Input ── */}
                <div
                  className="flex-shrink-0 
  bg-[#0B1220] 
  border-t border-[#1F2A44] 
  px-3 py-3
"
                >
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2"
                  >
                    {/* Attach button */}
                    <button
                      type="button"
                      className="
        p-2 rounded-full flex-shrink-0
        text-[#6B7280]
        transition-all duration-200

        hover:bg-[#1F2A44]
        hover:text-[#F1F5F9]
      "
                      aria-label="Attach file"
                    >
                      <Paperclip className="w-[18px] h-[18px]" />
                    </button>

                    {/* Input */}
                    <div
                      className="
        flex-1 flex items-center
        bg-[#0F172A]
        border border-[#2E3A59]
        rounded-full px-4 py-2

        transition-all duration-200

        hover:border-[#6366F1]
        focus-within:border-[#7C3AED]
        focus-within:ring-2 focus-within:ring-[#7C3AED]/25
      "
                    >
                      <input
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Message..."
                        className="
          flex-1 bg-transparent border-none outline-none
          text-[13.5px] font-medium
          text-[#F1F5F9]
          placeholder-[#6B7280]
        "
                      />
                    </div>

                    {/* Send button */}
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      aria-label="Send message"
                      className={`
        w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
        transition-all duration-200

        ${
          newMessage.trim()
            ? `
              bg-[#7C3AED] 
              text-white
              hover:bg-[#6D28D9]
              active:scale-95
            `
            : `
              bg-[#111827]
              border border-[#2E3A59]
              text-[#6B7280]
              cursor-not-allowed
            `
        }
      `}
                    >
                      <Send className="w-[15px] h-[15px]" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* Empty state — no active chat */
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
                <div className="w-16 h-16 rounded-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-[15px] text-slate-300">
                  Select a conversation
                </p>
                <p className="text-[13px] text-slate-500">
                  Choose from the list to start messaging
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </MainLayout>
  );
}
