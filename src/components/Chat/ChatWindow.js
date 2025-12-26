'use client';
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';

export default function ChatWindow({ chatId, title, onMessageSent }) {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // Fetch Current User
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setCurrentUser(data.user))
      .catch(err => console.error(err));
  }, []);

  // Fetch History
  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    setMessages([]); // Clear previous messages while loading

    fetch(`/api/chats/${chatId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load messages');
        return res.json();
      })
      .then(data => {
        setMessages(data.messages || []);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [chatId]);

  // Socket Connection & Events
  useEffect(() => {
    if (!socket) return;

    if (socket.connected) {
      setIsConnected(true);
      if (chatId) socket.emit('join-chat', { chatId });
    }

    function onConnect() {
      setIsConnected(true);
      if (chatId) socket.emit('join-chat', { chatId });
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onReceiveMessage(message) {
      // console.log("ChatWindow received message:", message, "Current chatId:", chatId);
      if (parseInt(message.chatId) === parseInt(chatId)) {
        setMessages(prev => [...prev, message]);
        if (onMessageSent) onMessageSent();
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive-message', onReceiveMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive-message', onReceiveMessage);
    };
  }, [socket, chatId, onMessageSent]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !isConnected) return;

    const tempId = Date.now();
    const content = newMessage.trim();

    // Optimistic Update can be tricky if we don't know the full user object yet, 
    // but we can try if we really want "instant" feel. 
    // For now, let's rely on server echo for consistency or implement robust optimistic UI later.
    // We will just clear input and wait.

    setIsSending(true);
    socket.emit('send-message', { chatId, content }, (ack) => {
      // Optional acknowledgement callback if server supports it
      setIsSending(false);
    });
    setNewMessage('');

    // Fallback: reset sending state after 2s if no ack (though socket.emit usually doesn't block)
    setTimeout(() => setIsSending(false), 2000);
  };

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      <p className="text-gray-400 text-sm">Loading conversation...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#fdfdfd]">
      {/* Premium Header */}
      <div className="w-full px-6 py-3 border-b border-gray-100 bg-white flex justify-between items-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] sticky top-0 z-10 font-sans">
        <div className="flex items-center gap-4">
          {/* Header Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-100 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500 bg-gray-100">
                {title?.[0]?.toUpperCase()}
              </div>
            </div>
            {isConnected && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
          </div>

          <div className="flex flex-col">
            <h2 className="text-base font-bold text-gray-800 leading-tight">{title}</h2>
            <span className={`text-xs font-medium ${isConnected ? 'text-green-500' : 'text-gray-400'}`}>
              {isConnected ? 'Active now' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area - with subtle background pattern or texture if desired, keeping clean for now */}
      <div className="w-full flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-2 custom-scrollbar bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-60 space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">👋</div>
            <p className="text-gray-400 text-sm font-medium">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = currentUser && msg.senderId === currentUser.id;
            // Check if previous message was from same user for grouping spacing
            const isSequence = idx > 0 && messages[idx - 1].senderId === msg.senderId;

            return (
              <div key={msg.id || idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group ${isSequence ? 'mt-0.5' : 'mt-4'}`}>
                <div className={`flex max-w-[80%] md:max-w-[65%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>

                  {/* Avatar for Incoming Messages */}
                  {!isMe && (
                    <div className={`w-8 h-8 flex-shrink-0 ${isSequence ? 'invisible' : 'mb-1'}`}>
                      <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden ring-1 ring-gray-100 shadow-sm">
                        {msg.senderImage ? (
                          <img src={msg.senderImage} alt={msg.senderName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500 bg-gray-100">
                            {msg.senderName?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`relative px-4 py-2 shadow-sm text-[15px] leading-relaxed break-words 
                                ${isMe
                      ? 'bg-gradient-to-br from-[#ef4444] to-[#dc2626] text-white rounded-2xl rounded-tr-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'
                    }
                            `}>
                    {msg.content}

                    {/* Timestamp & Status Check */}
                    <div className={`text-[9px] mt-1 flex items-center gap-1 opacity-80 ${isMe ? 'justify-end text-red-100' : 'justify-start text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isMe && <span>✓</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Modern Input Bar */}
      <div className="w-full p-4 bg-white border-t border-gray-50">
        <form onSubmit={handleSendMessage} className="flex gap-2 w-full max-w-5xl mx-auto items-end bg-gray-50 border border-gray-200 rounded-[24px] px-2 py-2 focus-within:ring-2 focus-within:ring-red-100 focus-within:border-red-300 transition-all shadow-sm">

          {/* Optional Attachment Icon (Visual only for now) */}
          <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-200/50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>

          <input
            type="text"
            className="flex-1 bg-transparent border-none focus:ring-0 px-2 py-2.5 text-gray-800 placeholder-gray-400 sm:text-sm"
            placeholder="Message..."
            value={newMessage}
            disabled={isSending}
            onChange={(e) => setNewMessage(e.target.value)}
          />

          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className={`p-2.5 rounded-full transition-all duration-300 flex-shrink-0 mb-0.5 ${!newMessage.trim() || !isConnected
                ? 'text-gray-300 bg-transparent'
                : 'bg-red-600 text-white shadow-md hover:bg-red-700 hover:scale-105 active:scale-95'
              }`}
          >
            {isSending ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
