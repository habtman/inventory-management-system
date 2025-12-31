export type UserRole = 'admin' | 'manager';

interface TokenPayload {
  id: number;
  role: UserRole;
  exp: number;
}

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

export function getUserFromToken(): TokenPayload | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const user = getUserFromToken();
  if (!user) return false;
  return user.exp > Date.now() / 1000;
}

export function hasRole(roles: UserRole[]): boolean {
  const user = getUserFromToken();
  return !!user && roles.includes(user.role);
}
