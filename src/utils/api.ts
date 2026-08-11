const TOKEN_KEY = "access_token";

export const getAccessToken = () => {
  return sessionStorage.getItem(TOKEN_KEY);
};

export const setAccessToken = (token: string) => {
  sessionStorage.setItem(TOKEN_KEY, token);
};

export const removeAccessToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
};
export const apiFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
) => {
  const headers = new Headers(init.headers);
  const token = getAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    removeAccessToken();
    window.location.reload();
  }

  return response;
};