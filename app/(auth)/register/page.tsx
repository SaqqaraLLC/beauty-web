"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";

type Role = "Artist" | "Client" | "Location";

export default function RegisterPage() {
  

  
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [role, setRole] = useState<Role>("Artist");
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    
	try {
	  await register({ email, password, role });
	  setSuccess(true);
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }
  if (success) {
  return (
    <main style={{ padding: 40, maxWidth: 420 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>
        Application Submitted ✅
      </h1>

      <p style={{ marginBottom: 20 }}>
        Your application has been received and is pending approval.
        You will be able to log in once it has been approved.
      </p>

      <button onClick={() => router.push("/login")}>
        Go to Login
      </button>
    </main>
  );
}

  return (
    <main style={{ padding: 40, maxWidth: 420 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>
        Apply to Saqqara
      </h1>

      <p style={{ marginBottom: 24 }}>
        Create an account to apply for access. All applications
        require approval before activation.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Confirm Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label>Apply as</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="Artist">Artist</option>
            <option value="Client">Client</option>
            <option value="Location">Location</option>
          </select>
        </div>

        <button disabled={loading}>
          {loading ? "Submitting..." : "Submit Application"}
        </button>

        {error && (
          <p style={{ marginTop: 12, color: "red" }}>{error}</p>
        )}
      </form>
    </main>
  );
}