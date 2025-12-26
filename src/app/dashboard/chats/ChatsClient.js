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
          <div className={`w-full md:w-80 border-r bg-white ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
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
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a chat to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
