import { ethers } from "hardhat";

async function main() {
  const tokenAddress = "0x6D06b8a4cBea909B6902ec561fF8981F71C4e64e";
  const [deployer] = await ethers.getSigners();

  console.log("==========================================");
  console.log("   Deploying TestnetFaucet on Base Sepolia ");
  console.log("==========================================");
  console.log("Deployer:", deployer.address);

  // 1. Deploy TestnetFaucet
  const FaucetFactory = await ethers.getContractFactory("TestnetFaucet");
  const faucet = await FaucetFactory.deploy(tokenAddress, deployer.address);
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log(`-> TestnetFaucet Deployed at: ${faucetAddress}`);

  // 2. Fund the Faucet with 5,000,000 AUN
  const fundAmount = ethers.parseEther("5000000"); // 5 Million AUN
  const token = await ethers.getContractAt("AgentUtilityToken", tokenAddress, deployer);

  console.log("Funding Faucet with 5,000,000 AUN...");
  const tx = await token.transfer(faucetAddress, fundAmount);
  await tx.wait();
  console.log(`-> Faucet Funded! Tx Hash: ${tx.hash}`);

  console.log("------------------------------------------");
  console.log("Next Steps for Verification:");
  console.log(`npx hardhat verify --network baseSepolia ${faucetAddress} "${tokenAddress}" "${deployer.address}"`);
  console.log("==========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
