import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { 
  getMyChatsApi, 
  getChatMessagesApi, 
  setSelectedChat,
  appendNewMessage
 } from "../redux/slice/chat.slice";
import { getSocket } from "../socket/socket";

function formatChatTimestamp(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  const now = new Date();

  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  // Just now
  if (diffSeconds < 60) {
    return "Just now";
  }

  // 1 min, 2 mins...
  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes > 1 ? "s" : ""}`;
  }

  // Today → show time like 11:00 AM
  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Yesterday → show date like 09 May
  if (isYesterday) {
    return date.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
    });
  }

  // Older → show date like 09 May
  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
}

export default function ChatPage() {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  const {
    chats,
    selectedChat,
    chatsLoading,
  } = useSelector((state) => state.chat);

  const { user } = useSelector((state) => state.auth);

  const [input, setInput] = useState("");
  const { messages, messagesLoading,  } = useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(getMyChatsApi());
  }, [dispatch]);

  useEffect(() => {
    if (selectedChat?.id) {
      dispatch(getChatMessagesApi(selectedChat.id));
    }
  }, [dispatch, selectedChat?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChat, messages]);

  useEffect(() => {
    const socket = getSocket();

    if (
      socket &&
      selectedChat?.id
    ) {
      socket.emit("chat:join", {
        chatId: selectedChat.id,
        user: {
          id: user?.id
        },
      });

      console.log(
        "Joined room:",
        selectedChat.id
      );
    }
  }, [selectedChat?.id]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    const handleNewMessage = (data) => {
      console.log(
        "New message received:",
        data
      );

      dispatch(appendNewMessage(data));
    };

    console.log("Setting up socket listener [message:new] for new messages");
    socket.on(
      "message:new",
      handleNewMessage
    );
    socket.on("chat:error", (error) => {
      console.error("Chat error:", error);
    });

    return () => {
      socket.off(
        "message:new",
        handleNewMessage
      );
    };
  }, []);

  const activeMessages = useMemo(() => {
    if (!selectedChat?.id) return [];
    return messages[selectedChat.id] || [];
  }, [messages, selectedChat]);

  const handleSelectChat = (chat) => {
    dispatch(setSelectedChat(chat));
    // dispatch(getChatMessagesApi(chat.id));
  };

  const handleSend = () => {
    const text = input.trim();

    if (!text || !selectedChat?.id) return;
    const socket = getSocket();

    const payload = {
      chatId: selectedChat.id,
      message: text,
      user: {
        id: user?.id
      },
    };

    console.log("Emitting [message:send] with payload:", payload);
    socket.emit("message:send", payload);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  //   setInterval(() => {
  //   socket.emit("presence:heartbeat");
  // }, 20000);

  return (
    <div className="h-screen flex bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-[360px] bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={user?.profile || "https://i.pravatar.cc/150?img=15"}
              alt="profile"
              className="w-11 h-11 rounded-full object-cover"
            />

            <div>
              <h2 className="font-semibold text-gray-900">
                {user?.full_name || "User"}
              </h2>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Chats</h3>
            <button className="text-sm text-indigo-600 font-medium hover:underline">
              New Chat
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chatsLoading ? (
            <div className="p-5 text-sm text-gray-500">
              Loading chats...
            </div>
          ) : chats?.length === 0 ? (
            <div className="p-5 text-sm text-gray-500">
              No chats found
            </div>
          ) : (
            chats.map((chat) => {
              const isActive = selectedChat?.id === chat.id;

              return (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full px-4 py-4 flex items-center gap-3 text-left transition ${isActive ? "bg-indigo-50" : "hover:bg-gray-50"
                    }`}
                >
                  <img
                    src={chat.profile_picture}
                    alt={chat.name}
                    className="w-11 h-11 rounded-full object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">
                        {chat.name}
                      </p>

                      <span className="text-xs text-gray-500 ml-2">
                        {formatChatTimestamp(
                          chat.lastMessage?.created_at
                        )}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 truncate mt-1">
                      {chat.lastMessage?.message || "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <section className="flex-1 flex flex-col">
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-16 px-5 bg-white border-b border-gray-200 flex items-center gap-3">
              <img
                src={selectedChat.profile_picture}
                alt={selectedChat.name}
                className="w-10 h-10 rounded-full object-cover"
              />

              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedChat.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedChat.type === "GROUP"
                    ? "Group Chat"
                    : "Direct Message"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 bg-gray-50"
            >
              <div className="flex flex-col gap-3">
                {activeMessages.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center mt-10">
                    No messages yet
                  </p>
                ) : (
                  activeMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${msg.sender_id === user?.id
                          ? "self-end bg-black text-white rounded-br-sm"
                          : "self-start bg-white border text-gray-900 rounded-bl-sm"
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>

                      <p
                        className={`text-[10px] mt-1 ${msg.sender_id === user?.id
                            ? "text-gray-300"
                            : "text-gray-400"
                          }`}
                      >
                        {formatChatTimestamp(msg.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message"
                  className="flex-1 h-12 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10"
                />

                <button
                  onClick={handleSend}
                  className="h-12 px-6 rounded-full bg-black text-white font-medium hover:opacity-90 transition"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
