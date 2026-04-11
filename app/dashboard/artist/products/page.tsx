'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { apiGet } from '@/lib/api';
import type { Product } from '@/lib/types';

const CATEGORIES = ['All', 'Skincare', 'Haircare', 'Nails', 'Makeup', 'Tools', 'Lashes', 'Other'];

export default function ArtistProductsPage() {
  const [products,  setProducts]  = useState<Product[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [category,  setCategory]  = useState('All');
  const [selected,  setSelected]  = useState<Product | null>(null);

  useEffect(() => {
    apiGet('/api/products?status=Approved')
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = category === 'All'
    ? products
    : products.filter(p => p.category === category);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-saqqara-dark px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center space-y-2">
            <p className="script text-saqqara-gold text-2xl">Saqqara Standards</p>
            <h1 className="font-cinzel tracking-[0.08em] text-saqqara-light">Approved Products</h1>
            <p className="text-saqqara-light/35 text-xs font-cinzel tracking-[0.06em] max-w-md mx-auto">
              Every product on this list has been reviewed and approved by the Saqqara team.
              Use only approved products on all client services.
            </p>
          </div>

          <div className="royal-divider" />

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className="px-3 py-1 rounded-full text-xs font-cinzel tracking-[0.08em] transition-all"
                style={{
                  background: category === c ? 'rgba(201,168,76,0.12)' : 'transparent',
                  border: `0.5px solid ${category === c ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: category === c ? '#C9A84C' : 'rgba(237,237,237,0.35)',
                }}>
                {c}
              </button>
            ))}
          </div>

          {/* Products */}
          {loading ? (
            <div className="flex justify-center py-16">
              <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Loading…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-saqqara-light/30 text-xs font-cinzel">No approved products in this category yet</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filtered.map(product => (
                <div key={product.productId}
                  onClick={() => setSelected(product)}
                  className="card cursor-pointer hover:border-saqqara-gold/25 transition-all group space-y-3">

                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: 'rgba(16,185,129,0.08)', border: '0.5px solid rgba(16,185,129,0.2)' }}>
                      {product.imageUrl
                        ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                        : <span className="text-green-400 text-xs font-cinzel">✓</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light group-hover:text-saqqara-gold transition-colors truncate">
                        {product.name}
                      </p>
                      <p className="text-saqqara-light/40 text-xs mt-0.5">{product.brand}</p>
                    </div>
                    <span className="text-[0.6rem] font-cinzel tracking-[0.06em] px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: 'rgba(16,185,129,0.1)', color: 'rgba(16,185,129,0.9)', border: '0.5px solid rgba(16,185,129,0.2)' }}>
                      {product.category}
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-saqqara-light/40 text-xs leading-relaxed line-clamp-2">{product.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-1"
                    style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-saqqara-light/25 text-xs">{product.vendorName || 'Saqqara Vendor'}</span>
                    {product.averageRating && product.averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-saqqara-gold text-xs">★</span>
                        <span className="text-saqqara-light/40 text-xs">{product.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Standard Notice */}
          <div className="card text-center space-y-2"
            style={{ background: 'rgba(201,168,76,0.03)', borderColor: 'rgba(201,168,76,0.12)' }}>
            <p className="text-saqqara-gold text-xs font-cinzel tracking-[0.1em]">✦ The Saqqara Standard</p>
            <p className="text-saqqara-light/40 text-xs leading-relaxed max-w-md mx-auto">
              Only Saqqara-approved products may be used during client services.
              This ensures consistency, safety, and the premium experience our clients expect.
              If you use a product not on this list, contact your coordinator.
            </p>
          </div>

        </div>
      </div>

      {/* Product Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md card space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-cinzel tracking-[0.08em] text-saqqara-light">{selected.name}</p>
                <p className="text-saqqara-gold/60 text-xs mt-0.5">{selected.brand} · {selected.category}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-saqqara-light/30 hover:text-saqqara-light text-lg">×</button>
            </div>

            {selected.description && (
              <p className="text-saqqara-light/55 text-xs leading-relaxed">{selected.description}</p>
            )}

            {selected.ingredients && (
              <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)' }}>
                <p className="text-xs font-cinzel tracking-[0.08em] text-saqqara-light/35 mb-1.5">Key Ingredients</p>
                <p className="text-saqqara-light/45 text-xs leading-relaxed">{selected.ingredients}</p>
              </div>
            )}

            {selected.vendorName && (
              <div className="flex justify-between text-xs py-2" style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)' }}>
                <span className="font-cinzel tracking-[0.08em] text-saqqara-light/35">Vendor</span>
                <span className="text-saqqara-light/60">{selected.vendorName}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 justify-center pt-1">
              <span className="text-green-400 text-xs">✓</span>
              <span className="text-xs font-cinzel tracking-[0.06em] text-green-400/80">Saqqara Approved</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
