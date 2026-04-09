import { apiGet, apiPost } from "./api";

export type UserRole = "Artist" | "Client" | "Location" | "Admin" | "Company" | "Agent";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: "Pending" | "Approved" | "Rejected";
  artistId?: number;
  companyId?: number;
  agentId?: number;
}

export async function login(email: string, password: string) {
  return apiPost("/auth/login", { email, password });
}

export async function register(data: {
  email: string;
  password: string;
  role: UserRole;
}) {
  return apiPost("/auth/register", data);
}

export async function logout() {
  return apiPost("/auth/logout");
}

export async function getCurrentUser(): Promise<User> {
  return apiGet("/auth/me");
}
