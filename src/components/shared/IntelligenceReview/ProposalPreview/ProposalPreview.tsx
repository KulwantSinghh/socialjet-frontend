import styles from './ProposalPreview.module.css';

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

export const ProposalPreview = () => {
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
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
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

      <div className={styles.proposalCard}>
        <div className={styles.proposalTop}>
          <div>
            <h2 className={styles.proposalMainTitle}>Enterprise Implementation</h2>
            <p className={styles.preparedFor}>Prepared for TechCorp Solutions</p>
          </div>
          <div className={styles.proposalNoCol}>
            <span className={styles.propNoLabel}>Proposal No.</span>
            <span className={styles.propNoValue}>PROP-2024-084</span>
          </div>
        </div>

        <div className={styles.proposalContent}>
          <div className={styles.propMainCol}>
            <div className={styles.propParaGroup}>
              <h5>Executive Summary</h5>
              <p>
                Based on our discussion regarding the $60k annual manual entry costs, SalesAI
                proposes a centralized enterprise solution to automate multi-region data
                workflows...
              </p>
            </div>
            <div className={styles.propParaGroup}>
              <h5>Strategic Approach</h5>
              <div className={styles.approachCards}>
                <div className={styles.approachCard}>
                  <strong>Phase 1: Automation</strong>
                  <p>Core data pipeline setup</p>
                </div>
                <div className={styles.approachCard}>
                  <strong>Phase 2: Scale</strong>
                  <p>Regional office integration</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.investmentCol}>
            <h5>Investment</h5>
            <div className={styles.investmentTable}>
              <div className={styles.invRow}>
                <span>Enterprise License (Annual)</span>
                <strong>$32,000</strong>
              </div>
              <div className={styles.invRow}>
                <span>Setup & Integration</span>
                <strong>$12,500</strong>
              </div>
              <div className={styles.invDivider} />
              <div className={styles.invTotalRow}>
                <span>Total Initial Investment</span>
                <span className={styles.totalPrice}>$44,500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
