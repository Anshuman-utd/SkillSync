import { Suspense } from 'react';
import ChatsClient from './ChatsClient';

export default function ChatsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading chats...
        </div>
      }
    >
      <ChatsClient />
    </Suspense>
  );
}
