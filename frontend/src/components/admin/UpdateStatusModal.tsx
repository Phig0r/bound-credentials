/**
 * @file UpdateStatusModal.tsx
 * @description A reusable modal component that allows an admin to change the
 * operational status of an issuer. It displays the current status and provides
 * options to switch to a new state (Active, Suspended, or Deactivated).
*/

import { useEffect, useState } from 'react';

import CloseIcon from '../../assets/icons/x.svg?react';

import type { StatusString, HeaderProps } from '../../types/types';
import styles from './UpdateStatusModal.module.css';

export default function UpdateStatusModal({
  isOpen,
  onClose,
  onSubmit,
  issuerName,
  currentStatus,
  isUpdating,
}: HeaderProps) {
  const [selectedStatus, setSelectedStatus] = useState<StatusString>(currentStatus);

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentStatus]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (isUpdating) return;
    if(onSubmit) {
      onSubmit(selectedStatus);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Update Issuer Status</h2>
          <button className={styles.closeButton} onClick={onClose} disabled={isUpdating}>
            <CloseIcon />
          </button>
        </header>

        <main className={styles.modalBody}>
          <p className={styles.description}>
            Select the new operational status for <strong>{issuerName}</strong>
          </p>
          <div className={styles.statusOptions}>
            {(['Active', 'Suspended', 'Deactivated'] as StatusString[]).map((status) => (
              <label key={status} className={styles.optionRow}>
                <input
                  type="radio"
                  name="status"
                  value={status}
                  disabled={currentStatus === status || isUpdating}
                  onChange={() => setSelectedStatus(status)}
                />
                <span className={styles.customRadio}></span>
                <span className={`${styles.statusDot} ${styles[(status ?? '').toLowerCase()]}`}></span>
                <span className={styles.statusLabel}>{status}</span>
                {currentStatus === status && <span className={styles.currentTag}>(Current)</span>}
              </label>
            ))}
          </div>
        </main>

        <footer className={styles.modalFooter}>
          <button className={styles.secondaryButton} onClick={onClose} disabled={isUpdating}>
            Cancel
          </button>
          <button
            className={styles.primaryButton}
            onClick={handleSubmit}
            disabled={isUpdating}
          >
            {isUpdating ? 'Confirming...' : 'Confirm'}
          </button>
        </footer>
      </div>
    </div>
  );
}
