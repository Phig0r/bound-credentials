/**
 * @file types.ts
 * @description Centralized TypeScript type definitions for the Bound Credentials application.
 * This file contains shared interfaces and types for smart contract data,
 * component props, and general application state.
*/

import type { CertificateNft } from "./contracts/CertificateNft";
import type { DemoRoleFaucet } from "./contracts/DemoRoleFaucet";
import type {ethers, BigNumberish } from "ethers";

// --- Web3 & Smart Contract Types ---
export type {CertificateNft, DemoRoleFaucet}

export type StatusString = 'Active' | 'Suspended' | 'Deactivated' | undefined;
export type Roles = 'admin' | 'issuer' | 'recipient' |undefined;

export interface Issuer {
  address: string;
  name: string;
  website: string;
  status: StatusString;
  registrationDate: string;
}

export interface CertificateData {
   courseTitle: string;
   recipientName: string;
   recipientAddress: string;
   issueDate: string;
   tokenId: BigNumberish | null;
   issuerName: string;
   issuerAddress: string;
   website: string;
   issuerStatus: bigint;
   registrationDate: string;
}

export interface DashboardStats {
  totalCertificates: number;
  networkName: string;
  currentBlock: number;
  lastSynced: Date;
}

export interface ActivityItem {
    id: string;
    recipientName: string;
    issuerName: string;
    courseTitle: string;
    timestamp: Date;
}

// --- Component Prop Types ---

export interface HeaderProps{
  header?: string | null;
  contract?: CertificateNft | null;
  signer?: ethers.Signer | null;
  userAddress?:string|null;
  courseTitle?: string;
  issuerName?: string;
  issueDate?: string;
  issuerList?: Issuer[];
  isLoading?: boolean;
  theme?: 'light' | 'dark';
  isConnected?: boolean;
  userType?: 'verifier' | 'recipient';
  data?: CertificateData|null;
  isOpen?: boolean;
  currentStatus?: StatusString;
  isUpdating?: boolean;
  totalIssuers?: number;
  suspendedIssuers?: number;
  contractAddress?: string;
  stats?: DashboardStats;
  recentActivity?: ActivityItem[];
  link?: string;
  onSelectRole?: (role: Roles)=>void;
  showToast?: (message: string, type: ToastType) => void;
  onClick?: () => void;
  onConnect?: () => void;
  onLogout?: ()=> void;
  onUpdate?: () => void;
  onClose?: () => void;
  onSubmit?: (newStatus: StatusString) => void;
}

export interface ToastProps {
  show: boolean;
  message: string;
  type: ToastType;
  onClose: () => void;
}

export interface CertificateCardData {
  tokenId: bigint;
  courseTitle: string;
  issuerName: string;
  issueDate: string;
}


// --- UI State Types ---

export type ToastType = 'info' | 'success' | 'error';

export interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}