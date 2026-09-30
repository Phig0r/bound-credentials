import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";
const CertifyModule = buildModule("CertifyModule", (m) => {
  // 1. Deploy the main CertificateNft contract.
  const certificateNft = m.contract("CertificateNft");

  // 2. Deploy the DemoRoleFaucet, passing the main contract's address
  //    to its constructor to link them.
  const demoRoleFaucet = m.contract("DemoRoleFaucet", [certificateNft]);

  // 3. Read argument "newAdminRole" for the "RoleAdminChanged" event to get the ADMIN_ROLE.
  const adminRole = m.readEventArgument(certificateNft, "RoleAdminChanged", "newAdminRole");
  const defaultAdminRole = ethers.ZeroHash;

  // 4. Grant the ADMIN_ROLE to the faucet contract
  //    so it can act as an admin on the main contract's behalf.
  m.call(certificateNft, "grantRole", [adminRole, demoRoleFaucet], {
    id: "GrantAdminRoleToFaucet",
  });

  m.call(certificateNft, "grantRole", [defaultAdminRole, demoRoleFaucet], {
    id: "GrantDefaultAdminToFaucet",
  });

  return { certificateNft, demoRoleFaucet };
});

export default CertifyModule;