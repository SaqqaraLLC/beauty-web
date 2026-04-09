'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ReviewForm from '@/components/reviews/ReviewForm';
import { useRouter } from 'next/navigation';
import type { ReviewableEntityType } from '@/lib/types';

function WriteReviewContent() {
  const params     = useSearchParams();
  const router     = useRouter();
  const entityType = params.get('entityType') as ReviewableEntityType | null;
  const entityId   = Number(params.get('entityId'));
  const bookingId  = params.get('bookingId') ? Number(params.get('bookingId')) : undefined;
  const name       = params.get('name') ?? '';

  if (!entityType || !entityId) {
    return (
      <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
        <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Invalid review link</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-saqqara-dark px-4 py-10">
      <div className="max-w-lg mx-auto space-y-8">
        <div className="text-center space-y-1">
          <p className="script text-saqqara-gold text-2xl">Share Your Experience</p>
          {name && <h1 className="text-xl font-cinzel tracking-[0.1em]">{name}</h1>}
          <p className="text-saqqara-light/35 text-xs mt-2">
            Your honest feedback helps the Saqqara community thrive
          </p>
        </div>

        <ReviewForm
          entityType={entityType}
          entityId={entityId}
          bookingId={bookingId}
          onSubmitted={() => setTimeout(() => router.back(), 1500)}
        />
      </div>
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen bg-saqqara-dark flex items-center justify-center">
          <p className="text-saqqara-light/30 text-xs font-cinzel tracking-[0.1em]">Loading…</p>
        </div>
      }>
        <WriteReviewContent />
      </Suspense>
    </>
  );
}
