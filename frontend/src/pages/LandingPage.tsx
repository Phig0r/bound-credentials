/**
 * @file LandingPage.tsx
 * @description The main public-facing page for the Bound Credentials application.
 * It serves as the entry point for all users, explaining the project's value
 * and providing two primary calls-to-action: connecting a wallet for registered
 * users and a public tool for verifying a certificate's authenticity.
*/

import { useEffect, useState } from "react";

import Header from "../components/shared/Header";
import CertificateDetailModal from '../components/certificate/CertificateDetailModal';
import VerificationFailedModal from "../components/certificate/VerificationFailedModal";
import Toast from '../components/shared/Toast';

import { useCertificateData } from "../hooks/useWeb3";

import AwardIcon from '../assets/icons/award.svg?react';
import KeyIcon from '../assets/icons/key.svg?react';
import CheckShieldIcon from '../assets/icons/check-circle (1).svg?react';

import type { ToastState, ToastType, HeaderProps } from "../types/types";
import styles from "./LandingPage.module.css";

export default function LandingPage({onConnect, contract}: HeaderProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [tokenId, setTokenId] =useState<number|null>(null);
  const {data, isLoading, error, fetchAllDetails} = useCertificateData(contract);

  const wait = (milliseconds: number | undefined) => new Promise(resolve => setTimeout(resolve, milliseconds));
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

  const handleVerify = async ()=>{
    if(tokenId || tokenId == 0){
      showToast("Verifying credential on-chain...", "info");
      await wait(1000);
      handleCloseToast();
      await fetchAllDetails(tokenId);
    }else{
      showToast("Please enter a Certificate ID to begin verification.", "error");
      await wait(3000);
      handleCloseToast();
    }
  }

  useEffect(()=>{
    if (!isLoading) {
      if (data && !error) {
        setShowInfoModal(true);
      }
      if(error){
        setShowErrorModal(true);
      }
    }
  },[isLoading, data, error])

  const closeModal = () => {
    setShowErrorModal(false);
    setShowInfoModal(false);
  };

  return (
    <>
    <Toast show={toast.show} message={toast.message} type={toast.type} onClose={handleCloseToast}/>
    <Header isConnected={false} theme ="light" onConnect={onConnect} signer={null}/>

    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>

        {/* --- Hero Section --- */}
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>
            Credentials bound to a wallet.
          </h1>

          <p className={styles.heroSubtitle}>
            Issue, own, and verify academic and professional certificates
            with non-transferable tokens on Sepolia.
          </p>

          <div className={styles.heroActions}>
            <button className={styles.ctaButton} onClick={onConnect}>Connect Wallet</button>
          </div>
        </section>

        {/* --- Verification Section --- */}
        <section className={styles.verificationSection}>
          <h2 className={styles.sectionTitle}>
              Instant Credential Verification
          </h2>

          <div className={styles.verificationInputGroup}>

            <label htmlFor="certificateId" className={styles.inputLabel}>
              Enter Certificate ID (Token ID)
            </label>

            <div className={styles.inputWithButton}>
              <input
                id="certificateId"
                type="number"
                className={styles.textInput}
                placeholder="e.g., 1025"

                onChange={(e)=>setTokenId(e.target.valueAsNumber)}

              />
              <button className={styles.verifyButton} onClick={handleVerify} disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>

          </div>

        </section>

        {/* --- How It Works Section --- */}
        <section className={styles.howItWorksSection}>
          <h2 className={styles.sectionTitle}>How the Demo Works</h2>
          <div className={styles.featuresGrid}>

            <div className={styles.featureCard}>
              <div className={styles.featureTitleContainer}>
                <AwardIcon className={styles.featureIcon} />
                <h3 className={styles.featureTitle}>1. Institution Issues</h3>
              </div>

              <p className={styles.featureDescription}>
                Trusted institutions mint a unique, non-transferable NFT for each
                credential.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureTitleContainer}>
                <KeyIcon className={styles.featureIcon} />
                <h3 className={styles.featureTitle}>2. Recipient Owns</h3>
              </div>

              <p className={styles.featureDescription}>
                Recipients securely hold and manage their credentials in their
                personal crypto wallet.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureTitleContainer}>
                <CheckShieldIcon className={styles.featureIcon} />
                <h3 className={styles.featureTitle}>3. Anyone Verifies</h3>
              </div>

              <p className={styles.featureDescription}>
                Look up a credential's issuer, owner, and recorded details.
                The issuer remains responsible for the claim.
              </p>
            </div>

          </div>
        </section>
      </main>
    </div>
    {showInfoModal && <CertificateDetailModal userType="verifier" onClose={closeModal} data={data} />}
    {showErrorModal && <VerificationFailedModal onClose={closeModal} />}
    </>

  );
}
