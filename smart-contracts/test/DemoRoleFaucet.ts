import {SignerWithAddress} from "@nomicfoundation/hardhat-ethers/signers";
import {expect} from "chai";
import { ethers } from "hardhat";

import { DemoRoleFaucet } from "../typechain-types";
import { CertificateNft } from "../typechain-types";

describe("DemoRoleFaucet", function(){
   let demoRoleFaucet:DemoRoleFaucet;
   let certificateNft:CertificateNft;

   let owner, tester: SignerWithAddress;

   this.beforeEach(async function (){

      [owner, tester] = await ethers.getSigners();
      const DemoRoleFaucet = await ethers.getContractFactory("DemoRoleFaucet");
      const CertificateNft = await ethers.getContractFactory("CertificateNft");

      certificateNft = await CertificateNft.deploy();
      demoRoleFaucet = await DemoRoleFaucet.deploy(await certificateNft.getAddress());

      const adminRole = await certificateNft.ADMIN_ROLE();
      const defaultAdminRole = await certificateNft.DEFAULT_ADMIN_ROLE();
      await certificateNft.grantRole(defaultAdminRole, await demoRoleFaucet.getAddress());
      await certificateNft.grantRole(adminRole, await demoRoleFaucet.getAddress());

   })

   it("Should grant the ISSUER_ROLE to the caller", async function(){
      await demoRoleFaucet.connect(tester).requestIssuerRole();
      const issuerRole = await certificateNft.ISSUER_ROLE();
      const adminRole = await certificateNft.ADMIN_ROLE();
      expect(
         await certificateNft.hasRole(issuerRole,tester.address)
      ).to.be.true;
      expect(
         await certificateNft.hasRole(adminRole,tester.address)
      ).to.be.false;
   })

   it("Should grant the ADMIN_ROLE to the caller", async function(){
   await demoRoleFaucet.connect(tester).requestAdminRole();
      const issuerRole = await certificateNft.ISSUER_ROLE();
      const adminRole = await certificateNft.ADMIN_ROLE();
      expect(
         await certificateNft.hasRole(adminRole,tester.address)
      ).to.be.true;
      expect(
         await certificateNft.hasRole(issuerRole,tester.address)
      ).to.be.false;
   })

   it("Should revert if a user with no roles requests to be a recipient", async function(){
      await expect(
         demoRoleFaucet.connect(tester).requestRecipientRole()
      ).to.revertedWith("Faucet: User is already a Recipient.");
   })

   it("Should allow a Admin to revoke their roles and become a recipient", async function(){
      await demoRoleFaucet.connect(tester).requestAdminRole();
      await demoRoleFaucet.connect(tester).requestRecipientRole();
      const adminRole = await certificateNft.ADMIN_ROLE();

      expect(
         await certificateNft.hasRole(adminRole,tester.address)
      ).to.be.false;
   })

   it("Should allow a Issuer to revoke their roles and become a recipient", async function(){
      await demoRoleFaucet.connect(tester).requestIssuerRole();
      await demoRoleFaucet.connect(tester).requestRecipientRole();
      const issuerRole = await certificateNft.ISSUER_ROLE();

      expect(
         await certificateNft.hasRole(issuerRole,tester.address)
      ).to.be.false;
   })

})