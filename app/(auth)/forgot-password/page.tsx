'use client';

import { useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7043';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // Always show success to prevent email enumeration
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-saqqara-dark flex items-center justify-center px-4">
        <div className="w-full max-w-md card text-center">
          <h1 className="text-3xl font-cinzel mb-4">Check Your Email</h1>
          <p className="text-saqqara-light/60 mb-8">
            If an account exists for <span className="text-saqqara-gold">{email}</span>,
            you will receive a password reset link shortly.
          </p>
          <Link href="/login" className="text-saqqara-gold hover:underline text-sm">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-saqqara-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md card">
        <h1 className="text-3xl font-cinzel mb-2">Reset Password</h1>
        <p className="text-saqqara-light/60 mb-8">
          Enter your email and we'll send you a reset link.
        </p>

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
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-saqqara-border">
          <p className="text-saqqara-light/60 text-sm">
            Remember your password?{' '}
            <Link href="/login" className="text-saqqara-gold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
