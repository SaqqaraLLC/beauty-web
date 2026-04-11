import dynamic from 'next/dynamic';

const BookArtistsClient = dynamic(() => import('./BookArtistsClient'), { ssr: false });

export function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { companyId: string } }) {
  return <BookArtistsClient params={params} />;
}
