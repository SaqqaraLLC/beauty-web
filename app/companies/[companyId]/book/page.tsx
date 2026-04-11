import dynamic from 'next/dynamic';

const BookArtistsClient = dynamic(() => import('./BookArtistsClient'));

export function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { companyId: string } }) {
  return <BookArtistsClient params={params} />;
}
