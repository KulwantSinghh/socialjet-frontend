'use client';

import { useState } from 'react';
import styles from './AdminActions.module.css';
import { AddMemberModal } from '@/components/shared/AddMemberModal';

export const AdminActions = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        className={styles.addMemberBtn}
        onClick={() => setModalOpen(true)}
        id="add-member-btn"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="9"
            cy="7"
            r="4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19 8v6M22 11h-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Add Member
      </button>

      <AddMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
    </>
  );
};
