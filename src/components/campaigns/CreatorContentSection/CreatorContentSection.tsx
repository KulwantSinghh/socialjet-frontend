'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import styles from './CreatorContentSection.module.css';
import { ContentLinkCard } from '@/components/campaigns/ContentLinkCard';
import { SubmitContentModal } from '@/components/campaigns/SubmitContentModal';
import {
  useCmReviewContentLink,
  useCreatorContentLinks,
  useSubmitContentLinks,
} from '@/hooks/useContentLinks';
import type { ContentLinkInput } from '@/types/campaign.types';

interface CreatorContentSectionProps {
  leadId: string;
  creatorId: string;
  creatorName: string;
}

/**
 * Action-bar entry point for creator content. Renders a compact "Content (n)"
 * button; the submitted videos live in a slide-over drawer so the thread
 * itself stays uncluttered.
 */
export const CreatorContentSection = ({
  leadId,
  creatorId,
  creatorName,
}: CreatorContentSectionProps) => {
  const { data: links = [] } = useCreatorContentLinks(leadId, creatorId);
  const submit = useSubmitContentLinks(leadId, creatorId);
  const review = useCmReviewContentLink(leadId);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const pendingCount = links.filter(
    (l) => l.status === 'pending' || l.status === 'submitted'
  ).length;

  function handleSubmit(payload: ContentLinkInput[]) {
    submit.mutate(payload, {
      onSuccess: () => {
        setModalOpen(false);
        toast.success(
          payload.length > 1
            ? `${payload.length} content links submitted`
            : 'Content link submitted'
        );
      },
      onError: () => toast.error('Couldn’t submit the links. Please try again.'),
    });
  }

  function handleReview(contentId: string, status: 'cm_approved' | 'cm_rejected', note?: string) {
    review.mutate(
      { contentId, status, note },
      {
        onSuccess: () =>
          toast.success(status === 'cm_approved' ? 'Content approved' : 'Content rejected'),
        onError: () => toast.error('Couldn’t update the review. Please try again.'),
      }
    );
  }

  return (
    <div className={styles.root}>
      <button className={styles.trigger} onClick={() => setDrawerOpen(true)}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        Content
        {links.length > 0 && (
          <span className={`${styles.count} ${pendingCount > 0 ? styles.countPending : ''}`}>
            {links.length}
          </span>
        )}
      </button>

      {drawerOpen && (
        <div className={styles.overlay} onClick={() => setDrawerOpen(false)}>
          <aside
            className={styles.drawer}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={`Content from ${creatorName}`}
          >
            <header className={styles.drawerHeader}>
              <div className={styles.drawerTitleBlock}>
                <h3 className={styles.drawerTitle}>Content</h3>
                <p className={styles.drawerSubtitle}>
                  {creatorName}
                  {links.length > 0 && ` · ${links.length} video${links.length > 1 ? 's' : ''}`}
                  {pendingCount > 0 && ` · ${pendingCount} awaiting review`}
                </p>
              </div>
              <button className={styles.submitBtn} onClick={() => setModalOpen(true)}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Submit Content
              </button>
              <button
                className={styles.closeBtn}
                onClick={() => setDrawerOpen(false)}
                aria-label="Close content panel"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className={styles.drawerBody}>
              {links.length === 0 ? (
                <div className={styles.empty}>
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  <p>No videos submitted yet.</p>
                  <p className={styles.emptyHint}>
                    Paste the links {creatorName} shared in the conversation using “Submit Content”.
                  </p>
                </div>
              ) : (
                links.map((item) => (
                  <ContentLinkCard
                    key={item.id}
                    item={item}
                    canReview
                    reviewPending={review.isPending}
                    onReview={(status, note) => handleReview(item.id, status, note)}
                  />
                ))
              )}
            </div>
          </aside>
        </div>
      )}

      {modalOpen && (
        <SubmitContentModal
          creatorName={creatorName}
          existingUrls={links.map((l) => l.contentUrl)}
          submitting={submit.isPending}
          onSubmit={handleSubmit}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};
