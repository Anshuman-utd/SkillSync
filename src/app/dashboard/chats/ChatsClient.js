'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MentorSidebar from '@/components/MentorSidebar';
import StudentSidebar from '@/components/StudentSidebar';
import ChatList from '@/components/Chat/ChatList';
import ChatWindow from '@/components/Chat/ChatWindow';

export default function ChatsClient() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);

  const searchParams = useSearchParams();
  const chatIdParam = searchParams.get('chatId');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setRole(data.user.role);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {role === 'MENTOR' && <MentorSidebar />}
      {role === 'STUDENT' && <StudentSidebar />}

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          <div className={`w-full md:w-80 bg-white ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            <ChatList
              onSelectChat={setSelectedChat}
              selectedChatId={selectedChat?.chatId || (chatIdParam ? Number(chatIdParam) : null)}
              onChatsLoaded={(chats) => {
                if (chatIdParam && !selectedChat) {
                  const target = chats.find(c => c.chatId === Number(chatIdParam));
                  if (target) setSelectedChat(target);
                }
              }}
            />
          </div>

          <div className={`flex-1 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
            {selectedChat ? (
              <ChatWindow
                chatId={selectedChat.chatId}
                title={selectedChat.title}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-gray-400">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 8 9 8z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Your Messages</h3>
                <p className="max-w-xs text-center text-sm text-gray-500">Select a conversation from the sidebar to start chatting with your mentor or student.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
