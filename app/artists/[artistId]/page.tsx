import dynamic from 'next/dynamic';

const ArtistPageClient = dynamic(() => import('./ArtistPageClient'), { ssr: false });

export function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { artistId: string } }) {
  return <ArtistPageClient params={params} />;
}
