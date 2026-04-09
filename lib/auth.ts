import { apiGet, apiPost } from "./api";

/**
 * Types (adjust later to match backend)
 */
export interface User {
  id: string;
  email: string;
  role: "Artist" | "Client" | "Location" | "Admin";
  status: "Pending" | "Approved" | "Rejected";
}

/**
 * Auth actions
 */
export async function login(email: string, password: string) {
  return apiPost("/auth/login", { email, password });
}

export async function register(data: {
  email: string;
  password: string;
  role: "Artist" | "Client" | "Location";
}) {
  return apiPost("/auth/register", data);
}

export async function logout() {
  return apiPost("/auth/logout");
}

export async function getCurrentUser(): Promise<User> {
  return apiGet("/auth/me");
}