import BookArtistsClient from './BookArtistsClient';

export function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { companyId: string } }) {
  return <BookArtistsClient params={params} />;
}
