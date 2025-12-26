'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MentorSidebar from '@/components/MentorSidebar';
import StudentSidebar from '@/components/StudentSidebar';
import ChatList from '@/components/Chat/ChatList';
import ChatWindow from '@/components/Chat/ChatWindow';

export default function ChatsPage() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const searchParams = useSearchParams();
  const chatIdParam = searchParams.get('chatId');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
            setRole(data.user.role);
        }
        setLoading(false);
      })
      .catch(err => {
          console.error(err);
          setLoading(false);
      });
  }, []);

  // Auto-select chat from param
  useEffect(() => {
      if (chatIdParam && !selectedChat) {
          // Handled by onChatsLoaded in ChatList
      }
  }, [chatIdParam]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar based on Role */}
      {role === 'MENTOR' && <MentorSidebar />}
      {role === 'STUDENT' && <StudentSidebar />}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Bar (Mobile potentially or Breadcrumbs) */}
          <div className="bg-white border-b border-gray-200 p-4 md:hidden">
              <h1 className="text-lg font-bold">My Chats</h1>
          </div>

          <div className="flex-1 flex overflow-hidden">
              {/* Chat List */}
              <div className={`w-full md:w-80 border-r border-gray-200 bg-white ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                  <ChatList 
                    onSelectChat={setSelectedChat} 
                    selectedChatId={selectedChat?.chatId || (chatIdParam ? parseInt(chatIdParam) : null)} 
                    refreshTrigger={selectedChat}
                    onChatsLoaded={(chats) => {
                        if (chatIdParam && !selectedChat) {
                            const target = chats.find(c => c.chatId === parseInt(chatIdParam));
                            if (target) setSelectedChat(target);
                        }
                    }}
                  />
              </div>

              {/* Chat Window */}
              <div className={`flex-1 flex flex-col bg-slate-50 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
                  {selectedChat ? (
                      <>
                        {/* Mobile Back Button */}
                        <div className="md:hidden bg-white p-2 border-b flex items-center">
                            <button onClick={() => setSelectedChat(null)} className="mr-2 text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <span className="font-semibold">{selectedChat.title}</span>
                        </div>
                        <ChatWindow 
                            chatId={selectedChat.chatId} 
                            title={selectedChat.title}
                            onMessageSent={() => {}} 
                        />
                      </>
                  ) : (
                      <div className="flex-1 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 8 9 8z" />
                              </svg>
                              <p>Select a chat to start messaging</p>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}
