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

export type ApiFetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export const apiFetch: ApiFetcher = async (
  input,
  init = {},
) => {
  const headers = new Headers(init.headers);
  const token = getAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
};

export type AuthResponse = {
  access_token?: string;
  message?: string | string[];
};

export type AuthRequestResult = {
  ok: boolean;
  status: number;
  data: AuthResponse;
  errorMessage?: string;
};

export const getAuthMessage = (
  value?: string | string[],
) =>
  Array.isArray(value) ? value.join(" ") : value;

type AuthFetchOptions = {
  method?: "POST" | "PATCH";
  authenticated?: boolean;
};

export const authFetch = async (
  apiUrl: string,
  path: string,
  body: Record<string, string>,
  fallbackError: string,
  options: AuthFetchOptions = {},
): Promise<AuthRequestResult> => {
  const {
    method = "POST",
    authenticated = false,
  } = options;

  const requestInit: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };

  const response = authenticated
    ? await apiFetch(
        `${apiUrl}${path}`,
        requestInit,
      )
    : await fetch(
        `${apiUrl}${path}`,
        requestInit,
      );

  const rawBody = await response.text();

  if (!rawBody) {
    return {
      ok: response.ok,
      status: response.status,
      data: {},
      errorMessage: response.ok
        ? undefined
        : `${fallbackError} (HTTP ${response.status}).`,
    };
  }

  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("json")) {
    return {
      ok: false,
      status: response.status,
      data: {},
      errorMessage:
        `${fallbackError} Server returned a non-JSON response ` +
        `(HTTP ${response.status}).`,
    };
  }

  let data: AuthResponse;

  try {
    data = JSON.parse(rawBody) as AuthResponse;
  } catch {
    return {
      ok: false,
      status: response.status,
      data: {},
      errorMessage:
        `${fallbackError} Server returned invalid JSON ` +
        `(HTTP ${response.status}).`,
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data,
      errorMessage:
        getAuthMessage(data.message) ||
        `${fallbackError} (HTTP ${response.status}).`,
    };
  }

  return {
    ok: true,
    status: response.status,
    data,
  };
};