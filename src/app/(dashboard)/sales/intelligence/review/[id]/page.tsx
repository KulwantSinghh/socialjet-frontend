import { Metadata } from 'next';
import { IntelligenceReviewData } from './IntelligenceReviewData';

export const metadata: Metadata = {
  title: 'Leads Intelligence Review | SocialJet CRM',
};

export default async function IntelligenceReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <IntelligenceReviewData callId={id} />;
}
