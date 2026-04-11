import dynamic from 'next/dynamic';

const StreamViewerClient = dynamic(() => import('./StreamViewerClient'));

export function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { streamId: string } }) {
  return <StreamViewerClient params={params} />;
}
