'use client';
import { useState, useEffect } from 'react';

export default function ChatList({ onSelectChat, selectedChatId, refreshTrigger, onChatsLoaded }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chats');
      if (!res.ok) throw new Error('Failed to load chats');
      const data = await res.json();
      setChats(data.chats);
      if (onChatsLoaded) onChatsLoaded(data.chats);
    } catch (err) {
      console.error(err);
      setError('Could not load chats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [refreshTrigger]);

  if (loading) return <div className="p-4 text-center">Loading chats...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;
  if (chats.length === 0) return <div className="p-4 text-center text-gray-500">No active chats. Start a conversation from a mentor's profile!</div>;

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.chatId}
            onClick={() => onSelectChat(chat)}
            className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3 ${
              selectedChatId === chat.chatId ? 'bg-red-50 border-l-4 border-red-500' : ''
            }`}
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full flex-shrink-0 bg-gray-200 overflow-hidden">
                {chat.image ? (
                    <img src={chat.image} alt={chat.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500 bg-red-100">
                        {chat.title?.[0]?.toUpperCase()}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-gray-900 truncate pr-2">{chat.title}</h3>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {chat.subtitle && <p className="text-xs text-red-600 mb-0.5 font-medium truncate">{chat.subtitle}</p>}
                <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
