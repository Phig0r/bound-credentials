import { errorMessage as getErrorMessage } from "../utils/errors";
/**
 * @file IssuerPage.tsx
 * @description The main user interface for an authenticated user with the "Issuer" role.
 * This component provides a dedicated form for minting a new certificate NFT. It includes
 * real-time validation, a live preview of the certificate details, and embeds all
 * necessary business logic for the issuance process.
*/

import { useEffect, useState } from 'react';

import { isAddress } from 'ethers';

import Header from "../components/shared/Header";
import Toast from '../components/shared/Toast';

import ShieldIcon from '../assets/icons/shield.svg?react';
import UserIcon from '../assets/icons/user.svg?react';
import WalletIcon from '../assets/icons/wallet.svg?react';
import AwardIcon from '../assets/icons/award.svg?react';
import CalendarIcon from '../assets/icons/calendar.svg?react';
import AlertTriangleIcon from '../assets/icons/alert-triangle.svg?react';
import CheckIcon from '../assets/icons/check-circle (1).svg?react';
import XIcon from '../assets/icons/x-octagon.svg?react';
import InfoIcon from '../assets/icons/info.svg?react';

import { shortenAddress } from '../utils/formatter';
import type { ToastType, ToastState, HeaderProps } from '../types/types';
import styles from "./IssuerPage.module.css";
import { wait } from '../utils/constants';

