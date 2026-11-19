import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("=================================================");
  console.log("   AgentMesh Protocol - Production Deployment   ");
  console.log("=================================================");
  console.log(`Network:          ${network.name} (ChainID: ${network.config.chainId})`);
  console.log(`Deployer Address: ${deployer.address}`);
  console.log(`Deployer Balance: ${ethers.formatEther(balance)} ETH`);
  console.log("-------------------------------------------------");

  // 1. Deploy Core Token
  console.log("1. Deploying AgentUtilityToken (AUN)...");
  const TokenFactory = await ethers.getContractFactory("AgentUtilityToken");
  const token = await TokenFactory.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`   -> AUN Token Deployed at: ${tokenAddress}`);

  // 2. Deploy AI Service Gateway
  const initialFee = ethers.parseEther("5"); // 5 AUN per query
  const initialRewardPool = deployer.address; // Initial pool address (e.g. multi-sig or rewards distributor)

  console.log("2. Deploying AIServiceGateway...");
  const GatewayFactory = await ethers.getContractFactory("AIServiceGateway");
  const gateway = await GatewayFactory.deploy(
    tokenAddress,
    initialRewardPool,
    initialFee,
    deployer.address
  );
  await gateway.waitForDeployment();
  const gatewayAddress = await gateway.getAddress();
  console.log(`   -> AIServiceGateway Deployed at: ${gatewayAddress}`);

  console.log("-------------------------------------------------");
  console.log("Deployment Complete!");
  console.log("Next Steps for BaseScan Verification:");
  console.log(`npx hardhat verify --network ${network.name} ${tokenAddress} "${deployer.address}"`);
  console.log(
    `npx hardhat verify --network ${network.name} ${gatewayAddress} "${tokenAddress}" "${initialRewardPool}" "${initialFee}" "${deployer.address}"`
  );
  console.log("=================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
