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
    // Use new route with chatId
    fetch(`/api/chats/${chatId}`) 
      .then(res => {
        if (!res.ok) throw new Error('Failed to load messages');
        return res.json();
      })
      .then(data => {
        setMessages(data.messages || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [chatId]);

  // Socket Connection & Events
  useEffect(() => {
    if (!socket || !chatId) return;

    if (socket.connected) {
        onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      socket.emit('join-chat', { chatId });
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onReceiveMessage(message) {
      console.log("ChatWindow received message:", message, "Current chatId:", chatId);
      if (parseInt(message.chatId) === parseInt(chatId)) {
          setMessages(prev => [...prev, message]);
          if (onMessageSent) onMessageSent(); 
      } else {
        console.warn("Received message for different chat:", message.chatId);
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
  }, [socket, chatId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;
    
    socket.emit('send-message', { chatId, content: newMessage });
    setNewMessage('');
  };

  if (loading) return <div className="flex-1 flex items-center justify-center">Loading messages...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <div className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isConnected ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
            const isMe = currentUser && msg.senderId === currentUser.id;
            return (
                <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                        {/* Avatar */}
                        {!isMe && (
                           <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                               {msg.senderImage ? (
                                   <img src={msg.senderImage} alt={msg.senderName} className="w-full h-full object-cover" />
                               ) : (
                                   <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600 bg-red-200">
                                       {msg.senderName?.[0]?.toUpperCase()}
                                   </div>
                               )}
                           </div>
                        )}
                        
                        {/* Bubble */}
                        <div className={`p-3 rounded-2xl shadow-sm text-sm ${
                            isMe 
                            ? 'bg-red-500 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                        }`}>
                            <p>{msg.content}</p>
                            <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-red-100' : 'text-gray-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
