'use client';

import { useRef, useState, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import styles from './ProposalPreview.module.css';
import { useSalesAnalysis } from '@/hooks/useIntelligenceCalls';
import { ProposalEditor } from '@/components/shared/ProposalEditor';
import { generateProposalHTML, proposalDocumentCSS } from '@/lib/generateProposalHTML';
import type {
  SalesAnalysis,
  SalesPricingTier,
  SalesTimelineMilestone,
  SalesKeyMetric,
} from '@/types/intelligence.types';

// ── Icons ──────────────────────────────────────────────────────────────────

const _SpinnerIcon = () => (
  <svg
    width="20"
    height="20"
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

const EditIcon = () => (
  <svg
    width="15"
    height="15"
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
    width="15"
    height="15"
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

const ChevronIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const RefreshIcon = () => (
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
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 1 0 .49-5.51L1 10" />
  </svg>
);

const PdfIcon = () => (
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
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const WordIcon = () => (
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
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 15l1.5-5 1.5 5 1.5-5 1.5 5" />
  </svg>
);

// ── Skeleton ───────────────────────────────────────────────────────────────

function ProposalSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonHero}>
        <div className={`${styles.skeletonLine} ${styles.skeletonLineXs}`} />
        <div
          className={`${styles.skeletonLine} ${styles.skeletonLineLg}`}
          style={{ width: '65%' }}
        />
        <div
          className={`${styles.skeletonLine} ${styles.skeletonLineSm}`}
          style={{ width: '80%' }}
        />
        <div className={styles.skeletonPills}>
          <div className={styles.skeletonPill} />
          <div className={styles.skeletonPill} style={{ width: 80 }} />
        </div>
      </div>
      <div className={styles.skeletonBody}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skeletonSection}>
            <div
              className={`${styles.skeletonLine} ${styles.skeletonLineXs}`}
              style={{ width: 100 }}
            />
            <div className={`${styles.skeletonLine} ${styles.skeletonLineSm}`} />
            <div
              className={`${styles.skeletonLine} ${styles.skeletonLineSm}`}
              style={{ width: '90%' }}
            />
            <div
              className={`${styles.skeletonLine} ${styles.skeletonLineSm}`}
              style={{ width: '75%' }}
            />
          </div>
        ))}
        <div className={styles.skeletonSection}>
          <div
            className={`${styles.skeletonLine} ${styles.skeletonLineXs}`}
            style={{ width: 120 }}
          />
          <div className={styles.skeletonCards}>
            {[1, 2, 3].map((j) => (
              <div key={j} className={styles.skeletonCard}>
                <div
                  className={`${styles.skeletonLine} ${styles.skeletonLineSm}`}
                  style={{ width: '60%' }}
                />
                <div
                  className={`${styles.skeletonLine} ${styles.skeletonLineXs}`}
                  style={{ width: '40%', marginTop: 4 }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.skeletonSection}>
          <div
            className={`${styles.skeletonLine} ${styles.skeletonLineXs}`}
            style={{ width: 150 }}
          />
          {[1, 2, 3, 4, 5].map((k) => (
            <div key={k} className={styles.skeletonListItem}>
              <div className={styles.skeletonBullet} />
              <div
                className={`${styles.skeletonLine} ${styles.skeletonLineSm}`}
                style={{ flex: 1, width: `${70 + k * 3}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components for view mode ───────────────────────────────────────────

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

// ── View-mode document ─────────────────────────────────────────────────────

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
      {/* Hero */}
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
          {data.budget && (
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
          )}
          {data.timeline && (
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
          )}
        </div>
        {data.participants?.length > 0 && (
          <div className={styles.heroParticipants}>
            <span className={styles.heroParticipantsLabel}>Participants</span>
            {data.participants.map((p, i) => (
              <span key={i} className={styles.heroParticipantChip}>
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        {data.call_summary && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Executive Summary</h2>
            <p className={styles.bodyText}>{data.call_summary}</p>
          </section>
        )}

        {(data.current_situation || data.objectives || data.key_challenges) && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Situation Analysis</h2>
            <div className={styles.situationGrid}>
              {data.current_situation && (
                <div className={styles.situationCard}>
                  <div className={styles.situationCardLabel}>Current Situation</div>
                  <p className={styles.bodyText}>{data.current_situation}</p>
                </div>
              )}
              {data.objectives && (
                <div className={styles.situationCard}>
                  <div className={styles.situationCardLabel}>Objectives</div>
                  <p className={styles.bodyText}>{data.objectives}</p>
                </div>
              )}
              {data.key_challenges && (
                <div className={styles.situationCard}>
                  <div className={styles.situationCardLabel}>Key Challenges</div>
                  <p className={styles.bodyText}>{data.key_challenges}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {data.strategy && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Our Strategy</h2>
            <div className={styles.strategyCard}>
              <p className={styles.bodyText}>{data.strategy}</p>
            </div>
          </section>
        )}

        {data.marketing_message && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Marketing Message</h2>
            <div className={styles.marketingMessageCard}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className={styles.marketingMessageText}>&ldquo;{data.marketing_message}&rdquo;</p>
            </div>
          </section>
        )}

        {data.execution_plan?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Execution Plan</h2>
            <ol className={styles.executionList}>
              {data.execution_plan.map((step, i) => (
                <li key={i} className={styles.executionItem}>
                  <span className={styles.executionNum}>{i + 1}</span>
                  <span className={styles.executionText}>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {data.target_audience &&
          (data.target_audience.primary_audience || data.target_audience.psychographics) && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Target Audience</h2>
              <div className={styles.audienceGrid}>
                {data.target_audience.primary_audience && (
                  <div className={styles.audienceCard}>
                    <div className={styles.audienceCardLabel}>Primary Audience</div>
                    <p className={styles.bodyText}>{data.target_audience.primary_audience}</p>
                  </div>
                )}
                {data.target_audience.secondary_audience && (
                  <div className={styles.audienceCard}>
                    <div className={styles.audienceCardLabel}>Secondary Audience</div>
                    <p className={styles.bodyText}>{data.target_audience.secondary_audience}</p>
                  </div>
                )}
                {data.target_audience.psychographics && (
                  <div className={styles.audienceCard}>
                    <div className={styles.audienceCardLabel}>Psychographics</div>
                    <p className={styles.bodyText}>{data.target_audience.psychographics}</p>
                  </div>
                )}
                {data.target_audience.behavioral_traits && (
                  <div className={styles.audienceCard}>
                    <div className={styles.audienceCardLabel}>Behavioral Traits</div>
                    <p className={styles.bodyText}>{data.target_audience.behavioral_traits}</p>
                  </div>
                )}
              </div>
              {data.target_audience.demographics &&
                Object.values(data.target_audience.demographics).some(Boolean) && (
                  <div className={styles.demographicsRow}>
                    {Object.entries(data.target_audience.demographics)
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k} className={styles.demographicChip}>
                          <span className={styles.demographicKey}>{k.replace(/_/g, ' ')}</span>
                          <span className={styles.demographicVal}>{v}</span>
                        </div>
                      ))}
                  </div>
                )}
            </section>
          )}

        {data.content_types?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Content Types</h2>
            <div className={styles.contentTypesGrid}>
              {data.content_types.map((ct, i) => (
                <div key={i} className={styles.contentTypeCard}>
                  <div className={styles.contentTypeName}>{ct.name}</div>
                  <p className={styles.contentTypeDesc}>{ct.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.pricing_tiers?.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Investment Packages</h2>
            {data.pricing_note && <p className={styles.pricingNote}>{data.pricing_note}</p>}
            <div className={styles.pricingGrid}>
              {data.pricing_tiers.map((tier, i) => (
                <PricingTierCard key={tier.package_name} tier={tier} recommended={i === 1} />
              ))}
            </div>
            {data.recommended_ad_budget?.daily_budget && (
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

        {data.next_steps && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Next Steps</h2>
            <div className={styles.nextStepsCard}>
              <p className={styles.nextStepsText}>{data.next_steps}</p>
            </div>
          </section>
        )}

        {data.expected_outcomes && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Expected Outcomes</h2>
            <p className={styles.bodyText}>{data.expected_outcomes}</p>
          </section>
        )}

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

// ── Main export ────────────────────────────────────────────────────────────

interface ProposalPreviewProps {
  meetingId?: string;
  transcript?: string;
}

export const ProposalPreview = ({ meetingId, transcript }: ProposalPreviewProps) => {
  const { data, isLoading, isError, refetch, isFetching } = useSalesAnalysis(meetingId, transcript);
  const [editMode, setEditMode] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const editorRef = useRef<Editor | null>(null);

  const handleEditorReady = useCallback((editor: Editor) => {
    editorRef.current = editor;
  }, []);

  const getExportHTML = (): string => {
    if (editorRef.current && editMode) {
      return editorRef.current.getHTML();
    }
    return data ? generateProposalHTML(data) : '';
  };

  const handleDownloadPDF = async () => {
    setShowDownloadMenu(false);
    const html = getExportHTML();
    if (!html) return;

    const html2pdf = (await import('html2pdf.js')).default as (
      element?: HTMLElement,
      opt?: Record<string, unknown>
    ) => {
      set: (opts: Record<string, unknown>) => { from: (el: HTMLElement) => { save: () => void } };
    };

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<style>${proposalDocumentCSS}</style><div style="padding:0;">${html}</div>`;
    wrapper.style.cssText = 'position:absolute;left:-9999px;top:0;width:794px;';
    document.body.appendChild(wrapper);

    const content = wrapper.querySelector('div') as HTMLDivElement;

    html2pdf()
      .set({
        margin: [18, 20, 18, 20],
        filename: 'SocialJet-Proposal.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(content)
      .save();

    setTimeout(() => document.body.removeChild(wrapper), 2000);
  };

  const handleDownloadDOCX = () => {
    setShowDownloadMenu(false);
    const html = getExportHTML();
    if (!html) return;

    const wordDoc = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>SocialJet Proposal</title>
  <!--[if gte mso 9]><xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml><![endif]-->
  <style>${proposalDocumentCSS}
    @page { margin: 2.5cm; size: A4; }
    body { width: 100%; }
  </style>
</head>
<body>${html}</body>
</html>`;

    const blob = new Blob(['\ufeff', wordDoc], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SocialJet-Proposal.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = () => {
    setEditMode(false);
    editorRef.current = null;
    refetch();
  };

  const handleToggleEdit = () => {
    if (!editMode && data) {
      // initialise editor with fresh HTML on first open
      editorRef.current = null;
    }
    setEditMode((prev) => !prev);
  };

  const isRegenerating = isFetching && !isLoading;

  return (
    <section className={styles.root}>
      {/* ── Header bar ── */}
      <div className={styles.proposalHeader}>
        <div className={styles.proposalTitleGroup}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <h3>Proposal Preview</h3>
          {editMode && <span className={styles.editBadge}>Editing</span>}
        </div>

        <div className={styles.proposalActions}>
          {/* Regenerate */}
          {data && (
            <button
              className={styles.regenerateBtn}
              onClick={handleRegenerate}
              disabled={isFetching}
              title="Regenerate proposal from AI"
            >
              <span className={isFetching ? styles.spinIcon : ''}>
                <RefreshIcon />
              </span>
              Regenerate
            </button>
          )}

          {/* Edit toggle */}
          {data && (
            <button
              className={`${styles.iconLabelBtn} ${editMode ? styles.iconLabelBtnActive : ''}`}
              onClick={handleToggleEdit}
              title={editMode ? 'Exit editing' : 'Edit proposal'}
            >
              <EditIcon />
              {editMode ? 'Done' : 'Edit'}
            </button>
          )}

          {/* Download */}
          {data && (
            <div className={styles.downloadWrap}>
              <button className={styles.downloadBtn} onClick={() => setShowDownloadMenu((p) => !p)}>
                <DownloadIcon />
                Download
                <ChevronIcon />
              </button>
              {showDownloadMenu && (
                <>
                  <div
                    className={styles.downloadMenuBackdrop}
                    onClick={() => setShowDownloadMenu(false)}
                  />
                  <div className={styles.downloadMenu}>
                    <button className={styles.downloadMenuItem} onClick={handleDownloadPDF}>
                      <PdfIcon />
                      <div>
                        <div className={styles.downloadMenuItemLabel}>Export as PDF</div>
                        <div className={styles.downloadMenuItemSub}>
                          Best for sharing &amp; printing
                        </div>
                      </div>
                    </button>
                    <button className={styles.downloadMenuItem} onClick={handleDownloadDOCX}>
                      <WordIcon />
                      <div>
                        <div className={styles.downloadMenuItemLabel}>Export as Word (.doc)</div>
                        <div className={styles.downloadMenuItemSub}>Editable in Microsoft Word</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── States ── */}

      {(isLoading || isRegenerating) && <ProposalSkeleton />}

      {isError && !isLoading && !isFetching && (
        <div className={styles.errorState}>
          <p>Failed to generate proposal.</p>
          <button onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {!isLoading && !isFetching && !isError && data && editMode && (
        <ProposalEditor
          key={`editor-${meetingId}`}
          initialContent={generateProposalHTML(data)}
          onEditorReady={handleEditorReady}
        />
      )}

      {!isLoading && !isFetching && !isError && data && !editMode && (
        <ProposalDocument data={data} />
      )}

      {!isLoading && !isFetching && !isError && !data && !meetingId && (
        <div className={styles.emptyState}>
          <p>Select a meeting to generate a proposal.</p>
        </div>
      )}
    </section>
  );
};
