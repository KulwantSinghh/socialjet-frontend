import { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';
import { StatsCard } from '@/components/shared/StatsCard';

export const metadata: Metadata = {
  title: 'Nurture Agent Detail | SocialJet CRM',
};

// Icons (reusing or simple SVGs)
const MessagesIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6C63FF"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const TouchesIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6C63FF"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#22C55E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default async function NurtureAgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Mock data lookup based on ID
  const agentMap: Record<string, { brand: string; contact: string }> = {
    '1': { brand: 'Nykaa Beauty', contact: 'Priya Sharma' },
    '2': { brand: 'Mamaearth', contact: 'Ghazal Alagh' },
    '3': { brand: 'Mamaearth', contact: 'Ghazal Alagh' },
    '4': { brand: 'Nykaa Beauty', contact: 'Priya Sharma' },
    '5': { brand: 'Wow Skin Science', contact: 'Karan Bajaj' },
  };

  const agent = agentMap[id] || { brand: 'Nurture Agent', contact: 'Unknown' };

  return (
    <div className={styles.root}>
      {/* Breadcrumbs & Header */}
      <div className={styles.header}>
        <div className={styles.topInfo}>
          <div className={styles.breadcrumbs}>
            <Link href="/sales/nurture">Back</Link> / <span>{agent.brand}</span>
          </div>
          <h1 className={styles.title}>{agent.brand}</h1>
        </div>

        <div className={styles.mainGrid}>
          {/* Info Side */}
          <div className={styles.infoCol}>
            <div className={styles.tags}>
              <span className={styles.tagHot}>Hot Lead</span>
              <span className={styles.tagPricing}>Pricing Intent</span>
              <span className={styles.tagWhatsapp}>Whatsapp</span>
            </div>
            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Assigned Owner</span>
                <span className={styles.detailValue}>{agent.brand}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Source</span>
                <span className={styles.detailValue}>LinkedIn Outreach</span>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <span className={styles.statusLabel}>Sequence Status</span>
            </div>
            <div className={styles.statusContent}>
              <div className={styles.statusCurrent}>
                <span className={styles.statusDot} />
                <span className={styles.statusText}>Currently Paused</span>
                <button className={styles.resumeBtn}>Resume Sequence</button>
              </div>
              <div className={styles.statusActions}>
                <button className={styles.convertedBtn}>Converted</button>
                <button className={styles.markDeadBtn}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                  Mark Dead
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <section className={styles.statsRow}>
        <StatsCard label="Total Touches" value="24" trend={12.2} icon={<TouchesIcon />} />
        <StatsCard label="Messages" value="67" trend={-31.1} icon={<MessagesIcon />} />
        <StatsCard label="Last Touch" value="48" trend={12.2} icon={<ClockIcon />} />
      </section>

      {/* Conversation Log */}
      <section className={styles.conversationSection}>
        <div className={styles.convHeader}>
          <h2 className={styles.convTitle}>Conversation Log</h2>
        </div>
        <div className={styles.chatContainer}>
          <div className={styles.messageRow}>
            <div className={styles.aiAvatar}>AI</div>
            <div className={styles.aiBubble}>
              Hi {agent.contact.split(' ')[0]}, thanks for submitting your inquiry on SocialJet! I
              noticed you&apos;re looking for influencer marketing support for {agent.brand}.
            </div>
          </div>

          <div className={styles.messageRowRight}>
            <div className={styles.userBubble}>
              Hi {agent.contact.split(' ')[0]}, thanks for submitting your inquiry on SocialJet! I
              noticed you&apos;re looking for influencer marketing support for {agent.brand}.
            </div>
            <div className={styles.userAvatar}>
              {agent.contact
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
          </div>

          {[1, 2].map((i) => (
            <div key={i}>
              <div className={styles.messageRow}>
                <div className={styles.aiAvatar}>AI</div>
                <div className={styles.aiBubble}>
                  Hi {agent.contact.split(' ')[0]}, thanks for submitting your inquiry on SocialJet!
                  I noticed you&apos;re looking for influencer marketing support for {agent.brand}.
                </div>
              </div>

              <div className={styles.messageRowRight}>
                <div className={styles.userBubble}>
                  Hi {agent.contact.split(' ')[0]}, thanks for submitting your inquiry on SocialJet!
                  I noticed you&apos;re looking for influencer marketing support for {agent.brand}.
                </div>
                <div className={styles.userAvatar}>
                  {agent.contact
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
