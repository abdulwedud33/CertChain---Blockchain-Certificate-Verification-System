import { ethers } from "hardhat";

async function main() {
  console.log("Deploying CertificateRegistry...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
  const registry = await CertificateRegistry.deploy();

  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("✅ CertificateRegistry deployed to:", address);
  console.log("\nAdd to your .env files:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
