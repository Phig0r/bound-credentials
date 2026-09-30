# Bound Credentials frontend

React, TypeScript, Vite, and ethers interface for the Sepolia credential contracts. It provides public certificate lookup, issuer and admin workflows, a recipient gallery, and demo role requests.

## Start

From this directory, with Node.js 22.12+ and npm:

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Connect a MetaMask-compatible wallet and switch to Sepolia. The app reads through the injected provider and asks the wallet to sign writes. Test ETH is needed for transactions.

## Configuration

- Contract addresses: [`src/utils/constants.ts`](src/utils/constants.ts).
- Contract interfaces: [`src/utils/abi/`](src/utils/abi/).
- Wallet connection and lookup: [`src/hooks/useWeb3.ts`](src/hooks/useWeb3.ts).
- There is no application backend and no required frontend `.env` file. Optional `VITE_ALCHEMY_SEPOLIA_URL` customizes the RPC URL offered when adding Sepolia to a wallet; reads still use the injected wallet provider.
- Never put a wallet private key in the frontend. Change addresses and ABIs together when using a different deployment.

## Checks and hosting

```sh
npm run build
npm run lint
npm run preview
```

Vite writes the production site to `dist/`. The current live URL is [sbt-verifiable-credentials.vercel.app](https://sbt-verifiable-credentials.vercel.app/); the repository rename does not require changing that URL. For a frontend-only host, use this directory as the project root, `npm run build` as the build command, and `dist` as the output directory.

No dedicated frontend test suite is included. Follow the [manual procedure](../README.md#manual-demo-procedure) to test wallet interaction, role changes, issuance, and lookup.

## What a successful lookup means

The UI reads a recorded credential and issuer information. It cannot establish a real qualification, institutional accreditation, or a unique human identity. Names and course data are public, and the demo faucet lets visitors obtain privileged roles. Use fictitious data. See the [trust boundaries](../README.md#what-the-system-does-not-guarantee).

## Contract types

The frontend keeps the generated contract TypeScript interfaces in `src/types/contracts/` and `src/types/common.ts` so a clean frontend-only deployment does not depend on ignored files in the contract package. After changing the Solidity interfaces, run the contract build/tests, then `npm run types:sync` here and commit the refreshed types alongside the matching ABI files.
