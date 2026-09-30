import { errorMessage } from "../../utils/errors";
/**
 * @file ManageIssuersTable.tsx
 * @description A component that displays a comprehensive, searchable table of all
 * whitelisted issuers. It allows an admin to view key details like website,
 * wallet address, and current status, and provides an interface to initiate
 * a status update.
*/

import { useState } from 'react';

import UpdateStatusModal from './UpdateStatusModal';
import Toast from '../shared/Toast';

import UserIcon from '../../assets/icons/user.svg?react';
import LinkIcon from '../../assets/icons/link.svg?react';
import KeyIcon from '../../assets/icons/key.svg?react';
import ActivityIcon from '../../assets/icons/activity.svg?react';
import EditIcon from '../../assets/icons/edit.svg?react';
import SearchIcon from '../../assets/icons/search.svg?react';
import CalendarIcon from '../../assets/icons/calendar.svg?react';

import { shortenAddress } from '../../utils/formatter';
import { wait } from '../../utils/constants';
import type { HeaderProps, Issuer, ToastType, ToastState, StatusString } from '../../types/types';
import styles from './ManageIssuersTable.module.css';

export default function ManageIssuersTable({ issuerList, isLoading, contract, signer, onUpdate }: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssuer, setSelectedIssuer] = useState<Issuer | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });

  };
  const handleCloseToast = () => {
    setToast({ ...toast, show: false });
  };

  const handleOpenModal = (issuer: Issuer) => {
    setSelectedIssuer(issuer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isUpdating) return;
    setIsModalOpen(false);
    setSelectedIssuer(null);
  };

  const handleUpdateStatus = async (newStatus: StatusString) => {
    if (!contract || !signer || !selectedIssuer ||!onUpdate) {
      showToast("Error: Connection or selected issuer is missing.", 'error');
      return;
    }

    setIsUpdating(true);
    showToast("Please confirm the status update in your wallet.", 'info');

    try {
      if(!newStatus){
        return
      }
      const statusMapping = { 'Active': 0, 'Suspended': 1, 'Deactivated': 2 };

      const statusAsNumber = statusMapping[newStatus];

      const connectedContract = contract.connect(signer);
      const tx = await connectedContract.updateIssuerStatus(selectedIssuer.address, statusAsNumber);

      showToast("Transaction submitted. Waiting for confirmation...", 'info');
      await tx.wait();

      showToast("Success! Issuer status has been updated.", 'success');
      onUpdate();
      await wait(3000);
      handleCloseToast();

    } catch (err: unknown) {
      console.error(err);
      showToast(errorMessage(err, "An unknown error occurred."), 'error');
      await wait(3000);
      handleCloseToast();
    } finally {
      setIsUpdating(false);
      handleCloseModal();
    }
  };

  return (
    <>
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={handleCloseToast} />

      <div className={styles.tableContainer}>
        {!isLoading && issuerList && issuerList.length > 0 && (
          <header className={styles.tableHeader}>
            <h1 className={styles.tableTitle}>Trusted Issuers</h1>
            <div className={styles.searchWrapper}>
              <SearchIcon className={styles.searchIcon} />
              <input type="text" placeholder="Search by name or address" className={styles.searchInput} />
            </div>
          </header>
        )}

        {isLoading && <p className={styles.noIssuersMessage}>Loading data from the blockchain...</p>}

        {!isLoading && issuerList && issuerList.length === 0 && (
          <div className={styles.noIssuersMessage}>
            <h2>No Issuers Found</h2>
            <p>There are currently no trusted issuers registered on the platform.</p>
          </div>
        )}

        {!isLoading && issuerList && issuerList.length > 0 && (
          <div className={styles.gridTable}>
            <div className={`${styles.gridHeader} ${styles.gridRow}`}>
              <div><UserIcon />Name</div>
              <div><LinkIcon />Website</div>
              <div><KeyIcon />Wallet Address</div>
              <div><CalendarIcon />Registration Date</div>
              <div><ActivityIcon />Status</div>
              <div><EditIcon />Actions</div>
            </div>

            {issuerList.map((issuer) => (
              <div key={issuer.address} className={styles.gridRow}>
                <div>{issuer.name}</div>
                <div><a href={issuer.website} target="_blank" rel="noopener noreferrer">{issuer.website}</a></div>
                <div>{shortenAddress(issuer.address)}</div>
                <div>{issuer.registrationDate}</div>
                <div>
                  <span className={`${styles.statusCell} ${styles[(issuer.status ?? '').toLowerCase()]}`}>
                    {issuer.status}
                  </span>
                </div>
                <div>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleOpenModal(issuer)}
                    disabled={issuer.status === 'Deactivated'}
                  >
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedIssuer && (
        <UpdateStatusModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleUpdateStatus}
          issuerName={selectedIssuer.name}
          currentStatus={selectedIssuer.status}
          isUpdating={isUpdating}
        />
      )}
    </>
  );
}
