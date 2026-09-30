/**
 * @file AdminDashboard.tsx
 * @description The main dashboard component for the Admin role. It displays high-level
 * statistics about the platform, on-chain status, and recent activity, providing a
 * central hub for platform governance and monitoring.
*/

import BriefcaseIcon from "../../assets/icons/briefcase.svg?react";
import AwardIcon from "../../assets/icons/award.svg?react";
import AlertTriangleIcon from "../../assets/icons/alert-triangle.svg?react";
import ZapIcon from "../../assets/icons/zap.svg?react";
import LinkIcon from "../../assets/icons/link.svg?react";
import ActivityIcon from "../../assets/icons/activity.svg?react";

import { shortenAddress } from "../../utils/formatter";
import type { HeaderProps } from "../../types/types";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard({
  totalIssuers,
  suspendedIssuers,
  contractAddress,
  stats,
  recentActivity,
}: HeaderProps) {

  const etherscanBaseUrl = `https://sepolia.etherscan.io`;

  if(stats && recentActivity){
  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardTitle}>Dashboard</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <BriefcaseIcon className={styles.statIcon} />
          <span className={styles.statValue}>{totalIssuers}</span>
          <span className={styles.statLabel}>Trusted Issuers</span>
        </div>

        <div className={styles.statCard}>
          <AwardIcon className={styles.statIcon} />
          <span className={styles.statValue}>{stats.totalCertificates.toLocaleString()}</span>
          <span className={styles.statLabel}>Certificates on-chain</span>
        </div>

        <div className={styles.statCard}>
          <AlertTriangleIcon className={`${styles.statIcon} ${styles.warningIcon}`} />
          <span className={styles.statValue}>{suspendedIssuers}</span>
          <span className={styles.statLabel}>Issuers Suspended</span>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.onChainStatusCard}>
          <div className={styles.cardHeader}>
            <ZapIcon />
            <h2 className={styles.cardTitle}>On-Chain Status</h2>
          </div>
          <ul className={styles.statusList}>
            <li>
              <span>Network</span>

              <span className={styles.statusValue}>
                <span className={styles.statusDot}></span>
                {stats.networkName}
              </span>
            </li>
            <li>
              <span>Contract Address</span>
              <a href={`${etherscanBaseUrl}/address/${contractAddress}`} target="_blank" rel="noopener noreferrer" className={styles.statusValue} title="View on Etherscan">
                {shortenAddress(contractAddress)}
                <LinkIcon className={styles.copyIcon} />
              </a>
            </li>

            <li>
              <span>Current Block</span>
              <span className={styles.statusValue}>
                {stats.currentBlock.toLocaleString()}
                <LinkIcon className={styles.copyIcon} />
              </span>
            </li>
            <li>
              <span>Last Synced</span>
              <span className={styles.statusValue}>
                {stats.lastSynced.toLocaleString()}
              </span>
            </li>
          </ul>
        </div>

         <div className={styles.recentActivityCard}>
           <div className={styles.cardHeader}>
            <ActivityIcon />
            <h2 className={styles.cardTitle}>Recent Activity</h2>
          </div>
          <ul className={styles.activityList}>
            {recentActivity.length > 0 ? (
                recentActivity.map(item => (
                    <li key={item.id} className={styles.activityItem}>
                        <div className={styles.activityIcon}>
                            <AwardIcon />
                        </div>
                        <div className={styles.activityDetails}>
                            <p className={styles.activityText}>
                                <strong>{item.issuerName}</strong> issued a certificate for <strong>"{item.courseTitle}"</strong> to <strong>{item.recipientName}</strong>.
                            </p>
                            <span className={styles.activityTimestamp}>
                                {item.timestamp.toLocaleString()}
                            </span>
                        </div>
                    </li>
                ))
            ) : (
                <li className={styles.noActivity}>
                    <p>No recent certificate issuance activity found.</p>
                </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
  }

}
