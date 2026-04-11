import StreamViewerClient from './StreamViewerClient';

export function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { streamId: string } }) {
  return <StreamViewerClient params={params} />;
}
