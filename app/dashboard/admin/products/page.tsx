'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { apiGet, apiPost } from '@/lib/api';
import type { Product, ProductReview, ProductStatus } from '@/lib/types';

const STATUS_COLORS: Record<ProductStatus, string> = {
  Pending:  'rgba(245,158,11,0.15)',
  Approved: 'rgba(16,185,129,0.15)',
  Declined: 'rgba(239,68,68,0.15)',
};
const STATUS_TEXT: Record<ProductStatus, string> = {
  Pending:  'rgba(245,158,11,1)',
  Approved: 'rgba(16,185,129,1)',
  Declined: 'rgba(239,68,68,0.8)',
};

const CATEGORIES = ['All', 'Skincare', 'Haircare', 'Nails', 'Makeup', 'Tools', 'Lashes', 'Other'];

export default function AdminProductsPage() {
  const [products,    setProducts]    = useState<Product[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState<ProductStatus | 'All'>('All');
  const [category,    setCategory]    = useState('All');
  const [selected,    setSelected]    = useState<Product | null>(null);
  const [reviewNote,  setReviewNote]  = useState('');
  const [rating,      setRating]      = useState(5);
  const [submitting,  setSubmitting]  = useState(false);
  const [showAdd,     setShowAdd]     = useState(false);
  const [newProduct,  setNewProduct]  = useState({
    name: '', brand: '', category: 'Skincare', description: '',
    ingredients: '', vendorName: '%PURE', sku: '',
    wholesalePriceCents: 0,
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    apiGet('/api/products')
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }

  async function submitReview(recommendation: 'Approve' | 'Decline' | 'Neutral') {
    if (!selected) return;
    setSubmitting(true);
    try {
      await apiPost(`/api/products/${selected.productId}/reviews`, {
        rating,
        notes: reviewNote,
        recommendation,
      });
      // If approving/declining, also update product status
      if (recommendation !== 'Neutral') {
        await apiPost(`/api/products/${selected.productId}/status`, {
          status: recommendation === 'Approve' ? 'Approved' : 'Declined',
          declineReason: recommendation === 'Decline' ? reviewNote : undefined,
        });
      }
      setReviewNote('');
      setRating(5);
      setSelected(null);
      await load();
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  }

  async function addProduct() {
    setSubmitting(true);
    try {
      await apiPost('/api/products', newProduct);
      setShowAdd(false);
      setNewProduct({ name: '', brand: '', category: 'Skincare', description: '', ingredients: '', vendorName: '%PURE', sku: '', wholesalePriceCents: 0 });
      await load();
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  }

  const filtered = products.filter(p => {
    if (filter !== 'All' && p.status !== filter) return false;
    if (category !== 'All' && p.category !== category) return false;
    return true;
  });

  const counts = {
    Pending:  products.filter(p => p.status === 'Pending').length,
    Approved: products.filter(p => p.status === 'Approved').length,
    Declined: products.filter(p => p.status === 'Declined').length,
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="script text-saqqara-gold text-2xl">Product Standards</p>
              <p className="text-saqqara-light/40 text-xs font-cinzel tracking-[0.1em] mt-0.5">
                Curate and approve products used across all services
              </p>
            </div>
            <button onClick={() => setShowAdd(true)} className="btn btn-primary text-xs">
              + Add Product
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {(['All', 'Pending', 'Approved', 'Declined'] as const).slice(1).map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className="card text-center transition-all"
                style={{ borderColor: filter === s ? STATUS_TEXT[s] : undefined }}>
                <div className="text-lg font-bold" style={{ color: STATUS_TEXT[s] }}>{counts[s]}</div>
                <p className="text-saqqara-light/40 text-xs font-cinzel tracking-[0.08em]">{s}</p>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {(['All', 'Pending', 'Approved', 'Declined'] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className="px-3 py-1 rounded-full text-xs font-cinzel tracking-[0.08em] transition-all"
                style={{
                  background: filter === s ? 'rgba(201,168,76,0.12)' : 'transparent',
                  border: `0.5px solid ${filter === s ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: filter === s ? '#C9A84C' : 'rgba(237,237,237,0.35)',
                }}>
                {s}
              </button>
            ))}
            <div className="w-px mx-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className="px-3 py-1 rounded-full text-xs font-cinzel tracking-[0.08em] transition-all"
                style={{
                  background: category === c ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: `0.5px solid ${category === c ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}`,
                  color: category === c ? 'rgba(237,237,237,0.7)' : 'rgba(237,237,237,0.25)',
                }}>
                {c}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Loading…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">No products found</p>
              <p className="text-saqqara-light/20 text-xs mt-2">Add products or adjust filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(product => (
                <div key={product.productId} className="card flex items-center justify-between gap-4 hover:border-saqqara-gold/20 transition-all cursor-pointer"
                  onClick={() => setSelected(product)}>
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Image placeholder */}
                    <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.15)' }}>
                      {product.imageUrl
                        ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                        : <span className="text-saqqara-gold text-xs font-cinzel">{product.brand.charAt(0)}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light truncate">{product.name}</p>
                      <p className="text-saqqara-gold/50 text-xs mt-0.5">{product.brand} · {product.category}</p>
                      {product.vendorName && (
                        <p className="text-saqqara-light/25 text-xs">{product.vendorName}</p>
                      )}
                    </div>
                    {product.wholesalePriceCents > 0 && (
                      <div className="text-right flex-shrink-0 space-y-0.5">
                        <p className="text-saqqara-light/40 text-[0.6rem] font-cinzel">Wholesale</p>
                        <p className="text-saqqara-light/50 text-xs font-cinzel">${(product.wholesalePriceCents / 100).toFixed(2)}</p>
                        <p className="text-saqqara-gold text-xs font-cinzel">→ ${(product.billedPriceCents / 100).toFixed(2)}</p>
                        <p className="text-saqqara-light/30 text-[0.6rem] font-cinzel">Promo: ${(product.promoBilledPriceCents / 100).toFixed(2)}</p>
                      </div>
                    )}
                    {product.averageRating && product.averageRating > 0 && (
                      <div className="text-center flex-shrink-0">
                        <p className="text-saqqara-gold text-sm font-cinzel">{product.averageRating.toFixed(1)}</p>
                        <p className="text-saqqara-light/25 text-[0.6rem]">{product.reviewCount} reviews</p>
                      </div>
                    )}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-cinzel tracking-[0.06em] flex-shrink-0"
                    style={{ background: STATUS_COLORS[product.status], color: STATUS_TEXT[product.status], border: '0.5px solid rgba(255,255,255,0.05)' }}>
                    {product.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Detail / Review Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg card space-y-5 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-cinzel tracking-[0.08em] text-saqqara-light">{selected.name}</p>
                <p className="text-saqqara-gold/60 text-xs mt-0.5">{selected.brand} · {selected.category}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-saqqara-light/30 hover:text-saqqara-light text-lg">×</button>
            </div>

            {/* Details */}
            {selected.description && (
              <p className="text-saqqara-light/55 text-xs leading-relaxed">{selected.description}</p>
            )}
            {selected.ingredients && (
              <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)' }}>
                <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light/35 mb-1">Ingredients</p>
                <p className="text-saqqara-light/45 text-xs leading-relaxed">{selected.ingredients}</p>
              </div>
            )}

            {/* Existing Reviews */}
            {selected.reviews?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-cinzel tracking-[0.1em] text-saqqara-light/40 uppercase">Team Reviews</p>
                {selected.reviews.map(r => (
                  <div key={r.reviewId} className="rounded-2xl px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-cinzel text-saqqara-light/60">{r.reviewerName}</span>
                      <span className="text-xs text-saqqara-gold">{r.rating}/5</span>
                    </div>
                    {r.notes && <p className="text-saqqara-light/40 text-xs">{r.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Add Review */}
            {selected.status === 'Pending' && (
              <div className="space-y-3 pt-2" style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-cinzel tracking-[0.1em] text-saqqara-light/40 uppercase pt-2">Your Assessment</p>

                {/* Star Rating */}
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setRating(n)}
                      className="text-lg transition-all"
                      style={{ color: n <= rating ? '#C9A84C' : 'rgba(255,255,255,0.1)' }}>
                      ★
                    </button>
                  ))}
                  <span className="text-saqqara-light/30 text-xs ml-2 font-cinzel">{rating}/5</span>
                </div>

                <textarea
                  value={reviewNote}
                  onChange={e => setReviewNote(e.target.value)}
                  placeholder="Notes on quality, performance, safety, client feedback…"
                  rows={3}
                  className="w-full bg-saqqara-dark border border-saqqara-border rounded-2xl px-4 py-3 text-xs text-saqqara-light placeholder-saqqara-light/20 focus:outline-none focus:border-saqqara-gold/30 resize-none"
                />

                <div className="flex gap-3">
                  <button onClick={() => submitReview('Approve')} disabled={submitting}
                    className="flex-1 py-2 rounded-full text-xs font-cinzel tracking-[0.1em] disabled:opacity-40 transition-all"
                    style={{ background: 'rgba(16,185,129,0.15)', border: '0.5px solid rgba(16,185,129,0.3)', color: 'rgba(16,185,129,1)' }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => submitReview('Neutral')} disabled={submitting}
                    className="flex-1 py-2 rounded-full text-xs font-cinzel tracking-[0.1em] disabled:opacity-40 transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', color: 'rgba(237,237,237,0.5)' }}>
                    Neutral
                  </button>
                  <button onClick={() => submitReview('Decline')} disabled={submitting}
                    className="flex-1 py-2 rounded-full text-xs font-cinzel tracking-[0.1em] disabled:opacity-40 transition-all"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.25)', color: 'rgba(239,68,68,0.8)' }}>
                    ✗ Decline
                  </button>
                </div>
              </div>
            )}

            {selected.status !== 'Pending' && (
              <div className="text-center py-2">
                <span className="text-xs font-cinzel tracking-[0.08em]"
                  style={{ color: STATUS_TEXT[selected.status] }}>
                  {selected.status === 'Approved' ? '✓ Saqqara Approved Product' : '✗ Declined — Not permitted on platform'}
                </span>
                {selected.declineReason && (
                  <p className="text-saqqara-light/30 text-xs mt-1">{selected.declineReason}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg card space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <p className="font-cinzel tracking-[0.08em] text-saqqara-light">Add Product</p>
              <button onClick={() => setShowAdd(false)} className="text-saqqara-light/30 hover:text-saqqara-light text-lg">×</button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1">Product Name</label>
                <input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Vitamin C Serum" className="w-full bg-saqqara-dark border border-saqqara-border rounded-2xl px-4 py-2 text-xs text-saqqara-light placeholder-saqqara-light/20 focus:outline-none focus:border-saqqara-gold/30" />
              </div>
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1">Brand</label>
                <input value={newProduct.brand} onChange={e => setNewProduct(p => ({ ...p, brand: e.target.value }))}
                  placeholder="Brand name" className="w-full bg-saqqara-dark border border-saqqara-border rounded-2xl px-4 py-2 text-xs text-saqqara-light placeholder-saqqara-light/20 focus:outline-none focus:border-saqqara-gold/30" />
              </div>
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1">Vendor</label>
                <input value={newProduct.vendorName} onChange={e => setNewProduct(p => ({ ...p, vendorName: e.target.value }))}
                  placeholder="%PURE" className="w-full bg-saqqara-dark border border-saqqara-border rounded-2xl px-4 py-2 text-xs text-saqqara-light placeholder-saqqara-light/20 focus:outline-none focus:border-saqqara-gold/30" />
              </div>
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1">Category</label>
                <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-saqqara-dark border border-saqqara-border rounded-2xl px-4 py-2 text-xs text-saqqara-light focus:outline-none focus:border-saqqara-gold/30">
                  {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1">SKU</label>
                <input value={newProduct.sku} onChange={e => setNewProduct(p => ({ ...p, sku: e.target.value }))}
                  placeholder="Optional" className="w-full bg-saqqara-dark border border-saqqara-border rounded-2xl px-4 py-2 text-xs text-saqqara-light placeholder-saqqara-light/20 focus:outline-none focus:border-saqqara-gold/30" />
              </div>
              <div>
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1">Wholesale Price (¢)</label>
                <input
                  type="number" min={0}
                  value={newProduct.wholesalePriceCents}
                  onChange={e => setNewProduct(p => ({ ...p, wholesalePriceCents: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g. 2500 = $25.00"
                  className="w-full bg-saqqara-dark border border-saqqara-border rounded-2xl px-4 py-2 text-xs text-saqqara-light placeholder-saqqara-light/20 focus:outline-none focus:border-saqqara-gold/30" />
                {newProduct.wholesalePriceCents > 0 && (
                  <p className="text-saqqara-gold/50 text-xs mt-1 font-cinzel">
                    Standard: ${((newProduct.wholesalePriceCents * 1.8) / 100).toFixed(2)} · Promo: ${((newProduct.wholesalePriceCents * 1.6) / 100).toFixed(2)}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1">Description</label>
                <textarea value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                  rows={2} placeholder="What it does, who it's for…"
                  className="w-full bg-saqqara-dark border border-saqqara-border rounded-2xl px-4 py-2 text-xs text-saqqara-light placeholder-saqqara-light/20 focus:outline-none focus:border-saqqara-gold/30 resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-cinzel tracking-[0.08em] text-saqqara-light/40 mb-1">Key Ingredients</label>
                <textarea value={newProduct.ingredients} onChange={e => setNewProduct(p => ({ ...p, ingredients: e.target.value }))}
                  rows={2} placeholder="Active ingredients, allergens to note…"
                  className="w-full bg-saqqara-dark border border-saqqara-border rounded-2xl px-4 py-2 text-xs text-saqqara-light placeholder-saqqara-light/20 focus:outline-none focus:border-saqqara-gold/30 resize-none" />
              </div>
            </div>

            <button onClick={addProduct} disabled={submitting || !newProduct.name || !newProduct.brand}
              className="w-full btn btn-primary disabled:opacity-40">
              {submitting ? 'Adding…' : 'Submit for Review'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
