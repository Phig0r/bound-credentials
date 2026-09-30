/**
 * @file RecipientPage.tsx
 * @description This is the main page for a user with the "Recipient" role.
 * It determines whether to display the user's gallery of owned certificates
 * or an empty state message if they do not own any. It also handles the logic
 * for displaying the certificate detail modal.
*/

import { useState, useEffect, useCallback } from 'react';

import Header from "../components/shared/Header";
import Toast from "../components/shared/Toast";
import CertificateCard from "../components/recipient/CertificateCard";
import CertificateDetailModal from "../components/certificate/CertificateDetailModal";

import { useCertificateData } from '../hooks/useWeb3';

import { shortenAddress } from '../utils/formatter';
import type { HeaderProps, ToastState, ToastType, CertificateCardData } from '../types/types';
import styles from "./RecipientPage.module.css";

export default function RecipientPage({ onLogout, userAddress, contract, header }: HeaderProps) {
  const [certificateList, setCertificateList] = useState<CertificateCardData[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<bigint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const {data , fetchAllDetails} = useCertificateData(contract);
  const wait = (milliseconds: number | undefined) => new Promise(resolve => setTimeout(resolve, milliseconds));

  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
  };
  const handleCloseToast = useCallback(() => {
    setToast(previous => ({ ...previous, show: false }));
  }, []);

  useEffect(() => {
    const fetchUserCertificates = async () => {
      if (!contract || !userAddress) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      showToast("Loading your certificates from the blockchain...", 'info');

      try {
        const events = await contract.queryFilter(contract.filters.CertificateIssued(), 0, "latest");
        const certificatePromises = events.map(async (event) => {
          const tokenId = event.args.tokenId;
          const owner = await contract.ownerOf(tokenId);

          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            const certDetails = await contract.getCertificateDetails(tokenId);
            const issuerDetails = await contract.issuers(certDetails.issuerAddress);
            return {
              tokenId: tokenId,
              courseTitle: certDetails.courseTitle,
              issuerName: issuerDetails.name,
              issueDate: new Date(Number(certDetails.issueDate) * 1000).toLocaleDateString(),
            };
          }
          return null;
        });

        const allResults = await Promise.all(certificatePromises);
        const userOwnedCertificates = allResults.filter((cert): cert is CertificateCardData => cert !== null);

        if (userOwnedCertificates.length === 0) {
          showToast("You do not currently hold any certificates.", 'info');
          await wait(3000);
          handleCloseToast();
        } else {
          showToast(`Successfully loaded ${userOwnedCertificates.length} certificates.`, 'success');
          await wait(3000);
          handleCloseToast();
        }

        setCertificateList(userOwnedCertificates);

      } catch (e) {
        console.error("Failed to fetch certificates:", e);
        showToast("Error: Could not load your certificates.", 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCertificates();
  }, [contract, userAddress, handleCloseToast]);

  const openModal = (tokenId: bigint) => {
    try {
    setSelectedTokenId(tokenId);
    fetchAllDetails(tokenId);
    setIsModalOpen(true);
    } catch (error) {
      console.log("couldn't fetch details", error)
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTokenId(null);
  };

  return (
    <>
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={handleCloseToast} />
      <div className={styles.pageContainer}>
        <Header theme="dark" isConnected={true} userAddress={shortenAddress(userAddress)} onLogout={onLogout} header={header} />
        <main className={styles.mainContent}>
          <div className={styles.contentCard}>
            <h1 className={styles.pageTitle}>My Credentials</h1>

            {isLoading ? (
              <p>Loading your certificates...</p>
            ) : certificateList.length > 0 ? (
              <div className={styles.certificatesGrid}>
                {certificateList.map((cert) => (
                  <CertificateCard
                    key={String(cert.tokenId)}
                    courseTitle={cert.courseTitle}
                    issuerName={cert.issuerName}
                    issueDate={cert.issueDate}
                    onClick={() => openModal(cert.tokenId)}
                  />
                ))}
              </div>
            ) : (
              <p>No certificates found in your wallet.</p>
            )}
          </div>
        </main>
      </div>

      {isModalOpen && selectedTokenId && (
        <CertificateDetailModal
          userType="recipient"
          onClose={closeModal}
          data={data}
        />
      )}
    </>
  );
}
