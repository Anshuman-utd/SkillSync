'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import LogoutButton from '@/components/LogoutButton';

function InitialsAvatar({ name }) {
  const initials = (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'U';
  return (
    <div className="w-8 h-8 rounded-full bg-red-400 text-white flex items-center justify-center font-semibold">
      {initials}
    </div>
  );
}

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return (
    <nav className="w-full px-6 md:px-10 py-4 flex justify-between items-center shadow-sm bg-white sticky top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-red-400 rounded-lg flex justify-center items-center text-white font-bold text-xl">
          S
        </div>
        <Link href="/" className="text-xl font-semibold">SkillSync</Link>
      </div>

      {/* Center Links */}
      <div className="hidden md:flex gap-8 text-gray-700 font-medium">
        <Link href="/courses">Courses</Link>
        <Link href="/mentors">Mentors</Link>
        <Link href="/resources">Resources</Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="text-sm text-gray-600">Loading...</div>
        ) : user ? (
          <>
            <Link
              href={user.role === 'MENTOR' ? '/dashboard/mentor' : '/dashboard/student'}
              className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <InitialsAvatar name={user.name} />
              <span className="text-gray-800">{user.name}</span>
            </Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-800 hover:text-black">Login</Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}