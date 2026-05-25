import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoChatbubbleOutline, IoChevronDown, IoChevronUp } from "react-icons/io5";
import {
  getMyChatsApi,
  getChatMessagesApi,
  setSelectedChat,
  clearChatMessagesApi,
  appendNewMessage,
  updateMessage,
  deleteMessage,
  markChatMessagesRead,
  resetUnreadCount,
  markMessagesRead
} from "../redux/slice/chat.slice";
import api from "../api/axios";
import { getSocket } from "../socket/socket";
import { API_ENDPOINTS, REACT_ENDPOINTS } from "../utils/endpoints";
import {
  formatLastSeen,
  formatChatTimestamp,
  formatMessageDateLabel,
} from "../utils/date.util";
import { getProfileImage } from "../utils/constants";
import { showError, showSuccess } from "../utils/toast";
import AddGroupMemberModal from "../components/AddGroupMemberModal";
import CreateGroupModal from "../components/CreateGroupModal";
import ConfirmBox from "../components/ConfirmBox";
import noChatBg from "/assets/no_chat_bg.png";

const SIDEBAR_MIN_WIDTH = 300;
const SIDEBAR_MAX_WIDTH = 520;
const SIDEBAR_DEFAULT_WIDTH = 380;

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
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearChatId, setClearChatId] = useState(null);
  const [contactSearch, setContactSearch] = useState("");
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [showNewChatPanel, setShowNewChatPanel] = useState(false);
  const [quickNewChatMode, setQuickNewChatMode] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const contactSearchInputRef = useRef(null);
  const messageMenuRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [openMessageMenuId, setOpenMessageMenuId] = useState(null);
  const [messageInfoMessage, setMessageInfoMessage] = useState(null);
  const headerMenuRef = useRef(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const [replyingToMessage, setReplyingToMessage] = useState(null);


  const { messages } = useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(getMyChatsApi());
  }, [dispatch]);

  useEffect(() => {
    if (selectedChat?.chatId) {
      dispatch(getChatMessagesApi(selectedChat.chatId));
    }
  }, [dispatch, selectedChat?.chatId]);

  useEffect(() => {
    setTypingUsers({});
  }, [selectedChat?.chatId]);

  useEffect(() => {
    if (!openMessageMenuId) return;

    const handleClickOutsideMessageMenu = (event) => {
      if (messageMenuRef.current?.contains(event.target)) {
        return;
      }

      setOpenMessageMenuId(null);
    };

    document.addEventListener("mousedown", handleClickOutsideMessageMenu);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMessageMenu);
    };
  }, [openMessageMenuId]);

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
    const loadContacts = async () => {
      const query = contactSearch.trim();

      if (!query) {
        if (!showNewChatPanel) {
          setContacts([]);
          setContactsLoading(false);
          return;
        }
      }

      setContactsLoading(true);
      try {
        const params = query ? { search: query } : {};
        if (quickNewChatMode) {
          params.newChat = true;
        }
        const response = await api.get(API_ENDPOINTS.CONTACTS, {
          params,
        });
        setContacts(response.data?.data || []);
      } catch (error) {
        showError(
          error?.response?.data?.message ||
          "Unable to load contacts. Please try again."
        );
      } finally {
        setContactsLoading(false);
      }
    };

    loadContacts();
  }, [contactSearch, showNewChatPanel, quickNewChatMode]);

  const isContactSearchNonContactResult =
    contacts.length > 0 &&
    contacts.every((item) => item.isInYourContact === false);

  const contactsLabel = isContactSearchNonContactResult
    ? "User is not in your contacts"
    : "Contacts";

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

    const handleMessageUpdated = (data) => {
      dispatch(updateMessage(data));
    };

    const handleMessageDeleted = (data) => {
      dispatch(deleteMessage(data));
      dispatch(getMyChatsApi());
    };

    // console.log("Setting up socket listener [message:new] for new messages");
    socket.on(
      API_ENDPOINTS.MESSAGE_RECEIVE,
      handleNewMessage
    );
    socket.on(
      API_ENDPOINTS.MESSAGE_UPDATED,
      handleMessageUpdated
    );
    socket.on(
      API_ENDPOINTS.MESSAGE_DELETED,
      handleMessageDeleted
    );
    socket.on(API_ENDPOINTS.CHAT_ERROR, (error) => {
      console.error("Chat error:", error);
    });

    return () => {
      socket.off(
        API_ENDPOINTS.MESSAGE_RECEIVE,
        handleNewMessage
      );
      socket.off(
        API_ENDPOINTS.MESSAGE_UPDATED,
        handleMessageUpdated
      );
      socket.off(
        API_ENDPOINTS.MESSAGE_DELETED,
        handleMessageDeleted
      );
    };
  }, [dispatch]);

  const activeMessages = useMemo(() => {
    if (!selectedChat?.chatId) return [];
    return messages[selectedChat.chatId] || [];
  }, [messages, selectedChat]);

  const selectedChatMemberCount = useMemo(() => {
    if (selectedChat?.type !== "GROUP") return null;

    return (
      selectedChat.memberCount ??
      selectedChat.membersCount ??
      selectedChat.allMembers?.length ??
      selectedChat.members?.length ??
      null
    );
  }, [selectedChat]);

  const groupChatLabel =
    selectedChatMemberCount != null
      ? `Group chat - ${selectedChatMemberCount} ${selectedChatMemberCount === 1 ? "member" : "members"}`
      : "Group chat";

  const typingUserNames = useMemo(() => {
    return Object.values(typingUsers).filter(Boolean).slice(0, 2);
  }, [typingUsers]);

  const typingLabel = useMemo(() => {
    if (typingUserNames.length === 0) return "";
    if (typingUserNames.length === 1) {
      return `${typingUserNames[0]} is typing...`;
    }

    return `${typingUserNames.join(", ")} are typing...`;
  }, [typingUserNames]);

  const getGroupMessageReadInfo = (message) => {
    if (selectedChat?.type !== "GROUP" || !message?.id) {
      return {
        readers: [],
        pendingReaders: [],
        allRead: false
      };
    }

    const memberReceipts = selectedChat.readReceipts || [];
    const otherMembers = memberReceipts.filter(
      (receipt) => Number(receipt.userId) !== Number(user?.id)
    );
    const readers = otherMembers.filter(
      (receipt) =>
        Number(receipt.lastReadMessageId || 0) >= Number(message.id)
    );
    const pendingReaders = otherMembers.filter(
      (receipt) =>
        Number(receipt.lastReadMessageId || 0) < Number(message.id)
    );

    return {
      readers,
      pendingReaders,
      allRead:
        otherMembers.length > 0 &&
        readers.length === otherMembers.length
    };
  };

  const openMessageInfo = (message) => {
    setOpenMessageMenuId(null);
    setMessageInfoMessage(message);
  };

  const clampSidebarWidth = (width) => {
    return Math.min(
      SIDEBAR_MAX_WIDTH,
      Math.max(SIDEBAR_MIN_WIDTH, width)
    );
  };

  const startSidebarResize = (event) => {
    event.preventDefault();

    const handleMouseMove = (moveEvent) => {
      setSidebarWidth(
        clampSidebarWidth(moveEvent.clientX)
      );
    };

    const handleMouseUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleSelectChat = (chat) => {
    dispatch(resetUnreadCount(chat.chatId));
    const updatedChat = {
      ...chat,
      unreadCount: 0 // reset unread count when chat is selected
    };
    dispatch(setSelectedChat(updatedChat));
    // dispatch(getChatMessagesApi(chat.chatId));
  };

  const handleSelectContact = async (contact) => {
    if (!contact) return;

    const existingChat = chats.find(
      (chat) => chat.type === "ONE_TO_ONE" && chat.other_user_id === contact.id
    );

    if (existingChat) {
      handleSelectChat(existingChat);
      return;
    }

    dispatch(
      setSelectedChat({
        type: "ONE_TO_ONE",
        chatId: null,
        other_user_id: contact.id,
        name: contact.full_name || contact.name,
        email: contact.email || contact.mobile || contact.mobile_number,
        lastMessage: null,
        isOnline: false,
        preview: true,
        lastReadMessageId: null
      })
    );
  };

  const toggleHeaderMenu = (event) => {
    event?.stopPropagation();
    setShowHeaderMenu((value) => !value);
  };

  const openAddMemberModal = () => {
    setShowHeaderMenu(false);
    setShowAddMemberModal(true);
  };

  const closeAddMemberModal = () => {
    setShowAddMemberModal(false);
  };

  const openClearChatModal = (event) => {
    event?.stopPropagation();
    setShowHeaderMenu(false);
    setClearChatId(selectedChat?.chatId);
    setShowClearConfirm(true);
  };

  const closeClearChatModal = () => {
    setShowClearConfirm(false);
    setClearChatId(null);
  };

  const handleClearChatConfirm = () => {
    if (!clearChatId) return;
    dispatch(clearChatMessagesApi(clearChatId));
    closeClearChatModal();
  };

  const canEditMessage = (message) => {
    if (!message?.created_at) return false;

    const sentAt = new Date(message.created_at);
    const now = new Date();

    return (
      sentAt.getFullYear() === now.getFullYear() &&
      sentAt.getMonth() === now.getMonth() &&
      sentAt.getDate() === now.getDate()
    );
  };

  const startEditMessage = (message) => {
    if (!canEditMessage(message)) {
      showError("Messages can only be edited on the same day they were sent.");
      return;
    }

    setOpenMessageMenuId(null);
    setEditingMessageId(message.id);
    setEditMessageText(message.message || "");
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditMessageText("");
  };

  const handleUpdateMessage = (message) => {
    const text = editMessageText.trim();
    if (!selectedChat?.chatId || !message?.id || !text) return;
    if (!canEditMessage(message)) {
      showError("Messages can only be edited on the same day they were sent.");
      cancelEditMessage();
      return;
    }

    const socket = getSocket();
    if (!socket) return;

    socket.emit(API_ENDPOINTS.MESSAGE_UPDATE, {
      chatId: selectedChat.chatId,
      messageId: message.id,
      message: text,
    });
    cancelEditMessage();
  };

  const handleDeleteMessage = (message) => {
    if (!selectedChat?.chatId || !message?.id) return;
    if (!window.confirm("Delete this message?")) return;

    const socket = getSocket();
    if (!socket) return;

    setOpenMessageMenuId(null);
    socket.emit(API_ENDPOINTS.MESSAGE_DELETE, {
      chatId: selectedChat.chatId,
      messageId: message.id,
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !selectedChat) return;

    const socket = getSocket();
    let chatId = selectedChat.chatId;

    if (!chatId && selectedChat.type === "ONE_TO_ONE") {
      try {
        const response = await api.post(API_ENDPOINTS.CHAT_CREATE, {
          type: "ONE_TO_ONE",
          memberIds: [selectedChat.other_user_id],
        });

        const newChat = response.data?.data?.chatDetails || response.data;
        if (!newChat?.chatId) {
          showError("Unable to create chat. Please try again.");
          return;
        }

        chatId = newChat.chatId;
        dispatch(getMyChatsApi());
        dispatch(setSelectedChat(newChat));

        if (socket) {
          socket.emit(API_ENDPOINTS.CHAT_JOIN, { chatId });
        }
      } catch (error) {
        showError(
          error?.response?.data?.message ||
          "Unable to create chat. Please try again."
        );
        return;
      }
    }

    if (!chatId) return;

    const payload = {
      chatId,
      message: text,
      replyToMessageId: replyingToMessage?.id
    };

    console.log("Emitting [message:send] with payload:", payload);
    socket.emit(API_ENDPOINTS.MESSAGE_SEND, payload);
    setInput("");
    setContactSearch("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }

    if (!selectedChat?.chatId) return;

    const socket = getSocket();
    if (!socket) return;

    // console.log("Sending typing event");
    socket.emit(API_ENDPOINTS.TYPING_START, {
      chatId: selectedChat.chatId,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit(API_ENDPOINTS.TYPING_STOP, {
        chatId: selectedChat.chatId,
      });
    }, 2000);
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
      // console.log("Clearing heartbeat interval");
      clearInterval(heartbeatInterval);
    };
  }, [user?.id]);

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

    // console.log("Setting up socket listeners for presence events [", API_ENDPOINTS.PRESENCE_ONLINE, API_ENDPOINTS.PRESENCE_OFFLINE, "]");
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
  }, [selectedChat, dispatch]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    const handleTypingStarted = (data) => {
      console.log("received typing", data);
      if (
        data.chatId === selectedChat?.chatId
      ) {
        setTypingUsers((currentUsers) => ({
          ...currentUsers,
          [data.userId || data.username]: data.username
        }));
      }
    };

    const handleTypingStopped = (data) => {
      if (data.chatId !== selectedChat?.chatId) return;

      setTypingUsers((currentUsers) => {
        const nextUsers = { ...currentUsers };
        delete nextUsers[data.userId || data.username];
        return nextUsers;
      });
    };

    // console.log("listening events for [", API_ENDPOINTS.TYPING_STARTED, API_ENDPOINTS.TYPING_STOPPED, "]")
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
  }, [selectedChat?.chatId, dispatch]);

  const messageInfoReadInfo = messageInfoMessage
    ? getGroupMessageReadInfo(messageInfoMessage)
    : {
      readers: [],
      pendingReaders: [],
      allRead: false
    };

  const handleLeaveGroup = async () => {

    if (!selectedChat?.chatId)
      return;

    try {

      await api.delete(
        `/chats/${selectedChat.chatId}/leave`
      );

      setShowLeaveConfirm(false);
      setShowHeaderMenu(false);

      dispatch(getMyChatsApi());

      dispatch(
        setSelectedChat(null)
      );

      showSuccess("You have successfully left the group.");

    } catch (error) {

      showError(
        error?.response?.data
          ?.message ||
        "Unable to leave group"
      );
    }
  };


  useEffect(() => {

    if (!showHeaderMenu) return;

    const handleOutsideClick = (
      event
    ) => {

      if (
        headerMenuRef.current &&
        !headerMenuRef.current.contains(
          event.target
        )
      ) {
        setShowHeaderMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };

  }, [showHeaderMenu]);

  return (
    <div className="h-screen flex bg-[#f5f7fb] overflow-hidden">
      {/* Sidebar */}
      <aside
        className="relative shrink-0 bg-white border-r border-gray-200 flex flex-col"
        style={{
          width: sidebarWidth,
          minWidth: SIDEBAR_MIN_WIDTH,
          maxWidth: SIDEBAR_MAX_WIDTH,
        }}
      >
        <div
          role="separator"
          aria-label="Resize chat list"
          aria-orientation="vertical"
          aria-valuemin={SIDEBAR_MIN_WIDTH}
          aria-valuemax={SIDEBAR_MAX_WIDTH}
          aria-valuenow={sidebarWidth}
          onMouseDown={startSidebarResize}
          className="group absolute right-[-4px] top-0 z-40 h-full w-2 cursor-col-resize"
        >
          <div className="mx-auto h-full w-px bg-transparent transition group-hover:bg-indigo-400" />
        </div>
        <div className="bg-white">
          <div className="flex items-center justify-between gap-3 px-5 py-4">

            {/* App name & tag line */}
            {/* Brand */}
            <div className="flex flex-col leading-none">
              <h1 className="text-[34px] font-extrabold tracking-[-0.06em]">
                <span className="text-slate-500">Chat</span>
                <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  Flow
                </span>
              </h1>

              <p className="mt-1 pl-[2px] text-[13px] font-medium tracking-[0.02em] text-slate-400">
                Connect Instantly. Flow Naturally.
              </p>
            </div>

            <div className="flex items-center">
              <button
                type="button"
                onClick={() => navigate(REACT_ENDPOINTS.SETTINGS)}
                className="rounded-full border border-gray-200 bg-white shadow-sm transition hover:border-gray-300 cursor-pointer"
                aria-label="Profile settings"
              >
                <img
                  src={getProfileImage(user?.full_name, user?.id)}
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover"
                />
              </button>
              <button
                type="button"
                onClick={() => navigate(REACT_ENDPOINTS.SETTINGS)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-600 transition hover:border-gray-300 hover:text-gray-900 "
                aria-label="Settings"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <circle cx="12" cy="5" r="1.8" />
                  <circle cx="12" cy="12" r="1.8" />
                  <circle cx="12" cy="19" r="1.8" />
                </svg>
              </button>
            </div>
          </div>

          {showNewChatPanel && (
            <div className="bg-white px-5 py-4">
              <div className="flex items-center justify-start gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewChatPanel(false);
                    setQuickNewChatMode(false);
                  }}
                  aria-label="Back"
                >
                  <span className="text-lg cursor-pointer hover:scale-110"><IoArrowBack /></span>
                </button>

                <h3 className="text-base font-semibold text-gray-900">New chat</h3>

                {/* <div className="h-10 w-10" /> */}
              </div>
            </div>
          )}
          <div className="px-5 pb-4">
            <div className="rounded-full border border-gray-200 bg-[#f5f7fb] shadow-sm focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-black/10 flex items-center px-2">
              <input
                ref={contactSearchInputRef}
                type={quickNewChatMode ? "tel" : "text"}
                inputMode={quickNewChatMode ? "numeric" : "text"}
                value={contactSearch}
                onChange={(e) => {
                  const value = e.target.value;
                  if (quickNewChatMode) {
                    setContactSearch(value.replace(/\D/g, ""));
                  } else {
                    setContactSearch(value);
                  }
                }}
                placeholder={quickNewChatMode ? "Enter contact number" : "Search contacts"}
                className="flex-1 rounded-full bg-[#f5f7fb] px-4 py-3 text-sm text-gray-900 outline-none border-none"
              />

              {contactSearch && (
                <button
                  type="button"
                  onClick={() => setContactSearch("")}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 transition"
                  aria-label="Clear search"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 cursor-pointer hover:font-bold"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="h-full overflow-y-auto px-5 pb-24 pt-3 space-y-2">
            {showNewChatPanel ? (
              <div className="space-y-4">


                <div className="darla-new-group-button">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateGroupModal(true);
                      setQuickNewChatMode(false);
                      setShowNewChatPanel(false);
                    }}
                    className="group w-full rounded-[28px] border border-gray-200 bg-white px-4 py-4 text-left shadow-sm transition 
                    hover:border-black/10 hover:shadow-md
                    cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                          <path d="M12 5v14M5 12h14" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">New Group</p>
                        <p className="text-sm text-gray-500">Create a group with multiple contacts</p>
                      </div>
                    </div>
                  </button>
                </div>
                <div className="darla-quick-new-chat-button">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewChatPanel(true);
                      setQuickNewChatMode(true);
                      setContactSearch("");
                      setTimeout(() => contactSearchInputRef.current?.focus(), 100);
                    }}
                    className="group w-full rounded-[28px] border border-gray-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-black/10 hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-200 text-green-600">
                        <IoChatbubbleOutline />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Quick New Chat
                        </p>
                        <p className="text-sm text-gray-500">
                          Start direct chat instantly
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="space-y-3 px-1">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{contactsLabel}</p>
                  </div>
                  {contactsLoading ? (
                    <div className="text-sm text-gray-500">Loading contacts...</div>
                  ) : contacts.length === 0 ? (
                    <div className="text-sm text-gray-500">No contacts found.</div>
                  ) : (
                    contacts.map((contact, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          handleSelectContact(contact);
                          setShowNewChatPanel(false);
                          setQuickNewChatMode(false);
                        }}
                        className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-4 text-left transition hover:border-black/10 hover:shadow-sm cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={getProfileImage(contact.full_name, contact.id)}
                            alt={contact.full_name}
                            className="h-11 w-11 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{contact.full_name}</p>
                            <p className="text-sm text-gray-500 truncate">{contact.email || contact.mobile || contact.mobile_number}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : contactSearch ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{contactsLabel}</p>
                </div>
                {contactsLoading ? (
                  <div className="text-sm text-gray-500">Loading contacts...</div>
                ) : contacts.length === 0 ? (
                  <div className="text-sm text-gray-500">No contacts found.</div>
                ) : (
                  contacts.map((contact, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectContact(contact)}
                      className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-black/10 hover:shadow-sm cursor-pointer"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{contact.full_name}</p>
                        <p className="text-sm text-gray-500">{contact.mobile || contact.mobile_number}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : chatsLoading ? (
              <div className="text-sm text-gray-500">Loading chats...</div>
            ) : chats?.length === 0 ? (
              <div className="text-sm text-gray-500">No chats found</div>
            ) : (
              <div className="space-y-2">
                {chats.map((chat) => {
                  const isActive = selectedChat?.chatId === chat.chatId;

                  return (
                    <button
                      key={chat.chatId}
                      onClick={() => handleSelectChat(chat)}
                      className={`w-full rounded-3xl px-4 py-4 text-left transition ${isActive ? "bg-indigo-50 shadow-sm" : "hover:bg-gray-50"} cursor-pointer`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={getProfileImage(chat.name, chat?.other_user_id)}
                          alt={chat.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {chat.name}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatChatTimestamp(chat.lastMessage?.created_at)}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-3 text-sm text-gray-500">
                            <p className="min-w-0 truncate">
                              {chat.lastMessage?.is_deleted
                                ? Number(chat.lastMessage?.deleted_by) === Number(user?.id)
                                  ? "You deleted this message"
                                  : "This message has been deleted"
                                : chat.lastMessage?.message || "No messages yet"}
                            </p>
                            {chat?.unreadCount > 0 ? (
                              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-green-500 px-2 text-xs font-semibold text-white">
                                {chat.unreadCount}
                              </span>
                            ) : chat?.lastMessage?.sender_id === user?.id && !chat?.lastMessage?.is_deleted ? (
                              <span className={`text-xs ${Number(chat?.lastReadMessageId) >= Number(chat?.lastMessage?.id) ? "text-sky-500" : "text-slate-400"}`}>
                                {Number(chat?.lastReadMessageId) >= Number(chat?.lastMessage?.id) ? "✓✓" : "✓"}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {/* Floating New Chat Button */}
          {!showNewChatPanel && (
            <div className="absolute bottom-6 right-6 z-30">
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewChatPanel(true);
                    setContactSearch("");
                    // focus the search input in the new panel
                    setTimeout(() => contactSearchInputRef.current?.focus(), 100);
                  }}
                  className="inline-flex items-center justify-center  transition hover:scale-105 cursor-pointer"
                  aria-label="New chat"
                  title="Start New Chat.."
                >
                  <img src="/assets/newchat-icon.png" alt="New chat" className="h-10 w-10 object-contain" />
                </button>
              </div>
            </div>
          )}
        </div>


      </aside>

      {/* Chat Area */}
      <section className="flex-1 flex flex-col">
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f6f8fc] text-center px-6">

            <img
              src={noChatBg}
              alt="No chat selected"
              className="w-full max-w-xs select-none"
            />

            <h2 className="mt-5 text-2xl font-semibold text-gray-700">
              Select a chat
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Choose a conversation from the sidebar to start messaging with your contacts.
            </p>

          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="relative">
              <div
                className={`h-16 px-5 bg-white border-b border-gray-200 flex items-center justify-between gap-3 ${selectedChat?.type === 'GROUP' ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={() => {
                  if (selectedChat?.type === 'GROUP') {
                    navigate(`/group-details/${selectedChat.chatId}`);
                  }
                }}
              >
                <div className="flex items-center gap-3">
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
                      {typingLabel
                        ? typingLabel
                        : (isOnline || selectedChat?.isOnline)
                          ? "Online"
                          : selectedChat?.last_seen
                            ? `Last seen ${formatLastSeen(
                              selectedChat.last_seen
                            )}`
                            : selectedChat?.type === "GROUP" ? groupChatLabel : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">

                  {!showHeaderMenu ? (
                    <button
                      // onClick={toggleHeaderMenu}
                      onClick={(e) => { e.stopPropagation(); setShowHeaderMenu(true); }}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-black transition hover:bg-gray-100 cursor-pointer"
                      aria-label="Open chat menu"
                    >
                      <span className="text-xl leading-none">
                        ⋮
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowHeaderMenu(false); }}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-black transition hover:bg-gray-100 cursor-pointer"
                      aria-label="Close chat menu"
                    >
                      <span className="text-lg leading-none">
                        ✕
                      </span>
                    </button>
                  )}

                </div>
              </div>

              {showHeaderMenu && (
                <div
                  ref={headerMenuRef}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full right-4 z-30 mt-2 w-52 rounded-3xl bg-white border border-gray-200 shadow-xl overflow-hidden"
                >



                  {/* Add Member */}
                  {selectedChat?.type ===
                    "GROUP" && (
                      <button
                        onClick={openAddMemberModal}
                        className="w-full text-left px-4 py-3 text-sm text-gray-900 transition hover:bg-gray-100 cursor-pointer"
                      >
                        Add member
                      </button>
                    )}

                  {/* Leave Group */}
                  {selectedChat?.type ===
                    "GROUP" && (
                      <button
                        onClick={() => {
                          setShowLeaveConfirm(true);
                          setShowHeaderMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 transition hover:bg-red-50 cursor-pointer"
                      >
                        Leave group
                      </button>
                    )}

                  {/* Clear Chat */}
                  <button
                    onClick={openClearChatModal}
                    className="w-full text-left px-4 py-3 text-sm text-gray-900 transition hover:bg-gray-100 cursor-pointer"
                  >
                    Clear chat
                  </button>
                </div>
              )}

              {showAddMemberModal && (
                <AddGroupMemberModal
                  open={showAddMemberModal}
                  chatId={selectedChat?.chatId}
                  onClose={closeAddMemberModal}
                  onMembersAdded={() => {
                    dispatch(getMyChatsApi());
                    if (selectedChat?.chatId) {
                      dispatch(getChatMessagesApi(selectedChat.chatId));
                    }
                  }}
                />
              )}

              {showCreateGroupModal && (
                <CreateGroupModal
                  open={showCreateGroupModal}
                  onClose={() => {
                    setShowCreateGroupModal(false);
                    setShowNewChatPanel(true);
                  }}
                  onGroupCreated={() => {
                    setShowCreateGroupModal(false);
                    setShowNewChatPanel(false);
                  }}
                />
              )}

              {showClearConfirm && (
                <ConfirmBox
                  title="Clear Chat"
                  message="Are you sure you want to clear this chat? This will remove all messages from the conversation."
                  onConfirm={handleClearChatConfirm}
                  onCancel={closeClearChatModal}
                />
              )}
              {showLeaveConfirm && (
                <ConfirmBox
                  title="Leave Group"
                  message="Are you sure you want to leave this group? You will lose access to the conversation."
                  onConfirm={handleLeaveGroup}
                  onCancel={() => setShowLeaveConfirm(false)}
                />
              )}
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
                    const isOwnMessage = msg.sender_id === user?.id;
                    const isDeletedMessage = Boolean(msg.is_deleted);
                    const deletedByCurrentUser = Number(msg.deleted_by) === Number(user?.id);
                    const messageText =
                      isDeletedMessage
                        ? deletedByCurrentUser
                          ? "You deleted this message"
                          : "This message has been deleted"
                        : msg.message;

                    const isGroupChat = selectedChat?.type === "GROUP";
                    const groupReadInfo =
                      isOwnMessage && isGroupChat
                        ? getGroupMessageReadInfo(msg)
                        : null;
                    const isEditableToday = canEditMessage(msg);
                    const previousMessage =
                      index > 0
                        ? activeMessages[index - 1]
                        : null;

                    const currentDateLabel = formatMessageDateLabel(msg.created_at);

                    const previousDateLabel =
                      previousMessage
                        ? formatMessageDateLabel(
                          previousMessage.created_at
                        )
                        : null;

                    const showDateSeparator = currentDateLabel !== previousDateLabel;

                    const repliedMessage = msg.reply_to_message_id
                      ? activeMessages.find(
                        (m) => m.id === msg.reply_to_message_id
                      )
                      : null;
                    return <React.Fragment key={msg.id}>
                      {showDateSeparator && (
                        <div className="flex justify-center my-4" key={index}>
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
                          className={`group/message relative max-w-[70%] px-4 py-2 rounded-2xl shadow-sm pr-9 ${isOwnMessage
                            ? "bg-black text-white rounded-br-sm"
                            : "bg-white border text-gray-900 rounded-bl-sm"
                            }`}
                        >
                          {!isDeletedMessage && editingMessageId !== msg.id ? (
                            <div ref={openMessageMenuId === msg.id ? messageMenuRef : null}>

                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenMessageMenuId((currentId) =>
                                    currentId === msg.id ? null : msg.id
                                  );
                                }}
                                className={`absolute right-2 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full transition cursor-pointer
    ${isOwnMessage
                                    ? "text-white hover:bg-white/10"
                                    : "text-gray-700 hover:bg-gray-200"
                                  }
    ${openMessageMenuId === msg.id
                                    ? "opacity-100"
                                    : "opacity-0 group-hover/message:opacity-100"
                                  }
  `}
                                aria-label="Message actions"
                              >
                                {openMessageMenuId === msg.id ? (
                                  <IoChevronUp className="h-4 w-4" />
                                ) : (
                                  <IoChevronDown className="h-4 w-4" />
                                )}
                              </button>
                              {openMessageMenuId === msg.id ? (
                                <div className="absolute bottom-full right-0 z-20 flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-lg">
                                  {isGroupChat ? (
                                    <button
                                      type="button"
                                      onClick={() => openMessageInfo(msg)}
                                      className="rounded-full px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                                    >
                                      Info
                                    </button>
                                  ) : null}
                                  {isEditableToday && isOwnMessage ? (
                                    <button
                                      type="button"
                                      onClick={() => startEditMessage(msg)}
                                      className="rounded-full px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                  ) : null}
                                  {isOwnMessage && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMessage(msg)}
                                      className="rounded-full px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReplyingToMessage(msg);
                                      setOpenMessageMenuId(null);
                                    }}
                                    className="rounded-full px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                                  >
                                    Reply
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                          {/* Show sender name only for group incoming messages */}
                          {!isOwnMessage && isGroupChat && (
                            <p className="text-xs font-semibold text-green-600 mb-1">
                              {msg?.sender_name || "User"}
                            </p>
                          )}
                          {repliedMessage && (
                            <div
                              className={`mb-2 rounded-xl px-3 py-2 border-l-4 ${isOwnMessage
                                ? "bg-white/10 border-white/40"
                                : "bg-gray-100 border-gray-400"
                                }`}
                            >
                              <p
                                className={`text-xs font-semibold ${isOwnMessage
                                  ? "text-gray-200"
                                  : "text-gray-700"
                                  }`}
                              >
                                {repliedMessage.sender_name || "User"}
                              </p>

                              <p
                                className={`text-xs truncate ${isOwnMessage
                                  ? "text-gray-300"
                                  : "text-gray-600"
                                  }`}
                              >
                                {repliedMessage.message}
                              </p>
                            </div>
                          )}
                          {editingMessageId === msg.id && !isDeletedMessage ? (
                            <div className="space-y-2">
                              <textarea
                                value={editMessageText}
                                onChange={(event) => setEditMessageText(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === "Escape") {
                                    event.preventDefault();
                                    cancelEditMessage();
                                  }

                                  if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault();
                                    handleUpdateMessage(msg);
                                  }
                                }}
                                className="min-h-[72px] w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-white/40"
                                autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={cancelEditMessage}
                                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/20"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateMessage(msg)}
                                  disabled={!editMessageText.trim()}
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${editMessageText.trim()
                                    ? "bg-white text-black hover:bg-gray-100"
                                    : "bg-gray-500 text-gray-300"
                                    }`}
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (

                            <p className="text-sm whitespace-pre-wrap break-words">
                              <span className={isDeletedMessage ? "italic opacity-80" : ""}>
                                {messageText}
                              </span> {!isDeletedMessage && msg.updated_at ? (
                                <span className={`ml-1 text-[10px] ${isOwnMessage ? "text-gray-300" : "text-gray-400"}`}>
                                  edited
                                </span>
                              ) : null} {isOwnMessage && !isDeletedMessage && (
                                <span
                                  className={`ml-1 text-[11px] font-semibold inline-flex items-center ${(isGroupChat ? groupReadInfo?.allRead : selectedChat?.lastReadMessageId >= msg.id)
                                    ? "text-sky-400"
                                    : "text-gray-300"
                                    }`}
                                >
                                  {(isGroupChat ? groupReadInfo?.allRead : selectedChat?.lastReadMessageId >= msg.id)
                                    ? "✓✓"
                                    : "✓"}
                                </span>
                              )}
                            </p>
                          )}

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
                    </React.Fragment>
                  })
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white px-4 pt-3">

              {/* Reply Preview Card */}
              {replyingToMessage && (
                <div className="px-4 pt-3">
                  <div className="relative max-w-xl rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3">

                    {/* Close Button */}
                    <button
                      onClick={() => setReplyingToMessage(null)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-black transition cursor-pointer"
                    >
                      ✕
                    </button>

                    {/* Sender + Time */}
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span className="font-semibold text-black">
                        {replyingToMessage.sender?.name || "You"}
                      </span>

                      <span className="text-gray-500 text-xs">
                        {new Date(replyingToMessage.created_at).toLocaleString()}
                      </span>
                    </div>

                    {/* Message Preview */}
                    <p className="text-sm text-gray-700 line-clamp-2 break-words pr-6">
                      {replyingToMessage?.message || "Message not found"}
                    </p>
                  </div>
                </div>
              )}

              {/* Actual Input */}
              <div className="p-4">
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
                    disabled={!input.trim()}
                    className={`h-12 px-6 rounded-full text-white font-medium transition ${input.trim()
                      ? "bg-black hover:opacity-90"
                      : "bg-gray-300 cursor-not-allowed"
                      }`}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {messageInfoMessage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={() => setMessageInfoMessage(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Message info
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {messageInfoReadInfo.allRead
                    ? "Everyone has read this message."
                    : "Read status for group members."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMessageInfoMessage(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                aria-label="Close message info"
              >
                ×
              </button>
            </div>

            <div className="mb-5 rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-800">
              {messageInfoMessage.is_deleted
                ? Number(messageInfoMessage.deleted_by) === Number(user?.id)
                  ? "You deleted this message"
                  : "This message has been deleted"
                : messageInfoMessage.message}
            </div>

            <div className="space-y-5">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  Read by
                </h3>
                {messageInfoReadInfo.readers.length === 0 ? (
                  <p className="text-sm text-gray-500">No one has read it yet.</p>
                ) : (
                  <div className="space-y-3">
                    {messageInfoReadInfo.readers.map((receipt) => (
                      <div key={receipt.userId} className="flex items-center gap-3">
                        <img
                          src={receipt.profile_picture || getProfileImage(receipt.name, receipt.userId)}
                          alt={receipt.name || "User"}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        <p className="text-sm font-medium text-gray-900">
                          {receipt.name || "User"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {messageInfoReadInfo.pendingReaders.length > 0 ? (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Not read yet
                  </h3>
                  <div className="space-y-3">
                    {messageInfoReadInfo.pendingReaders.map((receipt) => (
                      <div key={receipt.userId} className="flex items-center gap-3">
                        <img
                          src={receipt.profile_picture || getProfileImage(receipt.name, receipt.userId)}
                          alt={receipt.name || "User"}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        <p className="text-sm font-medium text-gray-900">
                          {receipt.name || "User"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
