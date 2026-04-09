"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, getCurrentUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await getCurrentUser();

	if (user.status === "Pending") {
	  router.push("/pending");
	  return;
	}
	
	
	if (res.ok) {
	  router.push("/dashboard/admin");
	}


	  router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 400 }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Log in</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>

        {error && (
          <p style={{ color: "red", marginTop: 12 }}>{error}</p>
        )}
      </form>
    </main>
  );
}