/**
 * @file GetDemoRoleModal.tsx
 * @description A modal component that allows a demo user to grant themselves
 * a demo role (Admin or Issuer) to explore the application's features.
 */

import { useEffect, useState} from 'react';
import styles from './GetDemoRoleModal.module.css';
import CloseIcon from '../../assets/icons/x.svg?react';
import AdminIcon from '../../assets/icons/shield.svg?react';
import IssuerIcon from '../../assets/icons/user-plus.svg?react';
import RecipientIcon from '../../assets/icons/user.svg?react';
import type { HeaderProps, Roles } from '../../types/types';
import { useDemoRole } from '../../hooks/useWeb3';

export default function GetDemoRoleModal({
  isOpen,
  onClose,
  signer,
  showToast,
}: HeaderProps) {


  const [selectedRole, setSelectedRole] = useState<Roles | null>(null);

  const { isUpdating, changeRole } = useDemoRole(signer ?? null);

  const handleSelectRole = (role: Roles) => {
    setSelectedRole(role);
    if (showToast) {
      changeRole(role, showToast);
    }

  };

  const canOpen = Boolean(isOpen && signer && showToast);
  useEffect(() => {
    if (canOpen) {
      document.body.style.overflow = 'hidden';
      setSelectedRole(null);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [canOpen]);

  if (!isOpen || !signer || !showToast) {
    return null;
  }

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Get a Demo Role</h2>
          <button className={styles.closeButton} onClick={onClose} disabled={isUpdating}>
            <CloseIcon />
          </button>
        </header>

        <main className={styles.modalBody}>
          <p className={styles.description}>
            Select a role to grant to your connected wallet. You will need to approve the transaction.
          </p>
          <div className={styles.roleOptions}>
            <button
              className={styles.roleButton}
              onClick={() => handleSelectRole('issuer')}
              disabled={isUpdating}
            >
              <IssuerIcon />
             <span>
                {isUpdating && selectedRole === 'issuer' ? 'Requesting...' : 'Become an Issuer'}
              </span>
            </button>
            <button
              className={styles.roleButton}
              onClick={() => handleSelectRole('admin')}
              disabled={isUpdating}
            >
              <AdminIcon />
              <span>
                {isUpdating && selectedRole === 'admin' ? 'Requesting...' : 'Become an Admin'}
              </span>
            </button>
            <button
              className={styles.roleButton}
              onClick={() => handleSelectRole('recipient')}
              disabled={isUpdating}
            >
              <RecipientIcon />
              <span>
                {isUpdating && selectedRole === 'recipient' ? 'Requesting...' : 'Become a Recipient'}
              </span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
