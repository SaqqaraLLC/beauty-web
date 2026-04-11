import BookingDetailClient from './BookingDetailClient';

export function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { companyBookingId: string } }) {
  return <BookingDetailClient params={params} />;
}
