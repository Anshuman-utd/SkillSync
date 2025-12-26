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
    <div className="flex flex-col h-full w-full bg-slate-50/50">
      {/* Header */}
      <div className="w-full px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{title}</h2>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
              <span className="text-xs text-gray-500 font-medium">{isConnected ? 'Online' : 'Reconnecting...'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="w-full flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center mt-20 opacity-40">
            <p className="text-gray-400">Say hello to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = currentUser && msg.senderId === currentUser.id;
            // Check if previous message was from same user for grouping
            const isSequence = idx > 0 && messages[idx - 1].senderId === msg.senderId;

            return (
              <div key={msg.id || idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div className={`flex max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2.5`}>

                  {/* Avatar (Only show for bottom of sequence or single message) */}
                  {!isMe && (
                    <div className={`w-8 h-8 flex-shrink-0 ${isSequence ? 'invisible' : ''}`}>
                      <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden ring-2 ring-white shadow-sm">
                        {msg.senderImage ? (
                          <img src={msg.senderImage} alt={msg.senderName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500 bg-gray-100">
                            {msg.senderName?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bubble */}
                  <div className="flex flex-col">
                    <div className={`px-4 py-2.5 shadow-sm text-[15px] leading-relaxed break-words ${isMe
                      ? 'bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl rounded-tr-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'
                      }`}>
                      {msg.content}
                    </div>
                    <div className={`text-[10px] mt-1 px-1 opacity-60 font-medium ${isMe ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="w-full p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleSendMessage} className="flex gap-3 w-full">
          <input
            type="text"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-gray-800 placeholder-gray-400"
            placeholder="Type your message..."
            value={newMessage}
            disabled={isSending}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className={`p-3 rounded-full shadow-md transition-all duration-200 flex-shrink-0 ${!newMessage.trim() || !isConnected
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:scale-105 active:scale-95'
              }`}
          >
            {isSending ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 translate-x-0.5 -translate-y-0.5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
