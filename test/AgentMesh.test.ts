import { expect } from "chai";
import { ethers } from "hardhat";
import { AgentUtilityToken, AIServiceGateway } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("AgentMesh Protocol Suite", function () {
  let token: AgentUtilityToken;
  let gateway: AIServiceGateway;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let rewardPool: HardhatEthersSigner;
  let otherAccount: HardhatEthersSigner;

  const INITIAL_FEE = ethers.parseEther("5"); // 5 AUN per query
  const TOTAL_SUPPLY = ethers.parseEther("100000000"); // 100M AUN

  beforeEach(async function () {
    [owner, user, rewardPool, otherAccount] = await ethers.getSigners();

    // 1. Deploy AgentUtilityToken
    const TokenFactory = await ethers.getContractFactory("AgentUtilityToken");
    token = (await TokenFactory.deploy(owner.address)) as AgentUtilityToken;
    await token.waitForDeployment();

    // 2. Deploy AIServiceGateway
    const GatewayFactory = await ethers.getContractFactory("AIServiceGateway");
    gateway = (await GatewayFactory.deploy(
      await token.getAddress(),
      rewardPool.address,
      INITIAL_FEE,
      owner.address
    )) as AIServiceGateway;
    await gateway.waitForDeployment();

    // Distribute tokens to user for testing
    const userAllocation = ethers.parseEther("1000");
    await token.connect(owner).transfer(user.address, userAllocation);
  });

  describe("AgentUtilityToken Core", function () {
    it("should deploy with 100M total supply to the initial recipient", async function () {
      expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY);
      expect(await token.balanceOf(owner.address)).to.equal(
        TOTAL_SUPPLY - ethers.parseEther("1000")
      );
    });

    it("should have correct ERC20 metadata", async function () {
      expect(await token.name()).to.equal("Agent Utility Network");
      expect(await token.symbol()).to.equal("AUN");
      expect(await token.decimals()).to.equal(18);
    });

    it("should reject deployment to zero address", async function () {
      const TokenFactory = await ethers.getContractFactory("AgentUtilityToken");
      await expect(
        TokenFactory.deploy(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(token, "InvalidZeroAddress");
    });
  });

  describe("AIServiceGateway Utility Mechanics", function () {
    it("should allow a user to pay for queries, burning 50% and routing 50% to reward pool", async function () {
      const queryCount = 10n;
      const totalCost = queryCount * INITIAL_FEE; // 50 AUN
      const expectedBurn = totalCost / 2n; // 25 AUN
      const expectedReward = totalCost - expectedBurn; // 25 AUN

      // Approve gateway to spend user's tokens
      await token.connect(user).approve(await gateway.getAddress(), totalCost);

      const initialTotalSupply = await token.totalSupply();
      const initialRewardPoolBalance = await token.balanceOf(rewardPool.address);
      const initialUserBalance = await token.balanceOf(user.address);

      // Execute payment
      const tx = await gateway.connect(user).payForQueries(queryCount);

      // Verify event
      await expect(tx)
        .to.emit(gateway, "QueriesPurchased")
        .withArgs(user.address, queryCount, expectedBurn, expectedReward);

      // 1. Verify User Balance decreased by totalCost
      expect(await token.balanceOf(user.address)).to.equal(
        initialUserBalance - totalCost
      );

      // 2. Verify Total Supply reduced by burn amount (Deflationary sink)
      expect(await token.totalSupply()).to.equal(
        initialTotalSupply - expectedBurn
      );

      // 3. Verify Reward Pool received 50%
      expect(await token.balanceOf(rewardPool.address)).to.equal(
        initialRewardPoolBalance + expectedReward
      );

      // 4. Verify Protocol statistics
      expect(await gateway.totalQueriesServed()).to.equal(queryCount);
      expect(await gateway.totalTokensBurned()).to.equal(expectedBurn);
      expect(await gateway.totalRewardsRouted()).to.equal(expectedReward);
    });

    it("should revert if user attempts to pay for 0 queries", async function () {
      await expect(
        gateway.connect(user).payForQueries(0)
      ).to.be.revertedWithCustomError(gateway, "InvalidQueryCount");
    });

    it("should revert if user has insufficient allowance", async function () {
      await expect(
        gateway.connect(user).payForQueries(5)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");
    });
  });

  describe("Access Control & Configuration", function () {
    it("should allow owner to update query fee", async function () {
      const newFee = ethers.parseEther("10");
      await expect(gateway.connect(owner).setQueryFee(newFee))
        .to.emit(gateway, "FeeUpdated")
        .withArgs(newFee);

      expect(await gateway.queryFee()).to.equal(newFee);
    });

    it("should reject non-owner from updating fee", async function () {
      const newFee = ethers.parseEther("10");
      await expect(
        gateway.connect(otherAccount).setQueryFee(newFee)
      ).to.be.revertedWithCustomError(gateway, "OwnableUnauthorizedAccount");
    });

    it("should allow owner to update reward pool", async function () {
      await expect(
        gateway.connect(owner).setRewardPool(otherAccount.address)
      )
        .to.emit(gateway, "RewardPoolUpdated")
        .withArgs(otherAccount.address);

      expect(await gateway.rewardPool()).to.equal(otherAccount.address);
    });

    it("should enforce safe 2-step ownership transfer", async function () {
      // Step 1: Initiate transfer
      await gateway.connect(owner).transferOwnership(otherAccount.address);
      expect(await gateway.owner()).to.equal(owner.address); // Still owner until accepted

      // Step 2: Accept transfer
      await gateway.connect(otherAccount).acceptOwnership();
      expect(await gateway.owner()).to.equal(otherAccount.address);
    });
  });
});
