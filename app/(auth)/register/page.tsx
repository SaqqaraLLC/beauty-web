"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, type UserRole } from "@/lib/auth";

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: "Artist",   label: "Artist",   desc: "Showcase your work and accept bookings" },
  { value: "Client",   label: "Client",   desc: "Discover and book talented professionals" },
  { value: "Company",  label: "Company",  desc: "Book multiple artists for events & campaigns" },
  { value: "Agent",    label: "Agent",    desc: "Represent and manage a roster of artists" },
  { value: "Location", label: "Location", desc: "List your salon as a verified Saqqara location" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role,            setRole]            = useState<UserRole>("Artist");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [success,         setSuccess]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    setError(null);
    try {
      await register({ email, password, role });
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-saqqara-dark flex items-center justify-center px-4">
        <div className="w-full max-w-md card text-center">
          <div className="text-3xl mb-4">✦</div>
          <h1 className="text-xl font-cinzel mb-3 text-saqqara-gold">Application Submitted</h1>
          <p className="text-saqqara-light/50 text-sm mb-2">
            Your application is pending review. You will be notified once approved.
          </p>
          <p className="text-saqqara-light/30 text-xs">Redirecting to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-saqqara-dark flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="script text-saqqara-gold mb-1">Join Us</p>
          <h1 className="text-xl font-cinzel tracking-[0.12em]">Apply to Saqqara</h1>
          <p className="text-saqqara-light/40 text-xs mt-2">All applications require approval before activation</p>
        </div>

        <div className="card">
          {/* Role Selector */}
          <div className="mb-6">
            <label>I am applying as</label>
            <div className="grid grid-cols-1 gap-2 mt-1">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200"
                  style={{
                    border: role === r.value
                      ? '0.5px solid rgba(201,168,76,0.6)'
                      : '0.5px solid rgba(255,255,255,0.06)',
                    background: role === r.value
                      ? 'rgba(201,168,76,0.06)'
                      : 'transparent',
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 transition-all"
                    style={{
                      background: role === r.value ? '#C9A84C' : 'transparent',
                      border: role === r.value ? 'none' : '0.5px solid rgba(255,255,255,0.2)',
                    }}
                  />
                  <div>
                    <span className="font-cinzel text-xs tracking-[0.1em] text-saqqara-light">
                      {r.label}
                    </span>
                    <p className="text-saqqara-light/35 text-xs mt-0.5">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <hr className="royal-divider" />

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4 mt-5">
            <div>
              <label htmlFor="email">Email Address</label>
              <input
                id="email" type="email" required
                placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password" type="password" required
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword" type="password" required
                placeholder="••••••••"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-2xl px-4 py-3 text-xs text-red-300"
                style={{ background: 'rgba(127,29,29,0.2)', border: '0.5px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
              {loading ? "Submitting…" : "Submit Application"}
            </button>
          </form>

          <div className="mt-6 text-center" style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
            <p className="text-saqqara-light/30 text-xs">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-saqqara-gold hover:text-saqqara-gold-soft transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
