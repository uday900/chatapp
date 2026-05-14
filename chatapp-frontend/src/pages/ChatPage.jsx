import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  getMyChatsApi,
  getChatMessagesApi,
  setSelectedChat,
  appendNewMessage,
  markChatMessagesRead,
  resetUnreadCount,
  markMessagesRead
} from "../redux/slice/chat.slice";
import { getSocket } from "../socket/socket";
import { API_ENDPOINTS } from "../utils/endpoints";
import { formatLastSeen } from "../utils/date.util";
import { getProfileImage } from "../utils/constants";

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

function formatMessageDateLabel(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  const now = new Date();

  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return "Today";
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return "Yesterday";
  }

  const isSameYear =
    date.getFullYear() === now.getFullYear();

  if (isSameYear) {
    return date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
    });
  }

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ChatPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const {
    chats,
    selectedChat,
    chatsLoading,
  } = useSelector((state) => state.chat);

  const { user } = useSelector((state) => state.auth);

  const [input, setInput] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [typingUser, setTypingUser] = useState(null);
  const { messages, messagesLoading, } = useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(getMyChatsApi());
  }, [dispatch]);

  useEffect(() => {
    if (selectedChat?.chatId) {
      dispatch(getChatMessagesApi(selectedChat.chatId));
    }
  }, [dispatch, selectedChat?.chatId]);

  useEffect(() => {
    if (!selectedChat?.chatId) return;

    const activeMessages =
      messages[selectedChat.chatId] || [];

    if (!activeMessages.length) return;

    const lastMessage =
      activeMessages[
      activeMessages.length - 1
      ];

    if (
      lastMessage?.id &&
      lastMessage.sender_id !== user?.id
    ) {
      dispatch(
        markChatMessagesRead({
          chatId: selectedChat.chatId,
          lastReadMessageId:
            lastMessage.id
        })
      );
    }
  }, [
    dispatch,
    selectedChat?.chatId,
    messages,
    user?.id
  ]);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChat, messages]);

  useEffect(() => {
    const socket = getSocket();

    if (
      socket &&
      selectedChat?.chatId
    ) {
      socket.emit(API_ENDPOINTS.CHAT_JOIN, {
        chatId: selectedChat.chatId
      });

      console.log(
        "Joined room:",
        selectedChat.chatId
      );
    }
  }, [selectedChat?.chatId]);

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
      API_ENDPOINTS.MESSAGE_RECEIVE,
      handleNewMessage
    );
    socket.on(API_ENDPOINTS.CHAT_ERROR, (error) => {
      console.error("Chat error:", error);
    });

    return () => {
      socket.off(
        API_ENDPOINTS.MESSAGE_RECEIVE,
        handleNewMessage
      );
    };
  }, []);

  const activeMessages = useMemo(() => {
    if (!selectedChat?.chatId) return [];
    return messages[selectedChat.chatId] || [];
  }, [messages, selectedChat]);

  const handleSelectChat = (chat) => {
    dispatch(resetUnreadCount(chat.chatId));
    const updatedChat = {
      ...chat,
      unreadCount: 0 // reset unread count when chat is selected
    }
    dispatch(setSelectedChat(updatedChat));
    // dispatch(getChatMessagesApi(chat.chatId));
  };

  const handleSend = () => {
    const text = input.trim();

    if (!text || !selectedChat?.chatId) return;
    const socket = getSocket();

    const payload = {
      chatId: selectedChat.chatId,
      message: text
    };

    console.log("Emitting [message:send] with payload:", payload);
    socket.emit(API_ENDPOINTS.MESSAGE_SEND, payload);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else {
      // Send typing indicator (optional)
      const socket = getSocket();
      console.log("Sending typing event")
      socket.emit(API_ENDPOINTS.TYPING_START, {
        chatId: selectedChat?.chatId
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit(API_ENDPOINTS.TYPING_STOP, {
          chatId: selectedChat?.chatId
        });
      }, 2000);
    }
  };

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    const heartbeatInterval = setInterval(() => {
      console.log("Sending heartbeat to keep presence alive");
      socket.emit(API_ENDPOINTS.HEARTBEAT, {
        userId: user?.id,
      });
    }, 20000); // every 20 seconds

    return () => {
      console.log("Clearing heartbeat interval");
      clearInterval(heartbeatInterval);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;
    const handleUserOnline = (data) => {
      console.log("User online event received:", selectedChat, data);
      if (
        selectedChat?.type ===
        "ONE_TO_ONE" &&
        selectedChat?.other_user_id ===
        data.userId
      ) {
        setIsOnline(true);
      }
    };
    const handleUserOffline = (data) => {
      console.log("User offline event received:", selectedChat, data);
      if (
        selectedChat?.type ===
        "ONE_TO_ONE" &&
        selectedChat?.other_user_id ===
        data.userId
      ) {
        setIsOnline(false);

        dispatch(
          setSelectedChat({
            ...selectedChat,
            last_seen:
              data.lastSeen
          })
        );
      }
    };

    console.log("Setting up socket listeners for presence events [", API_ENDPOINTS.PRESENCE_ONLINE, API_ENDPOINTS.PRESENCE_OFFLINE, "]");
    socket.on(
      API_ENDPOINTS.PRESENCE_ONLINE,
      handleUserOnline
    );

    socket.on(
      API_ENDPOINTS.PRESENCE_OFFLINE,
      handleUserOffline
    );

    return () => {
      socket.off(API_ENDPOINTS.PRESENCE_ONLINE);
      socket.off(API_ENDPOINTS.PRESENCE_OFFLINE);
    };
  }, [selectedChat?.chatId, dispatch]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    const handleTypingStarted = (data) => {
      console.log("received typing", data);
      if (
        data.chatId === selectedChat?.chatId
      ) {
        setTypingUser(
          data.username
        );
      }
    };

    const handleTypingStopped = () => {
      setTypingUser(null);
    };

    console.log("listening events for [", API_ENDPOINTS.TYPING_STARTED, API_ENDPOINTS.TYPING_STOPPED, "]")
    socket.on(
      API_ENDPOINTS.TYPING_STARTED,
      handleTypingStarted
    );

    socket.on(
      API_ENDPOINTS.TYPING_STOPPED,
      handleTypingStopped
    );

    socket.on(API_ENDPOINTS.MESSAGES_READ, (data) => {
      console.log("Received messages read event:", data);
      dispatch(
        markMessagesRead(data)
      );

    });

    return () => {
      socket.off(
        API_ENDPOINTS.TYPING_STARTED,
        handleTypingStarted
      );

      socket.off(
        API_ENDPOINTS.TYPING_STOPPED,
        handleTypingStopped
      );
    };
  }, [selectedChat?.chatId]);

  return (
    <div className="h-screen flex bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-[360px] bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={getProfileImage(user?.full_name, user?.id)}
              alt="profile"
              className="w-11 h-11 rounded-full object-cover"
            />

            <div>
              <h2 className="font-semibold text-gray-900">
                {user?.full_name || "User"}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>

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
              const isActive = selectedChat?.chatId === chat.chatId;

              return (
                <button
                  key={chat.chatId}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full px-4 py-4 flex items-center gap-3 text-left transition ${isActive ? "bg-indigo-50" : "hover:bg-gray-50"
                    }`}
                >
                  <img
                    src={getProfileImage(chat.name, chat?.other_user_id)}
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

                    {/* <p className="text-sm text-gray-500 truncate mt-1">
                      {chat.lastMessage?.message || "No messages yet"}
                    </p> */}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage?.message || "No messages yet"} {chat?.lastMessage?.sender_id === user?.id && (
                          <span
                            className={`ml-1 text-[11px] font-semibold ${Number(chat?.lastReadMessageId || 0) >=
                              Number(chat?.lastMessage?.id || 0)
                              ? "text-sky-400"
                              : "text-gray-400"
                              }`}
                          >
                            {Number(chat?.lastReadMessageId || 0) >=
                              Number(chat?.lastMessage?.id || 0)
                              ? "✓✓"
                              : "✓"}
                          </span>
                        )}
                      </p>

                      {chat?.unreadCount > 0 && (
                        <span
                          className="
        min-w-[22px]
        h-[22px]
        px-2
        flex
        items-center
        justify-center
        rounded-full
        bg-green-500
        text-white
        text-xs
        font-semibold
        ml-2
        shadow-sm
      "
                        >
                          {chat.unreadCount}
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

      {/* Chat Area */}
      <section className="flex-1 flex flex-col">
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div
              className={`h-16 px-5 bg-white border-b border-gray-200 flex items-center gap-3 ${selectedChat?.type === 'GROUP' ? 'cursor-pointer hover:bg-gray-50' : ''}`}
              onClick={() => {
                if (selectedChat?.type === 'GROUP') {
                  navigate(`/group-details/${selectedChat.chatId}`);
                }
              }}
            >
              <img
                src={getProfileImage(selectedChat.name, selectedChat?.other_user_id)}
                alt={selectedChat.name}
                className="w-10 h-10 rounded-full object-cover"
              />

              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedChat.name}
                </h3>

                <p className="text-xs text-gray-500">
                  {typingUser
                    ? "typing..."
                    : (isOnline || selectedChat?.isOnline)
                      ? "Online"
                      : selectedChat?.last_seen
                        ? `Last seen ${formatLastSeen(
                          selectedChat.last_seen
                        )}`
                        : "Group chat"}
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
                  activeMessages.map((msg, index) => {
                    const isOwnMessage =
                      msg.sender_id === user?.id;

                    const isGroupChat =
                      selectedChat?.type === "GROUP";
                    const previousMessage =
                      index > 0
                        ? activeMessages[index - 1]
                        : null;

                    const currentDateLabel =
                      formatMessageDateLabel(msg.created_at);

                    const previousDateLabel =
                      previousMessage
                        ? formatMessageDateLabel(
                          previousMessage.created_at
                        )
                        : null;

                    const showDateSeparator =
                      currentDateLabel !== previousDateLabel;
                    return <>
                      {showDateSeparator && (
                        <div className="flex justify-center my-4">
                          <span
                            className="
          px-4
          py-1
          rounded-full
          bg-white
          text-gray-500
          text-xs
          font-medium
          shadow-sm
          border
        "
                          >
                            {currentDateLabel}
                          </span>
                        </div>
                      )}
                      <div
                        key={msg.id}
                        className={`flex ${isOwnMessage
                          ? "justify-end"
                          : "justify-start"
                          }`}
                      >
                        {/* Show profile image only for group incoming messages */}
                        {!isOwnMessage && isGroupChat && (
                          <img
                            src={
                              msg?.sender_profile_picture ||
                              "https://i.pravatar.cc/150?img=12"
                            }
                            alt={
                              msg?.sender_name ||
                              "User"
                            }
                            className="w-8 h-8 rounded-full object-cover mr-2 self-end"
                          />
                        )}

                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${isOwnMessage
                            ? "bg-black text-white rounded-br-sm"
                            : "bg-white border text-gray-900 rounded-bl-sm"
                            }`}
                        >
                          {/* Show sender name only for group incoming messages */}
                          {!isOwnMessage && isGroupChat && (
                            <p className="text-xs font-semibold text-green-600 mb-1">
                              {msg?.sender_name || "User"}
                            </p>
                          )}

                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.message} {isOwnMessage && (
                              <span
                                className={`ml-1 text-[11px] font-semibold inline-flex items-center ${selectedChat?.lastReadMessageId >= msg.id
                                  ? "text-sky-400"
                                  : "text-gray-300"
                                  }`}
                              >
                                {selectedChat?.lastReadMessageId >= msg.id
                                  ? "✓✓"
                                  : "✓"}
                              </span>
                            )}
                          </p>

                          <p
                            className={`text-[10px] mt-1 text-right ${isOwnMessage
                              ? "text-gray-300"
                              : "text-gray-400"
                              }`}
                          >
                            {formatChatTimestamp(
                              msg.created_at
                            )}
                          </p>
                        </div>
                      </div>
                    </>
                  })
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
