'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
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

  const isStudent = user.role === 'STUDENT';
  const roleLabel = isStudent ? 'Student' : 'Mentor';

  return (
    <div className="min-h-screen bg-white text-black p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">My Profile</h1>
      <p className="text-gray-600 mb-6">Role: {roleLabel}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">Basic Info</h2>
          <div className="text-sm text-gray-700 space-y-1">
            <p><span className="font-medium">Name:</span> {user.name}</p>
            <p><span className="font-medium">Email:</span> {user.email}</p>
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-2">{roleLabel} Details</h2>
          {isStudent ? (
            <div className="text-sm text-gray-700 space-y-1">
              <p>Bio: {user.student?.bio || '—'}</p>
              <p>Interests: {user.student?.interests || '—'}</p>
            </div>
          ) : (
            <div className="text-sm text-gray-700 space-y-1">
              <p>Bio: {user.mentor?.bio || '—'}</p>
              <p>Expertise: {user.mentor?.expertise || '—'}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <Link
          href={isStudent ? '/dashboard/student' : '/dashboard/mentor'}
          className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition"
        >
          Go to {roleLabel} Dashboard
        </Link>
      </div>
    </div>
  );
}