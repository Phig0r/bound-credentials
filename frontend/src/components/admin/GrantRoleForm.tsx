import { errorMessage as getErrorMessage } from "../../utils/errors";
/**
 * @file GrantRoleForm.tsx
 * @description A component that provides a form for an admin to onboard a new
 * institution. It includes fields for the institution's details and a real-time
 * preview panel to allow the admin to verify the information before submitting
 * the on-chain transaction.
*/

import { useState } from 'react';

import { isAddress } from 'ethers';

import Toast from '../shared/Toast';

import BriefcaseIcon from '../../assets/icons/briefcase.svg?react';
import LinkIcon from '../../assets/icons/link.svg?react';
import KeyIcon from '../../assets/icons/wallet.svg?react';
import ActivityIcon from '../../assets/icons/activity.svg?react';
import InfoIcon from '../../assets/icons/info.svg?react';

import { shortenAddress } from '../../utils/formatter';
import { wait } from '../../utils/constants';
import type { HeaderProps, ToastType, ToastState } from '../../types/types';
import styles from './GrantRoleForm.module.css';

export default function GrantRoleForm({contract, signer}:HeaderProps) {
  const [institutionName, setInstitutionName] = useState('');
  const [website, setWebsite] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const addIssuer = async ()=>{
    if (!institutionName || !website) {
      showToast("Please fill out all fields.", 'error');
      await wait(3000);
      handleCloseToast();
      return;
    }
    if (!isAddress(walletAddress)) {
      showToast("Please enter a valid wallet address.", 'error');
      await wait(3000);
      handleCloseToast();
      return;
    }

    setIsLoading(true);
    showToast("Please confirm the transaction in your wallet.", 'info');
    try{
      if(!contract){
        return
      }
      const connectedContract = contract.connect(signer);

      const tx = await connectedContract.addIssuer(walletAddress,institutionName,website);
      showToast("Transaction submitted. Waiting for confirmation...", 'info');

      await tx.wait();
      showToast("Success! Issuer has been granted the role.", 'success');

      await wait(3000);
      handleCloseToast();

      setInstitutionName('');
      setWebsite('');
      setWalletAddress('');

    } catch (err) {
      console.error(err);
      const errorMessage = getErrorMessage(err, "An unknown error occurred.");
      showToast("Transaction " + errorMessage, 'error');
      await wait(3000);
      handleCloseToast();
    } finally {
      setIsLoading(false);
    }
  }


  return (
   <>
    <Toast show={toast.show} message={toast.message} type={toast.type} onClose={handleCloseToast}/>
    <div className={styles.formContainer}>

      <h1 className={styles.pageTitle}>Grant New Issuer Role</h1>

      <div className={styles.formGrid}>
        {/* --- Left Column: Form --- */}
        <div className={styles.formColumn}>
          <div className={styles.inputGroup}>
            <label htmlFor="institutionName" className={styles.inputLabel}>Institution Name</label>
            <input
              id="institutionName"
              type="text"
              className={styles.textInput}
              placeholder="e.g., Global Tech Institute"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="website" className={styles.inputLabel}>Official Website</label>
            <input
              id="website"
              type="text"
              className={styles.textInput}
              placeholder="e.g., https://www.example.edu"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="walletAddress" className={styles.inputLabel}>Wallet Address</label>
            <input
              id="walletAddress"
              type="text"
              className={styles.textInput}
              placeholder="e.g., 0xAbCd...1234"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Default Status</label>
            <div className={styles.readOnlyField}>
              <span className={styles.statusDot}></span>
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* --- Right Column: Preview --- */}
        <div className={styles.previewColumn}>
          <h2 className={styles.previewTitle}>Review Details</h2>
          <div className={styles.previewList}>
            <div className={styles.previewItem}>
              <BriefcaseIcon />
              <div>
                <span className={styles.previewLabel}>Institution Name</span>
                <span className={styles.previewValue}>{institutionName || "..."}</span>
              </div>
            </div>
            <div className={styles.previewItem}>
              <LinkIcon />
              <div>
                <span className={styles.previewLabel}>Official Website</span>
                <span className={styles.previewValue}>{website || "..."}</span>
              </div>
            </div>
            <div className={styles.previewItem}>
              <KeyIcon />
              <div>
                <span className={styles.previewLabel}>Wallet Address</span>
                <span className={styles.previewValue}>{shortenAddress(walletAddress) || "..."}</span>
              </div>
            </div>
            <div className={styles.previewItem}>
              <ActivityIcon />
              <div>
                <span className={styles.previewLabel}>Status</span>
                <span className={styles.previewValueActive}>Active</span>
              </div>
            </div>
          </div>
          <div className={styles.infoMessage}>
            <InfoIcon />
            <p>Please review all details for accuracy. Granting an issuer role is a significant on-chain action that cannot be easily undone and will require a gas fee. You will be prompted to sign and confirm this transaction in your wallet.</p>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.grantButton} onClick={addIssuer} disabled={isLoading}>Grant Role</button>
      </div>
    </div>
   </>
  );
}
