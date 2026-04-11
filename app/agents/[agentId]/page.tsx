import dynamic from 'next/dynamic';

const AgentPageClient = dynamic(() => import('./AgentPageClient'), { ssr: false });

export function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { agentId: string } }) {
  return <AgentPageClient params={params} />;
}
