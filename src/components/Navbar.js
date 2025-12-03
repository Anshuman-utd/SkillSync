'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

function InitialsAvatar({ name, image }) {
  if (image) {
    return (
      <img 
        src={image} 
        alt={name} 
        className="w-8 h-8 rounded-full object-cover border border-gray-200"
      />
    );
  }
  const initials = (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'U';
  return (
    <div className="w-8 h-8 rounded-full bg-red-400 text-white flex items-center justify-center font-semibold text-xs">
      {initials}
    </div>
  );
}

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Helper to load the current user
  const loadUser = async () => {
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
  };

  // Load on mount and whenever the pathname changes (e.g., after logout redirect)
  useEffect(() => {
    setLoading(true);
    loadUser();
  }, [pathname]);

  // Listen for auth change events (e.g., triggered by Logout)
  useEffect(() => {
    const handler = (e) => {
      const nextUser = e.detail?.user ?? null;
      setUser(nextUser);
      setLoading(false);
    };
    window.addEventListener('auth:changed', handler);
    return () => window.removeEventListener('auth:changed', handler);
  }, []);

  return (
    <nav className="w-full px-6 md:px-16 py-4 flex justify-between items-center bg-white sticky top-0 z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex justify-center items-center text-white font-bold text-xl shadow-md group-hover:shadow-lg transition-all">
          S
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">SkillSync</span>
      </Link>

      {/* Center Links */}
      <div className="hidden md:flex items-center gap-8">
        {[
            ['Courses', '/courses'],
            ['Mentors', '/mentors'],
            ['Resources', '/resources']
        ].map(([label, href]) => (
            <Link 
                key={href} 
                href={href} 
                className={`text-sm font-medium transition-colors ${
                    pathname === href ? 'text-red-500' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                {label}
            </Link>
        ))}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
        ) : user ? (
          <div className="flex items-center gap-4">
            <Link
              href={user.role === 'MENTOR' ? '/dashboard/mentor' : '/dashboard/student'}
              className="hidden md:block px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition shadow-sm hover:shadow"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
            >
              <span className="text-sm font-medium text-gray-700 pl-2 hidden sm:block">{user.name?.split(' ')[0]}</span>
              <InitialsAvatar name={user.name} image={user.image} />
            </Link>
            <div className="hidden md:block">
                <LogoutButton />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link 
                href="/login" 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
                Log in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 bg-red-500 text-white text-sm font-medium rounded-full hover:bg-red-600 transition shadow-md hover:shadow-lg shadow-red-200"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}