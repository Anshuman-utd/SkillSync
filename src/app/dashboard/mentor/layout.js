"use client";

import MentorSidebar from "@/components/MentorSidebar";

export default function MentorLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <MentorSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
