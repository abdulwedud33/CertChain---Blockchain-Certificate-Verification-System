import { BrowserProvider, Contract } from "ethers";

// Minimal ABI — only the functions we call from the frontend
const CONTRACT_ABI = [
  // Issue a certificate (requires MetaMask signer)
  "function issueCertificate(string _studentName, string _courseName, string _certificateId, uint256 _issueDate) external",
  // Verify a certificate (read-only, no wallet needed)
  "function verifyCertificate(string _certificateId) external view returns (bool exists, string studentName, string courseName, uint256 issueDate, address issuer)",
  // Events
  "event CertificateIssued(string indexed certificateId, string studentName, string courseName, uint256 issueDate, address indexed issuer)",
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Get a read-only provider (no wallet needed).
 * Uses MetaMask's provider if available, otherwise falls back to nothing.
 */
async function getReadProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Ethereum provider found. Install MetaMask.");
  }
  return new BrowserProvider(window.ethereum);
}

/**
 * Get a signing provider (requires MetaMask connection).
 */
async function getSignerProvider() {
  const provider = await getReadProvider();
  const signer = await provider.getSigner();
  return { provider, signer };
}

// ─── Exported Functions ───────────────────────────────────────────────────────

/**
 * Connect MetaMask wallet. Returns the connected wallet address.
 */
export async function connectWallet(): Promise<string> {
  if (!window.ethereum) throw new Error("MetaMask not installed.");

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  }) as string[];

  if (!accounts.length) throw new Error("No accounts returned.");
  return accounts[0];
}

/**
 * Get currently connected wallet address (without prompting).
 */
export async function getCurrentWallet(): Promise<string | null> {
  if (!window.ethereum) return null;
  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  }) as string[];
  return accounts[0] || null;
}

/**
 * Issue a certificate on-chain.
 * @returns transaction hash
 */
export async function issueCertificateOnChain(params: {
  studentName: string;
  courseName: string;
  certificateId: string;
  issueDate: string; // ISO string
}): Promise<string> {
  const { provider, signer } = await getSignerProvider();

  // Ensure there's a contract deployed at the configured address
  const code = await provider.getCode(CONTRACT_ADDRESS);
  if (!code || code === "0x" || code === "0x0") {
    throw new Error(
      `No contract found at ${CONTRACT_ADDRESS}. Check NEXT_PUBLIC_CONTRACT_ADDRESS and your MetaMask network.`
    );
  }

  const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  // Convert date to Unix timestamp (seconds)
  const issueTimestamp = Math.floor(new Date(params.issueDate).getTime() / 1000);

  // Simulate the call first to get a revert reason without sending a transaction
  try {
    await contract.getFunction("issueCertificate").staticCall(
      params.studentName,
      params.courseName,
      params.certificateId,
      issueTimestamp
    );
  } catch (simError: any) {
    console.error("Simulated issueCertificate reverted:", simError);
    throw new Error(
      `Simulated transaction failed: ${simError?.reason || simError?.message || JSON.stringify(simError)}`
    );
  }

  try {
    const tx = await contract.issueCertificate(
      params.studentName,
      params.courseName,
      params.certificateId,
      issueTimestamp
    );

    // Wait for 1 confirmation
    await tx.wait(1);
    return tx.hash;
  } catch (sendError: any) {
    // Log full error for easier debugging in browser console
    console.error("issueCertificate send error:", sendError);
    // If MetaMask returns a structured RPC error include useful fields
    const rpcMessage = sendError?.error?.message || sendError?.reason || sendError?.message;
    throw new Error(`Transaction failed: ${rpcMessage || JSON.stringify(sendError)}`);
  }
}

/**
 * Verify a certificate on-chain (read-only).
 */
export async function verifyCertificateOnChain(certificateId: string): Promise<{
  exists: boolean;
  studentName: string;
  courseName: string;
  issueDate: number;
  issuer: string;
}> {
  const provider = await getReadProvider();
  const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

  const [exists, studentName, courseName, issueDate, issuer] =
    await contract.verifyCertificate(certificateId);

  return {
    exists,
    studentName,
    courseName,
    issueDate: Number(issueDate),
    issuer,
  };
}
