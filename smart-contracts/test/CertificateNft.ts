import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {expect} from "chai";
import { ethers } from "hardhat";
import { CertificateNft } from "../typechain-types";

describe("CertificateNft", function(){

   let certificateNft: CertificateNft;

   let owner: SignerWithAddress;
   let issuer: SignerWithAddress;
   let recipient1: SignerWithAddress;
   let recipient2: SignerWithAddress;

   const status = {
      Active: 0,
      Suspended: 1,
      Deactivated: 2
   }

   this.beforeEach(async function (){
      [owner, issuer, recipient1, recipient2] = await ethers.getSigners();

      const CertificateNft = await ethers.getContractFactory("CertificateNft");
      certificateNft = await CertificateNft.deploy();
   });

      /// --- Constructor Tests ---

   it("Should grant the DEFAULT_ADMIN_ROLE to the deployer", async function(){
      const defaultAdminRole = await certificateNft.DEFAULT_ADMIN_ROLE();
      expect(
      await certificateNft.hasRole(defaultAdminRole,owner.address)
      ).to.be.true;
   })

      it("Should grant the ADMIN_ROLE to the contract deployer", async function(){
      const adminRole = await certificateNft.ADMIN_ROLE();
      expect(
         await certificateNft.hasRole(adminRole,owner.address)
      ).to.be.true;
   });

   /// --- { addIssuer() } function Tests ---

   it("Should revert when attempting to add an existing issuer", async function(){
      await certificateNft.addIssuer(issuer.address, "Test University","test.edu");

      await expect(
         certificateNft.addIssuer(issuer.address, "Test University","test.edu")
      ).to.be.revertedWith("Certify: Issuer already exist");
   });


   it("Should add a new issuer correctly", async function(){
      const issuerName = "Test University";
      const issuerWebsite = "test.edu"
      await certificateNft.addIssuer(issuer.address, issuerName, issuerWebsite);

      const issuerData = await certificateNft.issuers(issuer.address);
      const issuerRole = await certificateNft.ISSUER_ROLE();

      //check the role was granted
      expect(
         await certificateNft.hasRole(issuerRole, issuer.address)
      ).to.be.true;

      //check data was stored correctly
      expect(issuerData.name).to.equal(issuerName);
      expect(issuerData.website).to.equal(issuerWebsite);

   });

   it("Should emit an IssuerAdded event upon successful addition", async function(){

      await expect(
         certificateNft.addIssuer(issuer.address, "Test University", "test.edu")
      ).to.emit(certificateNft, "IssuerAdded")
      .withArgs(issuer.address)
   });

   /// --- { updateIssuerStatus() } function Tests ---

   it("Should revert if the target issuer does not exist", async function(){
      await expect(
         certificateNft.updateIssuerStatus(issuer.address,status.Suspended)
      ).to.revertedWith("Certify: Issuer does not exist");
   });

   it("Should revert if the new status is the same as the current one", async function(){
      await certificateNft.addIssuer(issuer.address, "Test University", "test.edu");
      await expect(
         certificateNft.updateIssuerStatus(issuer.address,status.Active)
      ).to.revertedWith("Certify: Issuer already has this status");
   });

   it("Should revert when attempting to update a permanently deactivated issuer", async function(){
      await certificateNft.addIssuer(issuer.address, "Test University", "test.edu");
      await certificateNft.updateIssuerStatus(issuer.address,status.Deactivated);

      await expect(
         certificateNft.updateIssuerStatus(issuer.address,status.Active)
      ).to.revertedWith("Certify: Issuer is permanently deactivated");
   });

   it("Should successfully update the issuer's status", async function(){
      await certificateNft.addIssuer(issuer.address, "Test University", "test.edu");
      await certificateNft.updateIssuerStatus(issuer.address,status.Suspended);

      const issuerInfo = await certificateNft.issuers(issuer.address);

      expect(issuerInfo.status).to.equal(status.Suspended);
   });

   it("Should revoke the ISSUER_ROLE when the status is set to Deactivated", async function(){
      await certificateNft.addIssuer(issuer.address, "Test University", "test.edu");
      await certificateNft.updateIssuerStatus(issuer.address,status.Deactivated);

      const issuerRole = await certificateNft.ISSUER_ROLE();

      expect(
         await certificateNft.hasRole(issuerRole, issuer.address)
      ).to.be.false;
   });

   it("Should emit an IssuerRoleRevoked event upon deactivation", async function(){
      await certificateNft.addIssuer(issuer.address, "Test University", "test.edu");

      await expect(
         certificateNft.updateIssuerStatus(issuer.address,status.Deactivated)
      ).to.emit(certificateNft, "IssuerRoleRevoked")
      .withArgs(issuer.address);
   });

   it("Should emit an IssuerStatusUpdated event on a successful update", async function(){
      const currentStatus = status.Active;
      const newStatus = status.Suspended;

      await certificateNft.addIssuer(issuer.address, "Test University", "test.edu");


      await  expect(
         certificateNft.updateIssuerStatus(issuer.address,newStatus)
      ).to.emit(certificateNft, "IssuerStatusUpdated").withArgs(issuer.address, currentStatus, newStatus);
   });

   /// --- { issueCertificate() } function Tests ---

   it("Should revert if the calling issuer is not in an Active state", async function(){
      await certificateNft.addIssuer(issuer.address, "Test University", "test.edu");
      await certificateNft.updateIssuerStatus(issuer.address,status.Suspended);

      await expect(
         certificateNft.connect(issuer).issueCertificate(recipient1.address, "recipient1 1", "Course 1")
      ).to.be.revertedWith("Certify: Issuer is not active");
   });

   it("Should mint with an incrementing token ID", async function(){
      await certificateNft.addIssuer(issuer.address, "Test University", "test.edu");
      await certificateNft.connect(issuer).issueCertificate(recipient1.address, "recipient1 1", "Course 1");
      await expect(
         certificateNft.connect(issuer).issueCertificate(recipient1.address, "recipient1 1", "Course 2")
      ).to.emit(certificateNft, "CertificateIssued")
      .withArgs(1,issuer.address,recipient1.address);
   });

   it("Should correctly store all certificate details and assign token ownership", async function(){
      const recipientName = "recipient1 1";
      const courseTitle = "Course 1"
      await certificateNft.addIssuer(issuer.address, "Test University", "test.edu");
      await certificateNft.connect(issuer).issueCertificate(recipient1.address, recipientName, courseTitle);

      const certifDetail = await certificateNft.getCertificateDetails(0);
      const owner = await certificateNft.ownerOf(0);

      expect(certifDetail.issuerAddress).to.equal(issuer.address);
      expect(certifDetail.recipientAddress).to.equal(recipient1.address);
      expect(certifDetail.recipientName).to.equal(recipientName);
      expect(certifDetail.courseTitle).to.equal(courseTitle);
      expect(owner).to.equal(recipient1.address);
   });

   /// --- { getCertificateDetails() } function Tests ---

   it("Should revert if the certificate ID does not exist", async function() {
      await expect(
         certificateNft.getCertificateDetails(999)
      ).to.be.revertedWith("Certify: Certificate does not exist");
   });

   it("Should return the correct details for an existing certificate", async function() {
      const recipientName = "recipient1 1";
      const courseTitle = "Course 1"
      await certificateNft.addIssuer(issuer.address, "Test University", "test.edu");
      await certificateNft.connect(issuer).issueCertificate(recipient1.address, recipientName, courseTitle);

      const details = await certificateNft.getCertificateDetails(0);
      expect(details.recipientName).to.equal(recipientName);
   });

   /// --- { transferFrom() } function Tests ---

   it("Should enforce non-transferability for soulbound tokens", async function() {
      await certificateNft.addIssuer(issuer.address, "Test University", "test.edu");
      await certificateNft.connect(issuer).issueCertificate(recipient1.address, "recipient1 1", "Course 1");

      await expect(
         certificateNft.connect(recipient1).transferFrom(recipient1.address,recipient2.address,0)
      ).to.be.revertedWith("Soulbound: This token is non-transferable.");
   });


});