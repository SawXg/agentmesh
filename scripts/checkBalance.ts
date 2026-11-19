import { ethers, network } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  const bal = await ethers.provider.getBalance(signer.address);
  console.log("-----------------------------------------");
  console.log("Wallet Address:", signer.address);
  console.log("Network:       ", network.name);
  console.log("Balance:       ", ethers.formatEther(bal), "ETH");
  console.log("-----------------------------------------");
}

main().catch(console.error);
