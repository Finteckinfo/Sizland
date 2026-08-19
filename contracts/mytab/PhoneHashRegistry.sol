// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PhoneHashRegistry
 * @notice Maps SHA-256 phone hashes to wallet addresses for identity anchoring.
 *         The raw phone number never touches the chain — only the hash
 *         computed client-side as SHA-256(platformSalt + normalizedPhone).
 *
 *         Evasion block: one hash → one account. Prevents multi-account abuse.
 */
contract PhoneHashRegistry is Ownable {
    mapping(bytes32 => address) private _hashToAccount;
    mapping(address => bytes32) private _accountToHash;
    mapping(bytes32 => bool) private _registered;

    /// @dev Trusted verifier address authorized to register hashes
    /// (set to the backend API wallet that confirmed the OTP).
    address public verifier;

    event PhoneHashRegistered(bytes32 indexed phoneHash, address indexed account);
    event PhoneHashReleased(bytes32 indexed phoneHash, address indexed account);
    event VerifierUpdated(address indexed oldVerifier, address indexed newVerifier);

    error HashAlreadyRegistered();
    error AccountAlreadyAnchored();
    error OnlyVerifier();
    error NotHashOwner();

    modifier onlyVerifier() {
        if (msg.sender != verifier) revert OnlyVerifier();
        _;
    }

    constructor(address verifier_) Ownable(msg.sender) {
        verifier = verifier_;
    }

    function setVerifier(address newVerifier) external onlyOwner {
        emit VerifierUpdated(verifier, newVerifier);
        verifier = newVerifier;
    }

    function registerHash(bytes32 phoneHash, address account) external onlyVerifier {
        if (_registered[phoneHash]) revert HashAlreadyRegistered();
        if (_accountToHash[account] != bytes32(0)) revert AccountAlreadyAnchored();

        _hashToAccount[phoneHash] = account;
        _accountToHash[account] = phoneHash;
        _registered[phoneHash] = true;

        emit PhoneHashRegistered(phoneHash, account);
    }

    function releaseHash(address account) external onlyVerifier {
        bytes32 hash = _accountToHash[account];
        if (hash == bytes32(0)) revert NotHashOwner();

        delete _hashToAccount[hash];
        delete _accountToHash[account];
        _registered[hash] = false;

        emit PhoneHashReleased(hash, account);
    }

    function isHashRegistered(bytes32 phoneHash) external view returns (bool) {
        return _registered[phoneHash];
    }

    function resolveHash(bytes32 phoneHash) external view returns (address) {
        return _hashToAccount[phoneHash];
    }

    function getHash(address account) external view returns (bytes32) {
        return _accountToHash[account];
    }
}
