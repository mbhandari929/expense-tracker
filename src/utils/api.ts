const API_KEY = import.meta.env.VITE_API_KEY;

export const apiFetch = (
  input: RequestInfo | URL,
  init: RequestInit = {},
) => {
  const headers = new Headers(init.headers);

  if (API_KEY) {
    headers.set("X-API-Key", API_KEY);
  }

  return fetch(input, {
    ...init,
    headers,
  });
};