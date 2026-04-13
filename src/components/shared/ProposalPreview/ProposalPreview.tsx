'use client';

import { useState } from 'react';
import styles from './ProposalPreview.module.css';
import { useSalesAnalysis } from '@/hooks/useIntelligenceCalls';
import type {
  SalesAnalysis,
  SalesPricingTier,
  SalesTimelineMilestone,
  SalesKeyMetric,
} from '@/types/intelligence.types';

// ---- Icons ----

const SpinnerIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={styles.spinner}
  >
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ---- Sub-sections ----

function PricingTierCard({ tier, recommended }: { tier: SalesPricingTier; recommended?: boolean }) {
  return (
    <div className={recommended ? styles.pricingCardHighlighted : styles.pricingCard}>
      {recommended && <span className={styles.recommendedBadge}>Recommended</span>}
      <div className={styles.pricingCardName}>{tier.package_name}</div>
      <div className={styles.pricingCardPrice}>{tier.price}</div>
      <div className={styles.pricingCardRange}>{tier.influencer_count_range}</div>
      <p className={styles.pricingCardDesc}>{tier.description}</p>
    </div>
  );
}

function TimelineStep({
  milestone,
  index,
  total,
}: {
  milestone: SalesTimelineMilestone;
  index: number;
  total: number;
}) {
  return (
    <div className={styles.timelineStep}>
      <div className={styles.timelineStepLeft}>
        <div className={styles.timelineDot}>{index + 1}</div>
        {index < total - 1 && <div className={styles.timelineLine} />}
      </div>
      <div className={styles.timelineStepContent}>
        <div className={styles.timelineWeek}>{milestone.week}</div>
        <div className={styles.timelineMilestone}>{milestone.milestone}</div>
        <div className={styles.timelineDeliverable}>{milestone.deliverable}</div>
        <p className={styles.timelineDesc}>{milestone.description}</p>
      </div>
    </div>
  );
}

function MetricRow({ metric }: { metric: SalesKeyMetric }) {
  return (
    <div className={styles.metricRow}>
      <div className={styles.metricName}>{metric.metric}</div>
      <div className={styles.metricTarget}>{metric.target}</div>
      <div className={styles.metricDesc}>{metric.description}</div>
    </div>
  );
}

// ---- Proposal document ----

