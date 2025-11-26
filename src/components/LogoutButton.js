'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      // Notify the app that auth has changed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:changed', { detail: { user: null } }));
      }
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
}

