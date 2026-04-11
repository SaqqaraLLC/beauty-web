import ArtistPageClient from './ArtistPageClient';

export function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { artistId: string } }) {
  return <ArtistPageClient params={params} />;
}
