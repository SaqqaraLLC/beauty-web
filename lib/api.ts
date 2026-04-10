const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://localhost:7043";

/**
 * Low-level API wrapper
 */
async function request(
  path: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API request failed");
  }

  return res.json();
}

/**
 * HTTP helpers
 */
export function apiGet(path: string) {
  return request(path);
}

export function apiPost(path: string, body?: unknown) {
  return request(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPut(path: string, body?: unknown) {
  return request(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete(path: string) {
  return request(path, { method: "DELETE" });
}

