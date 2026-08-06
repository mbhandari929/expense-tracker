const API_KEY= import.meta.env.VITE_API_KEY as 
 | string
 | undefined;

 export function apiFetch( 
    input : RequestInfo |URL,
 init : RequestInit ={}) {
  const headers = new Headers(init.headers);

  if (API_KEY) {
    headers.set("x-api-key", API_KEY);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}