import dynamic from 'next/dynamic';

const StreamViewerClient = dynamic(() => import('./StreamViewerClient'), { ssr: false });

export function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { streamId: string } }) {
  return <StreamViewerClient params={params} />;
}
