// Client-side auth utilities

export async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }
  
  return data;
}

export async function signup(name, email, password) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Signup failed');
  }
  
  return data;
}

export async function logout() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Logout failed');
  }
  
  return data;
}

export async function getCurrentUser() {
  const response = await fetch('/api/auth/me');
  
  if (!response.ok) {
    return null;
  }
  
  const data = await response.json();
  return data.user;
}

