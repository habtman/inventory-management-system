export function logout() {
  localStorage.removeItem('access_token');
  sessionStorage.removeItem('access_token');

  // Optional: clear other app state here
  window.location.href = '/login';
}
