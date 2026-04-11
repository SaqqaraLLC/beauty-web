import dynamic from 'next/dynamic';

const BookingDetailClient = dynamic(() => import('./BookingDetailClient'));

export function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { companyBookingId: string } }) {
  return <BookingDetailClient params={params} />;
}