function ProposalDocument({ data }: { data: SalesAnalysis }) {
  const date = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const [proposalNo] = useState(
    () => `PROP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`
  );

  return (
    <div className={styles.document}>
      {/* ── Hero Header ── */}
      <div className={styles.heroHeader}>
        <div className={styles.heroMeta}>
          <span className={styles.heroLabel}>Proposal</span>
          <span className={styles.heroDivider}>·</span>
          <span className={styles.heroDate}>{date}</span>
          <span className={styles.heroDivider}>·</span>
          <span className={styles.heroNo}>{proposalNo}</span>
        </div>
        <h1 className={styles.heroTitle}>{data.campaign_objective || 'Campaign Proposal'}</h1>
        <p className={styles.heroSub}>{data.client_needs}</p>
        <div className={styles.heroPills}>
          <span className={styles.heroPill}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            {data.budget}
          </span>
          <span className={styles.heroPill}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {data.timeline}
          </span>
          {data.expected_outcomes && (
            <span className={styles.heroPill}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
              {data.expected_outcomes}
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>
        {/* Executive Summary */}
        {data.call_summary && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Executive Summary</h2>
            <p className={styles.bodyText}>{data.call_summary}</p>
          </section>
        )}

        {/* Strategy */}
        {data.strategy && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Our Strategy</h2>
            <div className={styles.strategyCard}>
              <p className={styles.bodyText}>{data.strategy}</p>
            </div>
          </section>
        )}

        {/* Pricing Tiers */}
        {data.pricing_tiers?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Investment Packages</h2>
            {data.pricing_note && <p className={styles.pricingNote}>{data.pricing_note}</p>}
            <div className={styles.pricingGrid}>
              {data.pricing_tiers.map((tier, i) => (
                <PricingTierCard key={tier.package_name} tier={tier} recommended={i === 1} />
              ))}
            </div>
            {data.recommended_ad_budget && (
              <div className={styles.adBudgetBanner}>
                <strong>Recommended Ad Budget:</strong> {data.recommended_ad_budget.daily_budget}{' '}
                for {data.recommended_ad_budget.duration}
                {data.recommended_ad_budget.adjustment_note && (
                  <> — {data.recommended_ad_budget.adjustment_note}</>
                )}
              </div>
            )}
          </section>
        )}

        {/* Execution Plan / Timeline */}
        {data.timeline_milestones?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Execution Timeline</h2>
            <div className={styles.timelineWrapper}>
              {data.timeline_milestones.map((m, i) => (
                <TimelineStep
                  key={i}
                  milestone={m}
                  index={i}
                  total={data.timeline_milestones.length}
                />
              ))}
            </div>
          </section>
        )}

        {/* Key Success Metrics */}
        {data.key_success_metrics?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Key Success Metrics</h2>
            <div className={styles.metricsTable}>
              <div className={styles.metricsHeader}>
                <span>Metric</span>
                <span>Target</span>
                <span>Description</span>
              </div>
              {data.key_success_metrics.map((m) => (
                <MetricRow key={m.metric} metric={m} />
              ))}
            </div>
          </section>
        )}

        {/* Two column: Package Inclusions + Value Adds */}
        {(data.package_inclusions?.length > 0 || data.value_adds?.length > 0) && (
          <section className={styles.section}>
            <div className={styles.inclusionsGrid}>
              {data.package_inclusions?.length > 0 && (
                <div>
                  <h2 className={styles.sectionTitle}>What&apos;s Included</h2>
                  <ul className={styles.checkList}>
                    {data.package_inclusions.map((item, i) => (
                      <li key={i} className={styles.checkItem}>
                        <span className={styles.checkDot}>
                          <CheckIcon />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {data.value_adds?.length > 0 && (
                <div>
                  <h2 className={styles.sectionTitle}>Value Adds</h2>
                  <ul className={styles.checkList}>
                    {data.value_adds.map((item, i) => (
                      <li key={i} className={styles.checkItem}>
                        <span className={styles.checkDotPurple}>
                          <CheckIcon />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Offer Details */}
        {data.offer_details?.offer_type && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Special Offer</h2>
            <div className={styles.offerCard}>
              <div className={styles.offerType}>{data.offer_details.offer_type}</div>
              <p className={styles.offerDesc}>{data.offer_details.description}</p>
              {data.offer_details.call_to_action && (
                <p className={styles.offerCta}>{data.offer_details.call_to_action}</p>
              )}
            </div>
          </section>
        )}

        {/* Next Steps */}
        {data.next_steps && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Next Steps</h2>
            <div className={styles.nextStepsCard}>
              <p className={styles.bodyText}>{data.next_steps}</p>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className={styles.docFooter}>
          <div className={styles.footerBrand}>SocialJet</div>
          <div className={styles.footerNote}>
            Confidential — Prepared exclusively for this engagement
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Main ----

interface ProposalPreviewProps {
  meetingId?: string;
  transcript?: string;
}

const EditIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const ProposalPreview = ({ meetingId, transcript }: ProposalPreviewProps) => {
  const { data, isLoading, isError, refetch } = useSalesAnalysis(meetingId, transcript);

  return (
    <section className={styles.root}>
      <div className={styles.proposalHeader}>
        <div className={styles.proposalTitleGroup}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <h3>Proposal Preview</h3>
        </div>
        <div className={styles.proposalActions}>
          <button className={styles.iconBtn} aria-label="Edit proposal">
            <EditIcon />
          </button>
          <button className={styles.iconBtn} aria-label="Download proposal">
            <DownloadIcon />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className={styles.loadingState}>
          <SpinnerIcon />
          <div>
            <p className={styles.loadingTitle}>Generating Proposal…</p>
            <p className={styles.loadingSubtitle}>
              AI is analyzing the call and building your proposal
            </p>
          </div>
        </div>
      )}

      {isError && !isLoading && (
        <div className={styles.errorState}>
          <p>Failed to generate proposal.</p>
          <button onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {!isLoading && !isError && data && <ProposalDocument data={data} />}

      {!isLoading && !isError && !data && !meetingId && (
        <div className={styles.emptyState}>
          <p>Select a meeting to generate a proposal.</p>
        </div>
      )}
    </section>
  );
};
