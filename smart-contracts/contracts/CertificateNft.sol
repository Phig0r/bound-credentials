// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CertificateNft is ERC721, AccessControl {
   enum IssuerStatus { Active, Suspended, Deactivated }

   struct CertificateData {
      string recipientName;
      address recipientAddress;
      address issuerAddress;
      uint256 issueDate;
      string courseTitle;
   }

   struct Issuer {
      string name;
      string website;
      IssuerStatus status;
      uint256 registrationDate;
   }

   bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
   bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

   mapping(address => Issuer) public issuers;
   mapping(uint256 => CertificateData) public certificateDetails;
   uint256 private _nextTokenId;

   event IssuerAdded(address indexed issuerAddress);
   event IssuerRoleRevoked(address indexed issuerAddress);
   event IssuerStatusUpdated(
      address indexed issuerAddress,
      IssuerStatus oldStatus,
      IssuerStatus newStatus
   );
   event CertificateIssued(
      uint256 indexed tokenId,
      address indexed issuer,
      address indexed recipient
   );

   constructor() ERC721("CertifyChain", "CERT") {
      _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
      _grantRole(ADMIN_ROLE, msg.sender);
      _setRoleAdmin(ISSUER_ROLE, ADMIN_ROLE);
   }


   /**
    * @dev See {IERC165-supportsInterface}.
    */
   function supportsInterface(bytes4 interfaceId)
      public
      view
      override(ERC721, AccessControl)
      returns (bool)
   {
      return super.supportsInterface(interfaceId);
   }

   // --- Admin Functions ---

   /**
    * @notice Grants the ISSUER_ROLE to a new address and records their details.
    * @dev This function is protected by the ADMIN_ROLE modifier. It checks to ensure
    * an issuer does not already exist at the given address to prevent overwriting data.
    * The new issuer's status defaults to Active.
    * @param _issuerAddress The wallet address of the new institution to be verified.
    * @param _name The official name of the institution.
    * @param _website The official website of the institution.
   */
   function addIssuer(
      address _issuerAddress,
      string memory _name,
      string memory _website
      ) external onlyRole(ADMIN_ROLE) {
         require(!_issuerExists(_issuerAddress), "Certify: Issuer already exist");

         _grantRole(ISSUER_ROLE, _issuerAddress);

         issuers[_issuerAddress] = Issuer({
            name: _name,
            website: _website,
            status: IssuerStatus.Active,
            registrationDate: block.timestamp
         });

         emit IssuerAdded(_issuerAddress);
   }

   /**
    * @notice Allows an admin to update an issuer's operational status.
    * @dev If the new status is Deactivated, this will also permanently revoke the issuer's ISSUER_ROLE.
    * This function is protected by ADMIN_ROLE and includes checks for existence and redundant status changes.
    * @param _issuerAddress The address of the issuer whose status is being updated.
    * @param _newStatus The new IssuerStatus to assign.
   */
   function updateIssuerStatus(address _issuerAddress, IssuerStatus _newStatus)
      external
      onlyRole(ADMIN_ROLE)
   {
      require(_issuerExists(_issuerAddress), "Certify: Issuer does not exist");
      require(
         issuers[_issuerAddress].status != IssuerStatus.Deactivated,
         "Certify: Issuer is permanently deactivated"
      );
      require(
         issuers[_issuerAddress].status != _newStatus,
         "Certify: Issuer already has this status"
      );

      IssuerStatus currentStatus = issuers[_issuerAddress].status;
      issuers[_issuerAddress].status = _newStatus;

      if (_newStatus == IssuerStatus.Deactivated) {
         revokeRole(ISSUER_ROLE, _issuerAddress);
         emit IssuerRoleRevoked(_issuerAddress);
      }

      emit IssuerStatusUpdated(_issuerAddress, currentStatus, _newStatus);
   }

   // --- Issuer Functions ---

   /**
    * @dev Overrides the internal _update function to enforce that tokens are non-transferable (soulbound).
    * This function allows the initial minting (from address(0)) but reverts any subsequent transfer attempts.
   */
   function _update(address to, uint256 tokenId, address auth)
      internal
      override
      returns (address)
   {
      require(
         _ownerOf(tokenId) == address(0),
         "Soulbound: This token is non-transferable."
      );
      return super._update(to, tokenId, auth);
   }

   /**
    * @notice Mints a new soulbound certificate and assigns it to a recipient.
    * @dev Can only be called by an address with an Active ISSUER_ROLE. Stores certificate
    * metadata on-chain and then safely mints the non-transferable NFT.
    * @param _recipientAddress The wallet address of the certificate recipient.
    * @param _recipientName The full name of the recipient.
    * @param _courseTitle The name of the course or degree being certified.
   */
   function issueCertificate(
      address _recipientAddress,
      string memory _recipientName,
      string memory _courseTitle
   ) external onlyRole(ISSUER_ROLE) {
      require(
         issuers[msg.sender].status == IssuerStatus.Active,
         "Certify: Issuer is not active"
      );

      uint256 tokenId = _nextTokenId;
      _nextTokenId++;

      certificateDetails[tokenId] = CertificateData({
         recipientName: _recipientName,
         recipientAddress: _recipientAddress,
         issuerAddress: msg.sender,
         issueDate: block.timestamp,
         courseTitle: _courseTitle
      });

      _safeMint(_recipientAddress, tokenId);

      emit CertificateIssued(tokenId, msg.sender, _recipientAddress);
   }

   // --- Public & Verifier Functions ---

   /**
    * @notice Retrieves the details of a certificate by its ID.
    * @dev Returns the CertificateData struct for the given certificate ID.
    * Reverts if the certificate does not exist.
    * @param _tokenId The unique ID of the certificate to query.
    * @return CertificateData The details of the certificate.
   */
   function getCertificateDetails(uint256 _tokenId)
      external
      view
      returns (CertificateData memory)
   {
      require(
         _certificateExists(_tokenId),
         "Certify: Certificate does not exist"
      );
      return certificateDetails[_tokenId];
   }

   // --- Internal Helper Functions ---

   /**
    * @dev Internal helper function to check if an issuer exists.
    * @param _issuerAddress The address to check.
    * @return bool True if the issuer's registrationDate is not zero, false otherwise.
   */
   function _issuerExists(address _issuerAddress)
      internal
      view
      returns (bool)
   {
      return (issuers[_issuerAddress].registrationDate != 0);
   }

   /**
    * @dev Internal helper function to check if a certificate exists.
    * @param _tokenId The ID of the token to check.
    * @return bool True if the certificate's issueDate is not zero, false otherwise.
   */
   function _certificateExists(uint256 _tokenId)
      internal
      view
      returns (bool)
   {
      return (certificateDetails[_tokenId].issueDate != 0);
   }
}
