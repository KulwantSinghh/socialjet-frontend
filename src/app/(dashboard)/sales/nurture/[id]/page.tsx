import { Metadata } from 'next';
import styles from './page.module.css';
import { NurtureDetailData } from './NurtureDetailData';

export const metadata: Metadata = {
  title: 'Nurture Agent Detail | SocialJet CRM',
};

export default async function NurtureAgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className={styles.root}>
      <NurtureDetailData leadId={id} />
    </div>
  );
}
