/**
 * @file AdminPage.tsx
 * @description This is the main parent component for the entire admin interface.
 * It handles the navigation between the three admin views (Dashboard, Grant Role, Manage Issuers)
 * and conditionally renders the correct component based on the active tab. It also
 * manages and passes down shared state and data to its children.
*/

import { useState, useEffect, useCallback } from 'react';

import Header from "../components/shared/Header";
import Toast from '../components/shared/Toast';

import AdminDashboard from '../components/admin/AdminDashboard';
import GrantRoleForm from '../components/admin/GrantRoleForm';
import ManageIssuersTable from '../components/admin/ManageIssuersTable';

import type { HeaderProps, ToastType, ToastState, Issuer, DashboardStats, ActivityItem } from '../types/types';
import styles from "./AdminPage.module.css";


export default function AdminPage({ onLogout, userAddress, contract, signer, header }: HeaderProps) {
  const [activeView, setActiveView] = useState('dashboard'); // Default to the table view
  const wait = (milliseconds: number | undefined) => new Promise(resolve => setTimeout(resolve, milliseconds));

  const [issuerList, setIssuerList] = useState<Issuer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalCertificates: 0,
    networkName: '',
    currentBlock: 0,
    lastSynced: new Date(),
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
  };
  const handleCloseToast = useCallback(() => {
    setToast(previous => ({ ...previous, show: false }));
  }, []);

  const fetchAllIssuers = useCallback(async () => {
      if (!contract) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      showToast("Loading trusted issuers from the blockchain...", 'info');


      try {
        const events = await contract.queryFilter(contract.filters.IssuerAdded(), 0, "latest");
        const issuerAddresses = events.map(event => event.args.issuerAddress);

        if (issuerAddresses.length === 0) {
          setIssuerList([]);
          showToast("No issuers have been added to the platform yet.", 'info');
          await wait(3000);
          handleCloseToast();
          return;
        }
        const issuerDataPromises = issuerAddresses.map(address => contract.issuers(address));

        const issuerStructs = await Promise.all(issuerDataPromises);
        type StatusString = 'Active' | 'Suspended' | 'Deactivated';
        const statusMapping: StatusString[] = ['Active', 'Suspended', 'Deactivated'];

        const fullIssuerList = issuerStructs.map((issuer, index) => ({
          address: issuerAddresses[index],
          name: issuer.name,
          website: issuer.website,
          status: statusMapping[Number(issuer.status)],
          registrationDate: new Date(Number(issuer.registrationDate) * 1000).toLocaleDateString(),
        }));

        setIssuerList(fullIssuerList);
        showToast("Successfully loaded all issuers.", 'success');
        await wait(3000);
        handleCloseToast();

      } catch (e) {
        console.error("Failed to fetch issuer list:", e);
        showToast("Error: Could not load issuer data.", 'error');
        await wait(3000);
        handleCloseToast();
      } finally {
        setIsLoading(false);
      }
    }, [contract, handleCloseToast]);

  useEffect(() => {
    fetchAllIssuers();
  }, [fetchAllIssuers]);

  const onUpdate = () => {
    fetchAllIssuers();
  };

   useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!contract || !contract.runner?.provider) return;
      try {
        const provider = contract.runner.provider;
        const [totalSupply, network, blockNumber] = await Promise.all([
          (await contract.queryFilter(contract.filters.CertificateIssued(), 0, "latest")).length,
          provider.getNetwork(),
          provider.getBlockNumber(),
        ]);
        setDashboardStats({
          totalCertificates: Number(totalSupply),
          networkName: network.name,
          currentBlock: blockNumber,
          lastSynced: new Date(),
        });

        const certIssuedEvents = await contract.queryFilter(contract.filters.CertificateIssued(), 0, "latest");
        const recentEvents = certIssuedEvents.slice(-5).reverse();

        const activityPromises = recentEvents.map(async (event) => {
            const certDetails = await contract.getCertificateDetails(event.args.tokenId);
            const issuerDetails = await contract.issuers(certDetails.issuerAddress);
            return {
                id: event.transactionHash,
                recipientName: certDetails.recipientName,
                issuerName: issuerDetails.name,
                courseTitle: certDetails.courseTitle,
                timestamp: new Date(Number(certDetails.issueDate) * 1000),
            };
        });
        const activity = await Promise.all(activityPromises);
        setRecentActivity(activity);
      } catch (e) {
        console.error("Failed to fetch dashboard stats:", e);
        showToast("Could not load real-time dashboard stats.", 'error');
      }
    };
    fetchDashboardStats();
  }, [contract]);

  return (
    <>
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={handleCloseToast} />
      <div className={styles.pageContainer}>
        <Header theme="dark" isConnected={true} userAddress={userAddress} onLogout={onLogout} header={header} signer={signer}/>
        <main className={styles.mainContent}>
          <nav className={styles.navBar}>
            <button
              className={`${styles.navButton} ${activeView === 'dashboard' ? styles.active : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`${styles.navButton} ${activeView === 'grantRole' ? styles.active : ''}`}
              onClick={() => setActiveView('grantRole')}
            >
              Grant Issuer Role
            </button>
            <button
              className={`${styles.navButton} ${activeView === 'manageIssuers' ? styles.active : ''}`}
              onClick={() => setActiveView('manageIssuers')}
            >
              Manage Issuers
            </button>
          </nav>

          <div className={styles.contentCard}>
            {activeView === 'dashboard' && <AdminDashboard
                totalIssuers={issuerList.filter(i => i.status === 'Active').length}
                suspendedIssuers={issuerList.filter(i => i.status === 'Suspended').length}
                contractAddress="0xc009f31C9f68c4d141091350D3aDDb77AB40d4F3"
                recentActivity={recentActivity}
                stats={dashboardStats}
              />}
            {activeView === 'grantRole' && contract && <GrantRoleForm contract={contract} signer={signer} />}
            {activeView === 'manageIssuers' && (
              <ManageIssuersTable
                issuerList={issuerList}
                isLoading={isLoading}
                contract={contract}
                signer={signer}
                onUpdate={onUpdate}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
