"use client"
import React, { useEffect, useState } from 'react';

export default function AuthButtons() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    setTimeout(() => {
      setIsLoggedIn(!!token);
    }, 0);
  }, []);

  const handleLogout = async () => {
    try {
      // Call the logout API
      await fetch('/api/auth/logo1ut', {
        method: 'POST',
      });

      // Remove token from localStorage
      localStorage.removeItem('token');

      // Update state
      setIsLoggedIn(false);

      alert('Logged out successfully!');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <div>
      {isLoggedIn ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <>
          <button onClick={() => (window.location.href = '/login')}>Login</button>
          <button onClick={() => (window.location.href = '/signup')}>Signup</button>
        </>
      )}
    </div>
  );
}