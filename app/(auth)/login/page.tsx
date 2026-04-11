'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7043';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.code === 'LOCKED_OUT' ? 'Account locked. Try again in 15 minutes.' : 'Invalid email or password');
      }

      const data = await res.json();
      if (data.requiresMfa) {
        setRequiresMfa(true);
        return;
      }

      // Get user role and redirect to the right dashboard
      const meRes = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include'
      });

      if (meRes.ok) {
        const me = await meRes.json();
        const role: string = (me.roles?.[0] ?? me.role ?? '').toLowerCase();
        const dashboardMap: Record<string, string> = {
          admin:    '/dashboard/admin',
          staff:    '/dashboard/admin',
          director: '/dashboard/admin',
          artist:   '/dashboard/artist',
          company:  '/dashboard/company',
          agent:    '/dashboard/agent',
          location: '/dashboard/location',
          client:   '/artists',
        };
        router.push(dashboardMap[role] ?? '/');
      } else {
        setError('Could not verify user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/mfa/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: mfaCode })
      });

      if (!res.ok) {
        throw new Error('Invalid MFA code');
      }

      // Re-use same role-based redirect after MFA
      const meRes = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
      if (meRes.ok) {
        const me = await meRes.json();
        const role: string = (me.roles?.[0] ?? me.role ?? '').toLowerCase();
        const dashboardMap: Record<string, string> = {
          admin: '/dashboard/admin', staff: '/dashboard/admin', director: '/dashboard/admin',
          artist: '/dashboard/artist', company: '/dashboard/company',
          agent: '/dashboard/agent', location: '/dashboard/location', client: '/artists',
        };
        router.push(dashboardMap[role] ?? '/');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MFA verification failed');
    } finally {
      setLoading(false);
    }
  }

  if (requiresMfa) {
    return (
      <div className="min-h-screen bg-saqqara-dark flex items-center justify-center px-4">
        <div className="w-full max-w-md card">
          <h1 className="text-3xl font-cinzel mb-6">Two-Factor Authentication</h1>
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div>
              <label htmlFor="mfaCode">Enter your authenticator code</label>
              <input
                id="mfaCode"
                type="text"
                placeholder="000000"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                disabled={loading}
                required
              />
            </div>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-saqqara-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md card">
        <h1 className="text-3xl font-cinzel mb-2">Welcome Back</h1>
        <p className="text-saqqara-light/60 mb-8">Sign in to your Saqqara account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/30 text-red-300 border border-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-primary w-full"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-saqqara-border">
          <p className="text-saqqara-light/60 text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-saqqara-gold hover:underline">
              Sign up
            </Link>
          </p>
          <p className="text-saqqara-light/60 text-sm mt-4">
            <Link href="/forgot-password" className="text-saqqara-gold hover:underline">
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
