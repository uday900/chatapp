// ChatWindow.jsx
import React, { useMemo, useState, useRef, useEffect } from 'react';

function formatChatTimestamp(d) {
  const date = typeof d === 'string' ? new Date(d) : d;
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  return sameDay
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

const mockChats = [
  {
    id: '1',
    name: 'Alex Johnson',
    username: 'alexj',
    avatar: 'https://i.pravatar.cc/100?img=1',
    lastMessage: 'Let’s meet at 6?',
    lastAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    unread: 2,
  },
  {
    id: '2',
    name: 'Priya Sharma',
    username: 'priya',
    avatar: 'https://i.pravatar.cc/100?img=5',
    lastMessage: 'Typing...',
    lastAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    unread: 0,
  },
  {
    id: '3',
    name: 'Team Hydra',
    username: 'hydra',
    avatar: 'https://i.pravatar.cc/100?img=11',
    lastMessage: 'Updated the doc.',
    lastAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    unread: 1,
  },
  {
    id: '4',
    name: 'Alex Johnson',
    username: 'alexj',
    avatar: 'https://i.pravatar.cc/100?img=1',
    lastMessage: 'Let’s meet at 6?',
    lastAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    unread: 2,
  },
  {
    id: '5',
    name: 'Alex Johnson',
    username: 'alexj',
    avatar: 'https://i.pravatar.cc/100?img=1',
    lastMessage: 'Let’s meet at 6?',
    lastAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    unread: 2,
  },
  {
    id: '6',
    name: 'Alex Johnson',
    username: 'alexj',
    avatar: 'https://i.pravatar.cc/100?img=1',
    lastMessage: 'Let’s meet at 6?',
    lastAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    unread: 2,
  },
  {
    id: '10',
    name: 'Alex Johnson',
    username: 'alexj',
    avatar: 'https://i.pravatar.cc/100?img=1',
    lastMessage: 'Let’s meet at 6?',
    lastAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    unread: 2,
  },
  {
    id: '10',
    name: 'Alex Johnson',
    username: 'alexj',
    avatar: 'https://i.pravatar.cc/100?img=1',
    lastMessage: 'Let’s meet at 6?',
    lastAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    unread: 2,
  },
  {
    id: '10',
    name: 'Alex Johnson',
    username: 'alexj',
    avatar: 'https://i.pravatar.cc/100?img=1',
    lastMessage: 'Let’s meet at 6?',
    lastAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    unread: 2,
  },
  {
    id: '10',
    name: 'Alex Johnson',
    username: 'alexj',
    avatar: 'https://i.pravatar.cc/100?img=1',
    lastMessage: 'Let’s meet at 6?',
    lastAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    unread: 2,
  },

];

const mockMessagesByChat = {
  '1': [
    { id: 'm1', fromMe: false, text: 'Hey!', at: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    { id: 'm2', fromMe: true, text: 'Hi Alex, what’s up?', at: new Date(Date.now() - 1000 * 60 * 60 * 23) },
    { id: 'm3', fromMe: false, text: 'Let’s meet at 6?', at: new Date(Date.now() - 1000 * 60 * 20) },
  ],
  '2': [
    { id: 'm1', fromMe: false, text: 'Can you review my PR?', at: new Date(Date.now() - 1000 * 60 * 60 * 10) },
    { id: 'm2', fromMe: true, text: 'On it!', at: new Date(Date.now() - 1000 * 60 * 60 * 9) },
  ],
  '3': [
    { id: 'm1', fromMe: false, text: 'Sprint planning at 3 PM.', at: new Date(Date.now() - 1000 * 60 * 60 * 36) },
    { id: 'm2', fromMe: true, text: 'Noted.', at: new Date(Date.now() - 1000 * 60 * 60 * 35) },
  ],
};

export default function ChatWindow() {
  const [chats, setChats] = useState(mockChats);
  const [activeId, setActiveId] = useState(chats?.id ?? null);
  const [messages, setMessages] = useState(mockMessagesByChat);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  const activeChat = useMemo(() => chats.find(c => c.id === activeId), [chats, activeId]);
  const activeMessages = messages[activeId] ?? [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeId, activeMessages.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !activeId) return;
    const newMsg = { id: crypto.randomUUID(), fromMe: true, text, at: new Date() };

    setMessages(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), newMsg],
    }));

    setChats(prev =>
      prev.map(c =>
        c.id === activeId
          ? { ...c, lastMessage: text, lastAt: newMsg.at.toISOString(), unread: 0 }
          : c
      )
    );
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* LEFT SIDEBAR */}
      <aside className="w-80 bg-white flex flex-col">
        {/* Current user */}
        <div className="p-4 ">
          <div className="flex items-center gap-3">
            <img
              className="w-10 h-10 rounded-full"
              src="https://i.pravatar.cc/100?img=15"
              alt="Current User"
            />
            <div>
              <div className="font-semibold text-gray-900">Current User(You)</div>
              <div className="text-xs text-gray-500">@me</div>
            </div>
          </div>
           <div className='flex justify-between px-2'>
                <h2 className="font-semibold text-gray-900">Chats</h2>
                <button className='text-xs text-emerald-500 hover:underline hover:cursor-pointer'>New chat</button>
            </div>  
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
           
            {/* New chat button (bottom) */}
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setActiveId(chat.id)}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition ${
                chat.id === activeId ? 'bg-emerald-50' : ''
              }`}
            >
              <img className="w-10 h-10 rounded-full" src={chat.avatar} alt={chat.name} />
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 truncate">{chat.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{formatChatTimestamp(chat.lastAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate">{chat.lastMessage}</span>
                  {chat.unread > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-xs bg-emerald-600 text-white">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        
      </aside>

      {/* RIGHT PANE */}
      <section className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center gap-3 px-4 shadow-2xl bg-white">
          {activeChat && (
            <>
              <img className="w-10 h-10 rounded-full" src={activeChat.avatar} alt={activeChat.name} />
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">{activeChat.name}</span>
                <span className="text-xs text-gray-500">@{activeChat.username}</span>
              </div>
            </>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-[#E7E7E7]">
          <div className="flex flex-col gap-2">
            {(activeMessages ?? []).map(m => (
              <div
                key={m.id}
                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                  m.fromMe
                    ? 'bg-emerald-600 text-white self-end rounded-br-sm'
                    : 'bg-white text-gray-900 self-start border rounded-bl-sm'
                }`}
                title={new Date(m.at).toLocaleString()}
              >
                <div className="whitespace-pre-wrap break-words">{m.text}</div>
                <div className={`mt-1 text-[10px] ${
                  m.fromMe ? 'text-emerald-100' : 'text-gray-400'
                }`}>
                  {formatChatTimestamp(m.at)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-3 bg-white ">
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Type a message"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleSend}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" className="fill-current">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
              Send
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
