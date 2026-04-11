'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7043';

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') ?? '';
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password }),
      });

      if (!res.ok) {
        setError('Reset link is invalid or expired. Please request a new one.');
        return;
      }

      router.push('/login?reset=success');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!email || !token) {
    return (
      <div className="min-h-screen bg-saqqara-dark flex items-center justify-center px-4">
        <div className="w-full max-w-md card text-center">
          <h1 className="text-3xl font-cinzel mb-4">Invalid Link</h1>
          <p className="text-saqqara-light/60 mb-8">This reset link is invalid or has expired.</p>
          <Link href="/forgot-password" className="text-saqqara-gold hover:underline text-sm">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-saqqara-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md card">
        <h1 className="text-3xl font-cinzel mb-2">New Password</h1>
        <p className="text-saqqara-light/60 mb-8">Choose a strong password for your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={8}
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
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-saqqara-border">
          <p className="text-saqqara-light/60 text-sm">
            <Link href="/forgot-password" className="text-saqqara-gold hover:underline">
              Request a new link
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
