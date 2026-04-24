'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGet, apiPost } from '@/lib/api';
import type { CompanyInvoice } from '@/lib/types';
import Navbar from '@/components/Navbar';

type FormState = {
  cardholderName: string;
  email: string;
  phone: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  streetAddress: string;
  zipCode: string;
};

function formatCardNumber(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

function detectBrand(cardNumber: string): string {
  if (/^4/.test(cardNumber)) return 'Visa';
  if (/^5[1-5]/.test(cardNumber)) return 'Mastercard';
  if (/^3[47]/.test(cardNumber)) return 'Amex';
  if (/^6(?:011|5)/.test(cardNumber)) return 'Discover';
  return 'Unknown';
}

export default function PayInvoicePage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();

  const [invoice,    setInvoice]  = useState<CompanyInvoice | null>(null);
  const [loading,    setLoading]  = useState(true);
  const [submitting, setSub]      = useState(false);
  const [error,      setError]    = useState<string | null>(null);
  const [success,    setSuccess]  = useState(false);

  const [form, setForm] = useState<FormState>({
    cardholderName: '',
    email:          '',
    phone:          '',
    cardNumber:     '',
    cardExpiry:     '',
    cardCvc:        '',
    streetAddress:  '',
    zipCode:        '',
  });

  useEffect(() => {
    apiGet(`/api/invoices/${id}`)
      .then(setInvoice)
      .catch(() => setError('Invoice not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(field: keyof FormState, raw: string) {
    let value = raw;
    if (field === 'cardNumber') value = formatCardNumber(raw);
    if (field === 'cardExpiry') value = formatExpiry(raw);
    if (field === 'cardCvc')    value = raw.replace(/\D/g, '').slice(0, 4);
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!invoice) return;
    setError(null);
    setSub(true);

    try {
      const rawNumber = form.cardNumber.replace(/\s/g, '');
      const brand     = detectBrand(rawNumber);

      // Parse MM/YY → separate month (int) and 4-digit year (int)
      const [mm, yy]        = form.cardExpiry.split('/');
      const expirationMonth = parseInt(mm, 10);
      const expirationYear  = 2000 + parseInt(yy ?? '0', 10);

      if (!expirationMonth || expirationMonth < 1 || expirationMonth > 12) {
        setError('Invalid expiry month.');
        return;
      }

      await apiPost('/api/payments/charge', {
        bookingId:       invoice.companyBookingId ?? null,
        payerEmail:      form.email,
        payerName:       form.cardholderName,
        payerPhone:      form.phone || null,
        nameOnCard:      form.cardholderName,
        cardNumber:      rawNumber,
        expirationMonth: expirationMonth,
        expirationYear:  expirationYear,
        streetAddress:   form.streetAddress || null,
        zipCode:         form.zipCode || null,
        cardBrand:       brand,
        amountCents:     invoice.totalCents,
        description:     `Invoice ${invoice.invoiceNumber}`,
      });

      setSuccess(true);
      setTimeout(() => router.push('/dashboard/company?tab=invoices'), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(msg);
    } finally {
      setSub(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
          <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Loading…</p>
        </div>
      </>
    );
  }

  if (!invoice) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
          <p className="text-red-400 text-xs font-cinzel">Invoice not found.</p>
        </div>
      </>
    );
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
          <div className="card max-w-sm w-full text-center space-y-4">
            <div className="text-3xl">✓</div>
            <p className="script text-saqqara-gold text-2xl">Payment Successful</p>
            <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light/50">
              {invoice.invoiceNumber} — ${(invoice.totalCents / 100).toFixed(2)} paid
            </p>
            <p className="text-xs text-saqqara-light/30">Redirecting…</p>
          </div>
        </div>
      </>
    );
  }

  const total = (invoice.totalCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-md mx-auto space-y-6">

          <Link href="/dashboard/company" className="text-xs font-cinzel text-saqqara-light/35 hover:text-saqqara-gold transition-colors">
            ← Back to Dashboard
          </Link>

          {/* Invoice Summary */}
          <div className="card space-y-3">
            <p className="script text-saqqara-gold text-xl">Secure Checkout</p>
            <div className="flex justify-between text-xs"
              style={{ borderBottom: '0.5px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
              <span className="font-cinzel tracking-[0.08em] text-saqqara-light/40">Invoice</span>
              <span className="text-saqqara-light/70">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-cinzel text-xs tracking-[0.08em] text-saqqara-light/40">Total Due</span>
              <span className="text-saqqara-gold font-cinzel text-lg">${total}</span>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="card space-y-4">
            <h2 className="font-cinzel text-xs tracking-[0.1em] text-saqqara-light/60 uppercase">
              Card Details
            </h2>

            {/* Cardholder Name */}
            <div>
              <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">
                Cardholder Name
              </label>
              <input
                type="text"
                required
                placeholder="Jane Smith"
                value={form.cardholderName}
                onChange={e => handleChange('cardholderName', e.target.value)}
                className="input w-full"
              />
            </div>

            {/* Billing Email */}
            <div>
              <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">
                Billing Email
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                className="input w-full"
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">
                Card Number
              </label>
              <input
                type="text"
                required
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                value={form.cardNumber}
                onChange={e => handleChange('cardNumber', e.target.value)}
                className="input w-full font-mono"
              />
            </div>

            {/* Expiry + CVC */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">
                  Expiry
                </label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={form.cardExpiry}
                  onChange={e => handleChange('cardExpiry', e.target.value)}
                  className="input w-full font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1.5">
                  CVC
                </label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder="123"
                  value={form.cardCvc}
                  onChange={e => handleChange('cardCvc', e.target.value)}
                  className="input w-full font-mono"
                />
              </div>
            </div>

            {/* Billing Address (optional) */}
            <div className="pt-2" style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-cinzel text-xs tracking-[0.1em] text-saqqara-light/40 uppercase mb-3">
                Billing Address <span className="text-saqqara-light/20 normal-case">(optional)</span>
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Street address"
                  value={form.streetAddress}
                  onChange={e => handleChange('streetAddress', e.target.value)}
                  className="input w-full"
                />
                <input
                  type="text"
                  placeholder="ZIP code"
                  value={form.zipCode}
                  onChange={e => handleChange('zipCode', e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-cinzel py-2 px-3 rounded"
                style={{ background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.2)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full"
              style={{ opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Processing…' : `Pay $${total}`}
            </button>

            <p className="text-center text-xs text-saqqara-light/20 font-cinzel tracking-[0.06em]">
              Secured by Authvia · Powered by Worldpay
            </p>
          </form>

        </div>
      </div>
    </>
  );
}
