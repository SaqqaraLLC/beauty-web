import dynamic from 'next/dynamic';

const CompanyPageClient = dynamic(() => import('./CompanyPageClient'), { ssr: false });

export function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { companyId: string } }) {
  return <CompanyPageClient params={params} />;
}
