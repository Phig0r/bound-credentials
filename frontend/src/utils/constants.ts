/**
 * @file constants.ts
 * @description Centralized constants for the Bound Credentials application.
 * This file exports non-changing values such as deployed smart contract addresses
 * and utility functions that are used across the application.
*/

// --- Smart Contract Addresses ---
export const CERTIFY_CHAIN_ADDRESS = "0xc009f31C9f68c4d141091350D3aDDb77AB40d4F3";
export const DEMO_ROLE_FAUCET_ADDRESS = "0x5fA4f02152d33ab9FE683574525b89D024Ae9c1f";

// --- Utility Functions ---

/**
 * A simple helper function to create a delay.
 * @param milliseconds The number of milliseconds to wait.
 */
export const wait = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));
