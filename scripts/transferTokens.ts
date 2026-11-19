import { ethers } from "hardhat";

async function main() {
  const tokenAddress = "0x6D06b8a4cBea909B6902ec561fF8981F71C4e64e";
  
  // Set the recipient address you want to send test tokens to
  const recipientAddress = process.env.RECIPIENT || "0x92F3a132c10b29ccE5fCF22fD3a931C16ADf044B";
  const amount = ethers.parseEther("1000"); // 1,000 AUN

  const [deployer] = await ethers.getSigners();
  const token = await ethers.getContractAt("AgentUtilityToken", tokenAddress, deployer);

  console.log(`Transferring 1,000 AUN from ${deployer.address} to ${recipientAddress}...`);
  const tx = await token.transfer(recipientAddress, amount);
  console.log("Tx Hash:", tx.hash);
  await tx.wait();
  console.log("Transfer Confirmed on Base Sepolia!");
}

main().catch(console.error);
