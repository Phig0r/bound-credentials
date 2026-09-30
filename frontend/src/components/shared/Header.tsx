/**
 * @file Header.tsx
 * @description A reusable header component for the application. It adapts its
 * theme (light/dark) and actions (Connect/Logout) based on the props it receives,
 * making it suitable for both the public landing page and the internal dashboards.
*/

import styles from './Header.module.css';
import { useState } from 'react';
import type { HeaderProps, ToastState, ToastType} from '../../types/types';
import Toast from '../../components/shared/Toast';
import GetDemoRoleModal from '../../components/shared/GetDemoRoleModal';
export default function Header({
  theme,
  header,
  signer,
  isConnected,
  userAddress,
  onConnect,
  onLogout
}: HeaderProps) {

  const themeClass = theme === 'light' ? styles.lightTheme : styles.darkTheme;


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


  return (
    <>
    <Toast show={toast.show} message={toast.message} type={toast.type} onClose={handleCloseToast}/>
    <header className={`${styles.headerContainer} ${themeClass}`}>
      <div className={styles.logoContainer}>
        <h1 className={styles.logoTitle}>Bound Credentials</h1>
        <span className={styles.logoDemoTag}>Demo</span>

      </div>
      {isConnected && header && (
        <div className={styles.titleContainer}>
          <span className={styles.headerTitle}>{header}</span>
          <button className={styles.demoRoleButton} onClick={handModalOpen}>
            Get a Demo Role
          </button>
        </div>
      )}

      <div className={styles.userActions}>
        {isConnected ? (
          <>
            <div className={styles.walletInfo}>
              <span className={styles.walletLabel}>Wallet Address</span>
              <span className={styles.walletAddress}>{userAddress}</span>
            </div>
            <button className={styles.actionButton} onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className={styles.actionButton} onClick={onConnect}>
            Connect Wallet
          </button>
        )}
      </div>
    </header>
    <GetDemoRoleModal
      isOpen={isModalOpen}
      onClose={handModalClose}
      signer={signer}
      showToast={showToast}
    />
    </>


  );
}
