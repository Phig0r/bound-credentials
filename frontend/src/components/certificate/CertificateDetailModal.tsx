/**
 * @file CertificateDetailModal.tsx
 * @description A reusable modal component that displays the full, official details
 * of a verified credential in a report format. It is used by both Verifiers and
 * Recipients. It can adapt its functionality, such as showing a "Print" or "Share"
 * button, based on the user type.
*/

import { useEffect, useState } from 'react';

import ShareCredentialPanel from './ShareCredentialPanel';

import CheckShieldIcon from '../../assets/icons/check-circle (1).svg?react';
import AwardIcon from '../../assets/icons/award.svg?react';
import UserIcon from '../../assets/icons/user.svg?react';
import CalendarIcon from '../../assets/icons/calendar.svg?react';
import HashIcon from '../../assets/icons/hash.svg?react';
import BriefcaseIcon from '../../assets/icons/briefcase.svg?react';
import LinkIcon from '../../assets/icons/link.svg?react';
import KeyIcon from '../../assets/icons/key.svg?react';
import ActivityIcon from '../../assets/icons/activity.svg?react';

import { shortenAddress } from '../../utils/formatter';
import type { HeaderProps } from '../../types/types';
import styles from "./CertificateDetailModal.module.css";


export default function CertificateDetailModal({ userType, onClose, data}: HeaderProps) {
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);
  const STATUS_MAP = ["Active", "Suspended", "Deactivated"];
  const issuerStatus = STATUS_MAP[Number(data?.issuerStatus)]
  const issuerClassName = `${styles.statusCell} ${styles[issuerStatus]}`;

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const verificationLink = "https://certifychain.demo/verify?id=1025";

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={`${styles.modalContainer} ${isSharePanelOpen ? styles.shareViewActive : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.mainPanel}>
          <header className={styles.modalHeader}>
            <CheckShieldIcon className={styles.headerIcon} />
            <h2 className={styles.headerTitle}>Credential Verified</h2>
            <p className={styles.headerSubtitle}>
              This certificate is authentic and has been verified on the blockchain.
            </p>
          </header>

          <main className={styles.modalBody}>
            <div className={styles.detailsColumn}>
              <h3 className={styles.sectionTitle}>Certificate Details</h3>
              <ul className={styles.detailsList}>
                <li><AwardIcon /><strong>Achievement:</strong> {data?.courseTitle}</li>
                <li><UserIcon /><strong>Recipient:</strong> {data?.recipientName}</li>
                <li><KeyIcon /><strong>Recipient Address:</strong> {shortenAddress(data?.recipientAddress)}</li>
                <li><CalendarIcon /><strong>Date Issued:</strong> {data?.issueDate}</li>
                <li><HashIcon /><strong>Token ID:</strong> {data?.tokenId}</li>
              </ul>
            </div>

            <div className={styles.detailsColumn}>
              <h3 className={styles.sectionTitle}>Issuing Institution </h3>
              <ul className={styles.detailsList}>
                <li><BriefcaseIcon /><strong>Institution:</strong> {data?.issuerName}</li>
                <li><LinkIcon /><strong>Website:</strong> {data?.website}</li>
                <li><KeyIcon /><strong>Issuer Address:</strong> {shortenAddress(data?.issuerAddress)} </li>
                <li><CalendarIcon /><strong>Registration Date:</strong> {data?.registrationDate}</li>
                <li><ActivityIcon /><strong>Issuer Status:</strong> <span className={issuerClassName}>{issuerStatus}</span></li>

              </ul>
            </div>
          </main>

          <footer className={styles.modalFooter}>
            <p className={styles.reportTimestamp}>Report Generated: July 27, 2025, 7:19 PM CET</p>
            <div className={styles.buttonGroup}>
              {userType === 'verifier' && (
                <button className={styles.primaryButton}>Print Report</button>
              )}
              {userType === 'recipient' && (
                  <button
                    className={styles.primaryButton}
                    onClick={() => setIsSharePanelOpen(true)}
                  >
                    Generate Verification Link
                  </button>
                )}
              <button className={styles.secondaryButton} onClick={onClose}>Close</button>
            </div>
          </footer>
        </div>

        {isSharePanelOpen && (
          <ShareCredentialPanel
            link={verificationLink}
            onClose={() => setIsSharePanelOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
