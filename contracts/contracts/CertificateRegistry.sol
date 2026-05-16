// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CertificateRegistry
 * @dev Stores and verifies academic certificates on-chain.
 *      Each certificate ID can only be issued once (tamper-proof).
 */
contract CertificateRegistry {
    // ─── Data Structures ───────────────────────────────────────────────────────

    struct Certificate {
        string studentName;
        string courseName;
        string certificateId;
        uint256 issueDate;     // Unix timestamp
        address issuer;        // Wallet that called issueCertificate
        bool exists;           // Used to detect whether record is present
    }

    // ─── State ──────────────────────────────────────────────────────────────────

    // certificateId => Certificate struct
    mapping(string => Certificate) private certificates;

    // Track all issued IDs so we can enumerate them if needed
    string[] public certificateIds;

    // ─── Events ─────────────────────────────────────────────────────────────────

    event CertificateIssued(
        string indexed certificateId,
        string studentName,
        string courseName,
        uint256 issueDate,
        address indexed issuer
    );

    // ─── Errors ──────────────────────────────────────────────────────────────────

    error CertificateAlreadyExists(string certificateId);
    error EmptyField(string fieldName);

    // ─── Functions ───────────────────────────────────────────────────────────────

    /**
     * @notice Issue a new certificate. Reverts if the ID already exists.
     * @param _studentName  Full name of the student
     * @param _courseName   Name of the completed course
     * @param _certificateId Unique certificate identifier (e.g. "CERT-2024-001")
     * @param _issueDate    Unix timestamp of the issue date
     */
    function issueCertificate(
        string calldata _studentName,
        string calldata _courseName,
        string calldata _certificateId,
        uint256 _issueDate
    ) external {
        // Basic validation
        if (bytes(_certificateId).length == 0) revert EmptyField("certificateId");
        if (bytes(_studentName).length == 0)  revert EmptyField("studentName");
        if (bytes(_courseName).length == 0)   revert EmptyField("courseName");

        // Prevent duplicates
        if (certificates[_certificateId].exists) {
            revert CertificateAlreadyExists(_certificateId);
        }

        // Store on-chain
        certificates[_certificateId] = Certificate({
            studentName:   _studentName,
            courseName:    _courseName,
            certificateId: _certificateId,
            issueDate:     _issueDate,
            issuer:        msg.sender,
            exists:        true
        });

        certificateIds.push(_certificateId);

        emit CertificateIssued(
            _certificateId,
            _studentName,
            _courseName,
            _issueDate,
            msg.sender
        );
    }

    /**
     * @notice Verify a certificate by ID.
     * @param _certificateId The certificate ID to look up
     * @return exists       Whether this certificate was ever issued
     * @return studentName  Name of the student
     * @return courseName   Course that was completed
     * @return issueDate    Unix timestamp
     * @return issuer       Wallet address that issued the certificate
     */
    function verifyCertificate(string calldata _certificateId)
        external
        view
        returns (
            bool exists,
            string memory studentName,
            string memory courseName,
            uint256 issueDate,
            address issuer
        )
    {
        Certificate storage cert = certificates[_certificateId];
        return (
            cert.exists,
            cert.studentName,
            cert.courseName,
            cert.issueDate,
            cert.issuer
        );
    }

    /**
     * @notice Returns total number of issued certificates.
     */
    function totalCertificates() external view returns (uint256) {
        return certificateIds.length;
    }
}
