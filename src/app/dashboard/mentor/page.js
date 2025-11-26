'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MentorDashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">Please <Link href="/login" className="text-red-500">login</Link>.</div>;
  if (user.role !== 'MENTOR') return <div className="p-6">Access denied. This dashboard is for mentors.</div>;

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <h1 className="text-2xl font-semibold mb-4">Mentor Dashboard</h1>
      <p className="text-gray-700 mb-6">Welcome, {user.name}!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">My Students</h2>
          <p className="text-sm text-gray-600">Manage sessions and student progress.</p>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">Resources</h2>
          <p className="text-sm text-gray-600">Share guides and materials.</p>
        </div>
      </div>
    </div>
  );
}