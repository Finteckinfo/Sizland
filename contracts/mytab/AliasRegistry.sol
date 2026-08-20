// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AliasRegistry
 * @notice Maps unique @username aliases to wallet addresses.
 *         Prevents duplicate aliases and enforces length/character rules off-chain
 *         (validated in the UI and API before calling registerAlias).
 */
contract AliasRegistry is Ownable {
    mapping(bytes32 => address) private _aliasToAccount;
    mapping(address => string) private _accountToAlias;
    mapping(bytes32 => bool) private _taken;

    event AliasRegistered(string alias_, address indexed account);
    event AliasReleased(string alias_, address indexed account);

    error AliasTaken();
    error AliasEmpty();
    error AccountAlreadyRegistered();
    error NotAliasOwner();

    constructor() Ownable(msg.sender) {}

    function registerAlias(string calldata alias_, address account) external {
        bytes32 key = _normalize(alias_);

        if (key == bytes32(0)) revert AliasEmpty();
        if (_taken[key]) revert AliasTaken();
        if (bytes(_accountToAlias[account]).length > 0) revert AccountAlreadyRegistered();

        _aliasToAccount[key] = account;
        _accountToAlias[account] = alias_;
        _taken[key] = true;

        emit AliasRegistered(alias_, account);
    }

    function releaseAlias() external {
        string memory current = _accountToAlias[msg.sender];
        if (bytes(current).length == 0) revert NotAliasOwner();

        bytes32 key = _normalize(current);
        delete _aliasToAccount[key];
        delete _accountToAlias[msg.sender];
        _taken[key] = false;

        emit AliasReleased(current, msg.sender);
    }

    function resolveAlias(string calldata alias_) external view returns (address) {
        return _aliasToAccount[_normalize(alias_)];
    }

    function getAlias(address account) external view returns (string memory) {
        return _accountToAlias[account];
    }

    function isAliasTaken(string calldata alias_) external view returns (bool) {
        return _taken[_normalize(alias_)];
    }

    function _normalize(string memory alias_) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_toLower(alias_)));
    }

    function _toLower(string memory s) internal pure returns (string memory) {
        bytes memory b = bytes(s);
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] >= 0x41 && b[i] <= 0x5A) {
                b[i] = bytes1(uint8(b[i]) + 32);
            }
        }
        return string(b);
    }
}
