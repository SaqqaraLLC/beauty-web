import dynamic from 'next/dynamic';

const BookingDetailClient = dynamic(() => import('./BookingDetailClient'), { ssr: false });

export function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { companyBookingId: string } }) {
  return <BookingDetailClient params={params} />;
}
