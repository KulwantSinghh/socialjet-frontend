'use client';

import styles from './AlertCard.module.css';
import { Button } from '@/components/ui/Button';
import { useLeadAlerts } from '@/hooks/useLeadAlerts';
import { formatRelativeTime, truncate } from '@/lib/utils';

export const AlertCard = () => {
  const { data, isLoading } = useLeadAlerts();

  if (isLoading) {
    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <h4 className={styles.title}>Lead Alerts</h4>
          </div>
        </div>
        <div className={styles.list}>
          <div className={styles.skeletonItem} />
          <div className={styles.skeletonItem} />
        </div>
      </div>
    );
  }

  const alerts = data?.alerts || [];

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h4 className={styles.title}>Lead Alerts</h4>
          {alerts.length > 0 && <span className={styles.countBadge}>{alerts.length}</span>}
        </div>
      </div>

      <div className={styles.list}>
        {alerts.length === 0 ? (
          <div className={styles.emptyState}>No active alerts found.</div>
        ) : (
          alerts.slice(0, 3).map((alert) => (
            <div key={alert.lead_id} className={styles.alertItem}>
              <div className={styles.itemHeader}>
                <div className={styles.itemLeft}>
                  <div
                    className={`${styles.sourceBadge} ${
                      alert.source === 'whatsapp'
                        ? styles.sourceWhatsapp
                        : alert.source === 'contact_form'
                          ? styles.sourceForm
                          : styles.sourceOther
                    }`}
                  >
                    {alert.source === 'whatsapp' ? (
                      <WhatsAppIcon />
                    ) : alert.source === 'contact_form' ? (
                      <FormIcon />
                    ) : null}
                    {alert.source.replace('_', ' ')}
                  </div>
                  <h5 className={styles.leadName}>{alert.name}</h5>
                </div>
                <span
                  className={`${styles.statusChip} ${styles[`status${alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}`] || styles.statusOther}`}
                >
                  {alert.status}
                </span>
              </div>

              <p className={styles.itemContent}>
                {truncate(alert.message || alert.notes || 'No message content available.', 100)}
              </p>

              <div className={styles.itemFooter}>
                <span className={styles.time}>{formatRelativeTime(alert.created_at)}</span>
                <Button size="sm" variant="secondary" className={styles.actionBtn}>
                  View Details
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const WhatsAppIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.52.909 3.21 1.389 4.941 1.391h.005c5.675 0 10.296-4.62 10.298-10.296.001-2.75-1.072-5.335-3.022-7.286-1.95-1.951-4.538-3.022-7.288-3.022-5.676 0-10.298 4.621-10.3 10.297-.002 2.11.649 4.166 1.88 5.918l-1.013 3.702 3.789-.994zm11.332-6.521c-.301-.15-1.78-.879-2.056-.979-.275-.1-.475-.15-.675.15-.2.3-.775 1.05-1.019 1.15-.244.1-.481.075-.781-.075-.3-.15-1.269-.468-2.417-1.492-.893-.797-1.495-1.781-1.67-2.081-.175-.3-.018-.462.13-.611.134-.133.301-.351.451-.526.15-.175.2-.299.301-.5.1-.201.051-.375-.025-.525-.075-.15-.775-1.875-1.062-2.575-.275-.7-.575-.6-.788-.611-.201-.01-.425-.011-.65-.011s-.588.088-.894.406c-.306.319-1.169 1.144-1.169 2.794s1.2 3.244 1.362 3.469c.162.225 2.362 3.607 5.722 5.059.799.345 1.423.551 1.909.706.801.255 1.53.219 2.106.134.64-.094 1.78-.727 2.031-1.429.25-.702.25-1.303.175-1.429-.075-.126-.275-.201-.575-.351z" />
  </svg>
);

const FormIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);
