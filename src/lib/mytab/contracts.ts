/**
 * MyTab contract addresses and ABIs.
 * Testnet (Base Sepolia) addresses are placeholders until deployment.
 */

export const MYTAB_CHAIN_ID = 84532; // Base Sepolia

export const CONTRACTS = {
  AliasRegistry: {
    address: process.env.NEXT_PUBLIC_MYTAB_ALIAS_REGISTRY || "0x0000000000000000000000000000000000000000" as `0x${string}`,
  },
  PhoneHashRegistry: {
    address: process.env.NEXT_PUBLIC_MYTAB_PHONE_REGISTRY || "0x0000000000000000000000000000000000000000" as `0x${string}`,
  },
  PledgeLedger: {
    address: process.env.NEXT_PUBLIC_MYTAB_PLEDGE_LEDGER || "0x0000000000000000000000000000000000000000" as `0x${string}`,
  },
  ReputationEngine: {
    address: process.env.NEXT_PUBLIC_MYTAB_REPUTATION || "0x0000000000000000000000000000000000000000" as `0x${string}`,
  },
  Paymaster: {
    address: process.env.NEXT_PUBLIC_MYTAB_PAYMASTER || "0x0000000000000000000000000000000000000000" as `0x${string}`,
  },
} as const;

export const ALIAS_REGISTRY_ABI = [
  {
    type: "function",
    name: "registerAlias",
    inputs: [
      { name: "alias_", type: "string" },
      { name: "account", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "resolveAlias",
    inputs: [{ name: "alias_", type: "string" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isAliasTaken",
    inputs: [{ name: "alias_", type: "string" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AliasRegistered",
    inputs: [
      { name: "alias_", type: "string", indexed: false },
      { name: "account", type: "address", indexed: true },
    ],
  },
] as const;

export const PHONE_HASH_REGISTRY_ABI = [
  {
    type: "function",
    name: "registerHash",
    inputs: [
      { name: "phoneHash", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isHashRegistered",
    inputs: [{ name: "phoneHash", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
] as const;

export type PledgeStatus =
  | "PendingCoSign"
  | "Active"
  | "Settled"
  | "Defaulted"
  | "OffChainPending"
  | "Cleared"
  | "Disputed";

export type PledgeTrack = "Voluntary" | "Enforced";

export const PLEDGE_LEDGER_ABI = [
  {
    type: "function",
    name: "createPledge",
    inputs: [
      { name: "debtor", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "dueTimestamp", type: "uint256" },
      { name: "track", type: "uint8" },
      { name: "memoHash", type: "bytes32" },
    ],
    outputs: [{ name: "pledgeId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "coSignPledge",
    inputs: [{ name: "pledgeId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "acceptPledge",
    inputs: [{ name: "pledgeId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "declinePledge",
    inputs: [{ name: "pledgeId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "settlePledge",
    inputs: [{ name: "pledgeId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimOffChainPayment",
    inputs: [{ name: "pledgeId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "confirmOffChain",
    inputs: [
      { name: "pledgeId", type: "uint256" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "PledgeCreated",
    inputs: [
      { name: "pledgeId", type: "uint256", indexed: true },
      { name: "lender", type: "address", indexed: true },
      { name: "debtor", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PledgeCoSigned",
    inputs: [
      { name: "pledgeId", type: "uint256", indexed: true },
      { name: "debtor", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "PledgeSettled",
    inputs: [
      { name: "pledgeId", type: "uint256", indexed: true },
    ],
  },
] as const;
