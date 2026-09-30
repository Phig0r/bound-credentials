# Bound Credentials contracts

Two Solidity contracts implement wallet-bound certificates and a demonstration-only role faucet.

- `CertificateNft`: ERC-721 storage, transfer rejection, issuer records, issuance, and OpenZeppelin AccessControl.
- `DemoRoleFaucet`: public calls to request admin, issuer, or ordinary-recipient status. It needs privileged roles on the certificate contract. Its grants do not expire automatically.

The on-chain token name remains `CertifyChain` (`CERT`) for compatibility with the existing implementation. Bound Credentials is the application and repository name.

## Install and test

From this directory:

```sh
npm ci
npm test
```

`npm test` uses Hardhat's local simulated network and may compile the contracts. It does not require a funded Sepolia wallet. If matching artifacts already exist, `npm run test:existing` skips compilation. `npm run coverage` generates local coverage output. `npm run typecheck` checks the TypeScript configuration and tests.

The test files are [`test/CertificateNft.ts`](test/CertificateNft.ts) and [`test/DemoRoleFaucet.ts`](test/DemoRoleFaucet.ts). They cover issuance, issuer status handling, ownership and record lookup, transfer rejection, and faucet role changes. Interpret these as selected behavioral checks, not a security proof.

## Optional Sepolia deployment

Copy `.env.example` to `.env` and fill in `SEPOLIA_RPC_URL`, a dedicated test-wallet `PRIVATE_KEY`, and optionally `ETHERSCAN_API_KEY`. Local tests do not need these values. Keep `.env` out of Git.

```sh
npx hardhat ignition deploy ignition/modules/DeployCertify.ts --network sepolia
```

This module deploys both contracts and grants the faucet admin privileges. It is a demo deployment, not a production issuer-enrollment configuration. An old deployment journal uses a different module identifier; do not treat it as a resumable run of the current module without checking compatibility. A fresh deployment produces new addresses; update the frontend constants and ABIs before using it.

## Important boundaries

- Transfer rejection binds a token to an address, not an identified person.
- Role grants and issuer registration are separate. A directly granted issuer role can issue without a registered institution record because the default status enum value is Active.
- Suspending an issuer prevents new issuance through the status check, but does not remove existing certificates.
- There is no certificate-level revocation or wallet-recovery workflow.
- The public demo faucet deliberately permits privilege requests. Its grants are not time-limited.

See the [root README](../README.md) for the full threat model, public-data implications, and manual test procedure.