export default function IssuerPage({contract,signer,onLogout,userAddress, header}:HeaderProps) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isRegistered, setIsRegistered] = useState(false);
  const [issuerName, setIssuerName] = useState<string>('');
  const [issuerStatus, setIssuerStatus] = useState<bigint>();
  const isFormDisabled = isLoading || issuerStatus !== BigInt(0);

  const getButtonStatusClass = () => {
    if (isLoading) {
      return styles['--loading'];
    }

    const status = Number(issuerStatus);
    if (status === 1) {
      return styles['--suspended'];
    }
    if (status === 2) {
      return styles['--deactivated'];
    }
    return '';
  };

  useEffect(() => {
    const getIssuerInfo = async () => {
      if (contract && userAddress) {
        try {
          const issuerDetail = await contract.issuers(userAddress);
          if (issuerDetail && issuerDetail.registrationDate > 0) {
            setIssuerName(issuerDetail.name);
            setIssuerStatus(issuerDetail.status)
            setIsRegistered(true);
          } else {
            setIssuerName("Unregistered Issuer");
            setIsRegistered(false);
          }
        } catch (err) {
          console.error("Failed to fetch issuer info:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    getIssuerInfo();
  }, [contract, userAddress]);


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



  const mintCertificate = async ()=>{
    if (!recipientName || !courseTitle) {
      showToast("Please fill out all fields.", 'error');
      await wait(3000);
      handleCloseToast();
      return;
    }
    if (!isAddress(recipientAddress)) {
      showToast("Please enter a valid recipient address.", 'error');
      await wait(3000);
      handleCloseToast();
      return;
    }

    setIsLoading(true);
    showToast("Please confirm the transaction in your wallet.", 'info');
    try{
      if(contract){
        const connectedContract = contract.connect(signer);
        const tx = await connectedContract.issueCertificate(recipientAddress,recipientName,courseTitle);
        showToast("Transaction submitted. Waiting for confirmation...", 'info');

        await tx.wait();
        showToast(`Success! The credential for ${recipientName} has been securely issued on the blockchain.`, 'success');

        await wait(3000);
        handleCloseToast();
        }

    } catch (err) {
      console.error(err);
      const errorMessage = getErrorMessage(err, "An unknown error occurred.");
      showToast(errorMessage, 'error');
      await wait(3000);
      handleCloseToast();
    } finally {
      setIsLoading(false);
    }
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <>
    <Toast show={toast.show} message={toast.message} type={toast.type} onClose={handleCloseToast}/>
    <div className={styles.pageContainer}>
      <Header theme="dark" isConnected={true} userAddress={shortenAddress(userAddress)} signer={signer} onLogout={onLogout} header={header}/>
      <main className={styles.mainContent} >
        <div className={styles.contentCard}>
          <h1 className={styles.pageTitle}>Issue a New Certificate</h1>

          {!isRegistered && !isLoading && (
              <div className={styles.readOnlyBanner}>
                <InfoIcon />
                <div>
                  <span className={styles.bannerTitle}>Read-Only Access</span>
                  <p>Your address has the `ISSUER_ROLE`, but has not been formally registered by an admin. You can view this interface, but minting is disabled.</p>
                </div>
              </div>
            )}

          <div className={styles.formGrid}>

            <div className={styles.formColumn}>
              <div className={styles.inputGroup}>
                <label htmlFor="recipientAddress" className={styles.inputLabel}>Recipient Wallet Address</label>
                <input
                  id="recipientAddress"
                  type="text"
                  className={styles.textInput}
                  placeholder="e.g., 0x1A2b...c3D4"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  disabled={isFormDisabled}
               />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="recipientName" className={styles.inputLabel}>Recipient's Full Name</label>
                <input
                  id="recipientName"
                  type="text"
                  className={styles.textInput}
                  placeholder="e.g., Dr. Evelyn Reed"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  disabled={isFormDisabled}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="courseTitle" className={styles.inputLabel}>Course or Degree Title</label>
                <input
                  id="courseTitle"
                  type="text"
                  className={styles.textInput}
                  placeholder="e.g., Doctorate in Computer Science"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  disabled={isFormDisabled}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Issue Date</label>
                <div className={styles.readOnlyInput}>
                  <span>{currentDate} (Set automatically)</span>
                  <CalendarIcon />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Issuing Address</label>
                <div className={styles.readOnlyInput}>
                  <span>{userAddress}</span>
                  <WalletIcon />
                </div>
              </div>
            </div>

            <div className={styles.previewColumn}>
              <div className={styles.previewCard}>
                <div className={styles.previewHeaderGolbal}>
                  <div className={styles.previewHeader}>
                  <ShieldIcon />
                  <span>AUTHORIZED ISSUER</span>
                </div>
                <div className={styles.previewIssuerInfo}>
                  <h2>{issuerName}</h2>
                  <span className={styles.WalletConnected}>{shortenAddress(userAddress)}</span>
                </div>
               </div>
                <div className={styles.previewDetails}>
                  <div className={styles.detailItem}>
                    <UserIcon />
                    <div>
                      <span className={styles.detailLabel}>Recipient Name</span>
                      <span className={styles.detailValue}>{recipientName || "..."}</span>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <WalletIcon />
                    <div>
                      <span className={styles.detailLabel}>Recipient Wallet Address</span>
                      <span className={styles.detailValue}>{shortenAddress(recipientAddress) || "..."}</span>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <AwardIcon />
                    <div>
                      <span className={styles.detailLabel}>Course/Degree Title</span>
                      <span className={styles.detailValue}>{courseTitle || "..."}</span>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <CalendarIcon />
                    <div>
                      <span className={styles.detailLabel}>Issue Date</span>
                      <span className={styles.detailValue}>{currentDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.footerActions}>
            { issuerStatus === BigInt(0) && (
              <div className={styles.warningMessage}>
                <AlertTriangleIcon />
                <p>
                  Please double-check all information above, especially the recipient's wallet address.
                  Minting a certificate is an irreversible on-chain action that will be permanently recorded.
                </p>
              </div>
              )
            }
            <div className={styles.mintButtonContainer}>
              <button  className={`${styles.mintButton} ${getButtonStatusClass()}`}  onClick={mintCertificate}
              disabled={!isRegistered || isLoading || issuerStatus !== BigInt(0)} >
                {!isRegistered && !isLoading ? ("Registration Required") :

                isLoading ? ("Minting..." ) :

                issuerStatus === BigInt(0)  && isRegistered ?  (
                    <>
                        <CheckIcon />
                        Mint Certificate
                    </>
                ) :

                issuerStatus === BigInt(1) && isRegistered ?
                (
                  <>
                  <AlertTriangleIcon />
                  Issuer Suspended
                  </>
                ) : issuerStatus === BigInt(2) && isRegistered ? (
                  <>
                  <XIcon />
                  Issuer Deactivated
                  </>
                ) :
                (
                  ''
                )
              }
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
    </>

  );
}
