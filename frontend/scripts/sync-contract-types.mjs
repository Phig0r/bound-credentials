import { copyFileSync, mkdirSync } from 'node:fs';

const source = new URL('../../smart-contracts/typechain-types/', import.meta.url);
const destination = new URL('../src/types/', import.meta.url);
mkdirSync(new URL('contracts/', destination), { recursive: true });
for (const name of ['CertificateNft', 'DemoRoleFaucet']) {
  copyFileSync(new URL(`contracts/${name}.ts`, source), new URL(`contracts/${name}.ts`, destination));
}
copyFileSync(new URL('common.ts', source), new URL('common.ts', destination));
