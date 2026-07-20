export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin?: boolean;
}

export function saveAuth(token: string, user: any) {
  localStorage.setItem('bivax_token', token);
  // User is already mapped to camelCase by server
  localStorage.setItem('bivax_user', JSON.stringify(user));
  window.dispatchEvent(new Event('auth_change'));
}

export function clearAuth() {
  localStorage.removeItem('bivax_token');
  localStorage.removeItem('bivax_user');
  window.dispatchEvent(new Event('auth_change'));
}

export function getAuthToken() {
  return localStorage.getItem('bivax_token');
}

export function getAuthUser(): User | null {
  const user = localStorage.getItem('bivax_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}
