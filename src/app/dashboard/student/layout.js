"use client";

import StudentSidebar from "@/components/StudentSidebar";

export default function StudentLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
