const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'auth_user';

export function saveAuthData(tokenResponse) {
  if (tokenResponse.access_token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.access_token);
  }

  if (tokenResponse.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
  }

  if (tokenResponse.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(tokenResponse.user));
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getSavedUser() {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function clearAuthData() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
