/**
 * @file App.tsx
 * @description This is the main root component for the entire application.
 * It acts as a central router, managing the wallet connection state and user roles.
 * Based on the user's role (Admin, Issuer, or Recipient), it conditionally renders
 * the appropriate top-level page component.
 */

import { useEffect, useState, useCallback } from "react";

import AdminPage from "./pages/AdminPage";
import IssuerPage from "./pages/IssuerPage";
import LandingPage from "./pages/LandingPage";
import RecipientPage from "./pages/RecipientPage";
import EmptyState from "./pages/EmptyState";

import { useWalletConnect, useContract } from "./hooks/useWeb3";

import Toast from "./components/shared/Toast";

import { shortenAddress } from "./utils/formatter";
import { wait } from "./utils/constants";
import type { ToastState, ToastType } from "./types/types";

export default function App() {
  const { walletAddress, signer, connectWallet, disconnectWallet , closingToast} = useWalletConnect();
  const certificateContract = useContract(signer);
  useEffect(()=>{

  },[signer]);


  const [userRole, setUserRole] = useState<'admin' | 'issuer' | 'recipient1' | 'recipient2' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info',
  });


  const showToast = (message: string, type:ToastType) => {
    setToast({show:true, message, type})
  }

    const handleCloseToast = useCallback(() => {
    setToast(previous => ({ ...previous, show: false }));
  }, []);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!certificateContract || !walletAddress) {
        setIsLoading(false);
        return;
      }
      showToast("Connecting Wallet...", 'info');
      setIsLoading(true);
      try {
        const adminRole = await certificateContract.ADMIN_ROLE();
        const issuerRole = await certificateContract.ISSUER_ROLE();
        if (await certificateContract.hasRole(adminRole, walletAddress)) {
          setUserRole('admin');

          showToast("Authenticating Admin privileges...", 'info');
          await wait(3000);
          handleCloseToast();
          await wait(500);
          setIsLoading(false);

          return;
        }
        else if (await certificateContract.hasRole(issuerRole, walletAddress)) {
          setUserRole('issuer');

          showToast("Verifying Issuer credentials...", 'info');
          await wait(3000);
          handleCloseToast();
          await wait(500);
          setIsLoading(false);

          return;
        }else if(await certificateContract.balanceOf(walletAddress) > 0){
          setUserRole("recipient1");

          showToast("Loading your personal credentials...", 'info');
          await wait(3000);
          handleCloseToast();
          await wait(500);
          setIsLoading(false);
          return;
        }else{
          setUserRole('recipient2');

          showToast("Loading your personal credentials...", 'info');
          await wait(3000);
          handleCloseToast();
          await wait(500);
          setIsLoading(false);
          return;
        }



      } catch (error) {
        console.error("Failed to fetch user role:", error);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [certificateContract, walletAddress, handleCloseToast]);

  if (isLoading) {
    return (<>
        <Toast show={toast.show} message={toast.message} type={toast.type} onClose={handleCloseToast}/>
        <LandingPage onConnect={connectWallet} contract={certificateContract} />
    </>)

  }
  if (!walletAddress) {
        return (<>
        <LandingPage onConnect={connectWallet} contract={certificateContract} />
    </>)
  }

  switch (userRole) {
    case "admin":
      return <>
        <Toast show={closingToast.show} message={closingToast.message} type={closingToast.type} onClose={handleCloseToast}/>
        <AdminPage onLogout={disconnectWallet} userAddress={shortenAddress(walletAddress)} contract={certificateContract} signer={signer} header={"Governance Dashboard"}/>;
      </>
    case "issuer":
      return <>
          <Toast show={closingToast.show} message={closingToast.message} type={closingToast.type} onClose={handleCloseToast}/>
            <IssuerPage onLogout={disconnectWallet} contract={certificateContract} signer={signer} userAddress={walletAddress} header={"Certificate Minting"} />;
      </>
    case "recipient1":
      return <>
          <Toast show={closingToast.show} message={closingToast.message} type={closingToast.type} onClose={handleCloseToast}/>
          <RecipientPage contract={certificateContract} onLogout={disconnectWallet} userAddress={walletAddress} header={"My Credentials"} />;
      </>
    case "recipient2":
      return <>
          <Toast show={closingToast.show} message={closingToast.message} type={closingToast.type} onClose={handleCloseToast}/>
          <EmptyState onLogout={disconnectWallet} userAddress={shortenAddress(walletAddress)} signer={signer}/>;
      </>
    default:
      return <>
          <Toast show={closingToast.show} message={closingToast.message} type={closingToast.type} onClose={handleCloseToast}/>
          <LandingPage onConnect={connectWallet} contract={certificateContract} />;
      </>
  }
}
