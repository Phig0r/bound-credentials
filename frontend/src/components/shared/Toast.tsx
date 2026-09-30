/**
 * @file Toast.tsx
 * @description A reusable toast notification component for displaying temporary
 * success, error, or info messages to the user with a consistent style.
*/

import React, { useEffect, useState } from 'react';
import styles from './Toast.module.css';

import type { ToastType, ToastProps } from '../../types/types';

const ToastIcon = ({ type }: { type: ToastType }) => {
  switch (type) {
    case 'success':
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'error':
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'info':
      return <div className={styles.spinner}></div>;
    default:
      return null;
  }
};

const Toast: React.FC<ToastProps> = ({ show, message, type, onClose }) => {
  const [currentToast, setCurrentToast] = useState({ message, type });
  useEffect(() => {
    if (show) {
      setCurrentToast({ message, type });
    }
  }, [show, message, type]);

  const toastClasses = `${styles.toastContainer} ${show ? styles.show : ''} ${styles[currentToast.type]}`;

  return (
    <div className={toastClasses}>
      <div className={styles.iconContainer}>
        <ToastIcon type={currentToast.type} />
      </div>
      <p className={styles.toastMessage}>{currentToast.message}</p>
      <button onClick={onClose} className={styles.closeButton}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
};

export default Toast;
