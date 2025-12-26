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

  if (loading) return (
    <div className="flex flex-col gap-3 p-4">
        {[1,2,3].map(i => (
            <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        ))}
    </div>
  );

  if (error) return <div className="p-6 text-red-500 text-center text-sm">{error}</div>;
  
  if (chats.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 p-6 text-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 8 9 8z" />
        </svg>
        <p className="text-sm">No conversations yet.</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Messages</h2>
        <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{chats.length}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {chats.map((chat) => {
          const isSelected = selectedChatId === chat.chatId;
          return (
            <div
              key={chat.chatId}
              onClick={() => onSelectChat(chat)}
              className={`group px-4 py-4 cursor-pointer transition-all duration-200 border-b border-gray-50 hover:bg-gray-50 flex items-center gap-4 ${
                isSelected ? 'bg-red-50/60 hover:bg-red-50' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative">
                <div className={`w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 ${isSelected ? 'border-red-200' : 'border-transparent group-hover:border-gray-200'} transition-colors`}>
                    {chat.image ? (
                        <img src={chat.image} alt={chat.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center text-lg font-bold ${isSelected ? 'bg-red-200 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                            {chat.title?.[0]?.toUpperCase()}
                        </div>
                    )}
                </div>
                {/* Online Status Indicator (Mock) */}
                {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div> */}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex justify-between items-baseline">
                    <h3 className={`font-semibold truncate pr-2 text-sm ${isSelected ? 'text-red-900' : 'text-gray-900'}`}>
                        {chat.title}
                    </h3>
                    <span className={`text-[10px] whitespace-nowrap ${isSelected ? 'text-red-400' : 'text-gray-400'}`}>
                      {new Date(chat.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  {chat.subtitle && (
                      <p className="text-xs text-red-600 font-medium truncate">
                        {chat.subtitle}
                      </p>
                  )}
                  
                  <p className={`text-xs truncate ${isSelected ? 'text-red-700/70 font-medium' : 'text-gray-500'}`}>
                      {chat.lastMessage || <span className="italic opacity-50">No messages yet</span>}
                  </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
