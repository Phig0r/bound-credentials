/**
 * @file EmptyState.tsx
 * @description A component that displays a message for a user whose
 * credential wallet is empty. It provides a clear call-to-action to
 * engage with the application's demo features.
*/

import { useState } from 'react';
import styles from './EmptyState.module.css';
import InfoIcon from '../assets/icons/info.svg?react';
import GetDemoRoleModal from '../components/shared/GetDemoRoleModal';
import type { HeaderProps, ToastState, ToastType} from '../types/types';

import Header from '../components/shared/Header';
import Toast from '../components/shared/Toast';
export default function EmptyState({ signer, userAddress, onLogout}: HeaderProps) {

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handModalOpen = ()=>{
    setIsModalOpen(true);
  }
  const handModalClose = ()=>{
    setIsModalOpen(false);
  }

    const [toast, setToast] = useState<ToastState>({

      show: false,
      message: '',
      type:"info"  ,
    });
    const showToast = (message: string, type:ToastType) => {
      setToast({show:true, message, type})
    }
    const handleCloseToast = () => {
      setToast({ ...toast, show: false });
    };

  if (!signer) return null;

  return (
    <>

     <Toast show={toast.show} message={toast.message} type={toast.type} onClose={handleCloseToast}/>
      <Header theme="dark" isConnected={true} userAddress={userAddress} onLogout={onLogout}/>
      <div className={styles.emptyStateContainer}>
        <InfoIcon className={styles.emptyStateIcon} />
        <h1 className={styles.emptyStateTitle}>
          Your Credential Wallet is Empty
        </h1>
        <p className={styles.emptyStateText}>
          Certificates issued to your wallet address will appear here automatically.
        </p>
        <p className={styles.emptyStateText}>
          To explore the administrative features for this demo, you can grant your wallet a demo role below.
        </p>
        <button className={styles.demoButton} onClick={handModalOpen}>
          Get a Demo Role
        </button>
      </div>

      <GetDemoRoleModal
        isOpen={isModalOpen}
        onClose={handModalClose}
        signer={signer}
        showToast={showToast}
      />
    </>
  );
}
