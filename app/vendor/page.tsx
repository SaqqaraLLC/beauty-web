'use client';

import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.saqqarallc.com';

const CATEGORIES = ['Skincare', 'Haircare', 'Nails', 'Makeup', 'Tools', 'Lashes', 'Other'];

type ProductStatus = 'Pending' | 'Approved' | 'Declined';

interface VendorProduct {
  productId: number;
  name: string;
  brand: string;
  category: string;
  description?: string;
  ingredients?: string;
  sku?: string;
  imageUrl?: string;
  wholesalePriceCents: number;
  billedPriceCents: number;
  promoBilledPriceCents: number;
  status: ProductStatus;
  declineReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}

const STATUS_STYLE: Record<ProductStatus, { label: string; bg: string; color: string; border: string }> = {
  Pending:  { label: 'Under Review', bg: '#fffdf0', color: '#92600a', border: '#e8a000' },
  Approved: { label: 'Approved ✓',  bg: '#f0fdf8', color: '#065f46', border: '#10b981' },
  Declined: { label: 'Not Accepted', bg: '#fff0f0', color: '#991b1b', border: '#ef4444' },
};

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const fmtD = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function VendorPortal() {
  const [token,    setToken]    = useState('');
  const [authed,   setAuthed]   = useState(false);
  const [authErr,  setAuthErr]  = useState('');
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading,  setLoading]  = useState(false);

  const [showForm, setShowForm]   = useState(false);
  const [editing,  setEditing]    = useState<VendorProduct | null>(null);
  const [submitting, setSub]      = useState(false);
  const [msg,      setMsg]        = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', brand: '', category: 'Skincare',
    description: '', ingredients: '',
    sku: '', imageUrl: '',
    wholesaleDollars: '',
  });

  const load = useCallback(async (t: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/vendor/products`, {
        headers: { 'X-Vendor-Token': t }
      });
      if (res.status === 401) { setAuthed(false); setAuthErr('Invalid token.'); return; }
      const data = await res.json();
      setProducts(data);
      setAuthed(true);
    } catch {
      setMsg('Failed to load products.');
    } finally { setLoading(false); }
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setAuthErr('');
    await load(token);
  }

  function openNew() {
    setEditing(null);
    setForm({ name: '', brand: '', category: 'Skincare', description: '', ingredients: '', sku: '', imageUrl: '', wholesaleDollars: '' });
    setMsg(null);
    setShowForm(true);
  }

  function openEdit(p: VendorProduct) {
    setEditing(p);
    setForm({
      name: p.name,
      brand: p.brand,
      category: p.category,
      description: p.description ?? '',
      ingredients: p.ingredients ?? '',
      sku: p.sku ?? '',
      imageUrl: p.imageUrl ?? '',
      wholesaleDollars: (p.wholesalePriceCents / 100).toFixed(2),
    });
    setMsg(null);
    setShowForm(true);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setSub(true);
    setMsg(null);
    try {
      const wholesale = Math.round(parseFloat(form.wholesaleDollars) * 100);
      if (isNaN(wholesale) || wholesale <= 0) { setMsg('Enter a valid wholesale price.'); return; }

      const body = {
        name: form.name, brand: form.brand, category: form.category,
        description: form.description || null,
        ingredients: form.ingredients || null,
        sku: form.sku || null,
        imageUrl: form.imageUrl || null,
        wholesalePriceCents: wholesale,
      };

      const url    = editing ? `${API}/api/vendor/products/${editing.productId}` : `${API}/api/vendor/products`;
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-Vendor-Token': token },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        setMsg(err.error ?? 'Submission failed.');
        return;
      }

      setMsg(editing ? '✓ Product updated.' : '✓ Product submitted for Saqqara review.');
      setShowForm(false);
      await load(token);
    } finally { setSub(false); }
  }

  const pending  = products.filter(p => p.status === 'Pending').length;
  const approved = products.filter(p => p.status === 'Approved').length;
  const declined = products.filter(p => p.status === 'Declined').length;

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#faf9f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Cinzel:wght@400;600&display=swap');`}</style>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', border: '0.5px solid #e8e0d0', borderRadius: 16, padding: '48px 40px', boxShadow: '0 4px 40px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 26, letterSpacing: '0.18em', color: '#1a1a1a' }}>Saqqara</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.45em', color: '#aaa', marginTop: 2, marginBottom: 20 }}>LLC</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.18em', color: '#888', textTransform: 'uppercase' }}>Vendor Portal</div>
          <div style={{ height: 1, background: 'linear-gradient(to right, transparent, #c9a84c, transparent)', margin: '16px 0 0' }} />
        </div>
        <form onSubmit={login}>
          <label style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>
            Access Token
          </label>
          <input
            type="password"
            required
            placeholder="Enter your vendor access token"
            value={token}
            onChange={e => setToken(e.target.value)}
            style={{ width: '100%', border: '0.5px solid #ddd', borderRadius: 8, padding: '12px 14px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fafaf8', boxSizing: 'border-box' }}
          />
          {authErr && <p style={{ color: '#dc2626', fontSize: 11, fontFamily: 'Cinzel, serif', marginTop: 8 }}>{authErr}</p>}
          <button type="submit"
            style={{ width: '100%', marginTop: 20, padding: '13px', background: '#1a1a1a', color: '#c9a84c', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Access Portal
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: 10, color: '#ccc', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em', marginTop: 24 }}>
          Contact k.stephen@saqqarallc.com for access
        </p>
      </div>
    </div>
  );

  // ── Main portal ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#faf9f6', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Cinzel:wght@400;600&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Header */}
      <div style={{ background: '#1a1a1a', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 18, letterSpacing: '0.2em', color: '#c9a84c' }}>Saqqara</span>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.35em', color: '#666', textTransform: 'uppercase' }}>Vendor Portal</span>
        </div>
        <button onClick={openNew}
          style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', background: 'rgba(201,168,76,0.12)', color: '#c9a84c', border: '0.5px solid rgba(201,168,76,0.35)', borderRadius: 6, padding: '8px 18px', cursor: 'pointer' }}>
          + Submit Product
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 20, letterSpacing: '0.12em', color: '#1a1a1a', marginBottom: 6 }}>Product Submissions</h1>
          <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8 }}>
            Submit products for Saqqara's review. Once approved, they will appear in the artist product catalog.
            Only Saqqara-approved products may be used during client services.
          </p>
        </div>

        {/* Message */}
        {msg && (
          <div style={{ padding: '12px 18px', borderRadius: 8, marginBottom: 24, fontSize: 12, fontFamily: 'Cinzel, serif', letterSpacing: '0.06em',
            background: msg.startsWith('✓') ? '#f0fdf8' : '#fff0f0',
            color: msg.startsWith('✓') ? '#065f46' : '#991b1b',
            border: `0.5px solid ${msg.startsWith('✓') ? '#10b981' : '#ef4444'}` }}>
            {msg}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Under Review', value: pending,  color: '#92600a', bg: '#fffdf0', border: '#e8a000' },
            { label: 'Approved',     value: approved, color: '#065f46', bg: '#f0fdf8', border: '#10b981' },
            { label: 'Not Accepted', value: declined, color: '#991b1b', bg: '#fff5f5', border: '#ef4444' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `0.5px solid ${s.border}`, borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 24, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: s.color, opacity: 0.7 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Product list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#bbb', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.15em' }}>Loading…</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', background: '#fff', border: '0.5px solid #e8e0d0', borderRadius: 12 }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: '#bbb', letterSpacing: '0.1em' }}>No products submitted yet</p>
            <p style={{ fontSize: 12, color: '#ccc', marginTop: 8 }}>Click "+ Submit Product" to add your first product</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {products.map(p => {
              const st = STATUS_STYLE[p.status];
              return (
                <div key={p.productId} style={{ background: '#fff', border: '0.5px solid #e8e0d0', borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>

                  {/* Image or initial */}
                  <div style={{ width: 52, height: 52, borderRadius: 10, background: '#fafaf6', border: '0.5px solid #e8e0d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontFamily: 'Cinzel, serif', fontSize: 16, color: '#c9a84c' }}>{p.brand.charAt(0)}</span>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.08em', color: '#1a1a1a', marginBottom: 2 }}>{p.name}</p>
                    <p style={{ fontSize: 11, color: '#999' }}>{p.brand} · {p.category}</p>
                    {p.sku && <p style={{ fontSize: 10, color: '#bbb', marginTop: 2 }}>SKU: {p.sku}</p>}
                    {p.status === 'Declined' && p.declineReason && (
                      <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4, fontStyle: 'italic' }}>Reason: {p.declineReason}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: '#1a1a1a' }}>{fmt(p.wholesalePriceCents)}</p>
                    <p style={{ fontSize: 10, color: '#999', marginTop: 2 }}>wholesale</p>
                    <p style={{ fontSize: 10, color: '#c9a84c', marginTop: 1 }}>{fmt(p.billedPriceCents)} retail</p>
                  </div>

                  {/* Status */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ display: 'inline-block', fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 20, background: st.bg, color: st.color, border: `0.5px solid ${st.border}` }}>
                      {st.label}
                    </span>
                    <p style={{ fontSize: 10, color: '#bbb', marginTop: 6 }}>{fmtD(p.submittedAt)}</p>
                    {p.reviewedAt && <p style={{ fontSize: 10, color: '#bbb' }}>Reviewed {fmtD(p.reviewedAt)}</p>}
                  </div>

                  {/* Edit (only pending) */}
                  {p.status === 'Pending' && (
                    <button onClick={() => openEdit(p)}
                      style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', color: '#aaa', border: '0.5px solid #ddd', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', flexShrink: 0 }}>
                      Edit
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Info notice */}
        <div style={{ marginTop: 40, padding: '20px 24px', background: '#fffdf5', border: '0.5px solid rgba(201,168,76,0.3)', borderRadius: 12, fontSize: 12, color: '#888', lineHeight: 1.8 }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 8 }}>How It Works</p>
          <p>1. Submit a product — it enters review with <strong>Under Review</strong> status.</p>
          <p>2. The Saqqara team evaluates it for quality, safety, and brand standards.</p>
          <p>3. If <strong>Approved</strong>, it appears immediately in the artist product catalog.</p>
          <p>4. If <strong>Not Accepted</strong>, you will see a reason and can resubmit with changes.</p>
          <p style={{ marginTop: 8, color: '#bbb' }}>Questions? Contact k.stephen@saqqarallc.com</p>
        </div>
      </div>

      {/* Submit / Edit Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50 }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', border: '0.5px solid #e8e0d0' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: '0.12em', color: '#1a1a1a' }}>
                {editing ? 'Edit Product' : 'Submit New Product'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: '#bbb', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {[
                { label: 'Product Name *', field: 'name' as const, placeholder: 'e.g. Vitamin C Brightening Serum', required: true },
                { label: 'Brand *',        field: 'brand' as const, placeholder: 'e.g. %PURE',                      required: true },
              ].map(({ label, field, placeholder, required }) => (
                <div key={field}>
                  <label style={labelStyle}>{label}</label>
                  <input required={required} value={form[field]} placeholder={placeholder}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    style={inputStyle} />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>SKU / Product Code</label>
                  <input value={form.sku} placeholder="Optional" onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Wholesale Price (USD) *</label>
                <input required type="number" min="0.01" step="0.01" value={form.wholesaleDollars}
                  placeholder="e.g. 18.50"
                  onChange={e => setForm(f => ({ ...f, wholesaleDollars: e.target.value }))}
                  style={inputStyle} />
                {form.wholesaleDollars && !isNaN(parseFloat(form.wholesaleDollars)) && (
                  <p style={{ fontSize: 11, color: '#c9a84c', marginTop: 4 }}>
                    Retail: ${(parseFloat(form.wholesaleDollars) * 1.8).toFixed(2)} · Promo: ${(parseFloat(form.wholesaleDollars) * 1.6).toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Product Description</label>
                <textarea rows={3} value={form.description} placeholder="What this product does and who it's ideal for…"
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              <div>
                <label style={labelStyle}>Key Ingredients / Formulation</label>
                <textarea rows={3} value={form.ingredients} placeholder="Active ingredients, allergens, key components…"
                  onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              <div>
                <label style={labelStyle}>Product Image URL</label>
                <input value={form.imageUrl} placeholder="https://…"
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  style={inputStyle} />
              </div>

              {msg && (
                <p style={{ fontSize: 11, fontFamily: 'Cinzel, serif', color: msg.startsWith('✓') ? '#065f46' : '#dc2626' }}>{msg}</p>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button type="submit" disabled={submitting}
                  style={{ flex: 1, padding: '13px', background: '#1a1a1a', color: '#c9a84c', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', borderRadius: 8, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? 'Submitting…' : editing ? 'Save Changes' : 'Submit for Review'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ padding: '13px 20px', background: 'transparent', color: '#999', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', border: '0.5px solid #ddd', borderRadius: 8, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'Cinzel, serif', fontSize: 8,
  letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginBottom: 6
};

const inputStyle: React.CSSProperties = {
  width: '100%', border: '0.5px solid #ddd', borderRadius: 8,
  padding: '10px 14px', fontSize: 13, fontFamily: "'Cormorant Garamond', Georgia, serif",
  outline: 'none', background: '#fafaf8', color: '#1a1a1a'
};
