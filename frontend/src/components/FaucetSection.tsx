import React, { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import { CONTRACT_ADDRESSES, FAUCET_ABI, TOKEN_ABI } from "../config/contracts.ts";
import { Copy, Check, Info, Coins, Gift, Loader2, CheckCircle2 } from "lucide-react";

export const FaucetSection: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedGateway, setCopiedGateway] = useState(false);
  const [copiedFaucet, setCopiedFaucet] = useState(false);

  // Check Faucet pool balance
  const { data: faucetBalance, refetch: refetchFaucetBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.token,
    abi: TOKEN_ABI,
    functionName: "balanceOf",
    args: [CONTRACT_ADDRESSES.faucet],
  });

  // Check user claim cooldown
  const { data: cooldownTime, refetch: refetchCooldown } = useReadContract({
    address: CONTRACT_ADDRESSES.faucet,
    abi: FAUCET_ABI,
    functionName: "getTimeUntilNextClaim",
    args: address ? [address] : undefined,
  });

  const { writeContract: writeClaim, data: claimTxHash, isPending: isClaiming } = useWriteContract();
  const { isLoading: isWaitingClaim, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimTxHash,
  });

  React.useEffect(() => {
    if (isClaimSuccess) {
      refetchFaucetBalance();
      refetchCooldown();
    }
  }, [isClaimSuccess, refetchFaucetBalance, refetchCooldown]);

  const handleClaim = () => {
    writeClaim({
      address: CONTRACT_ADDRESSES.faucet,
      abi: FAUCET_ABI,
      functionName: "claimTokens",
    });
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canClaim = isConnected && cooldownTime === 0n;

  return (
    <div className="space-y-6 my-8">
      {/* Interactive Faucet Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-gray-900 border border-blue-800/40 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <Gift className="w-3.5 h-3.5" />
              <span>Public Testnet Faucet Live</span>
            </div>
            <h3 className="text-xl font-bold text-white">Claim 100 Free $AUN Test Tokens</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Anyone with a Base Sepolia wallet can claim 100 AUN once every 24 hours to test pay-per-query AI execution and deflationary fee-burns.
            </p>
          </div>

          <div className="w-full md:w-auto">
            {!isConnected ? (
              <div className="text-xs text-gray-400 bg-gray-950/60 px-4 py-2.5 rounded-xl border border-gray-800 text-center">
                Connect wallet to claim
              </div>
            ) : cooldownTime && cooldownTime > 0n ? (
              <div className="text-xs text-amber-400 bg-amber-950/40 px-4 py-2.5 rounded-xl border border-amber-800/40 text-center">
                Cooldown active ({Math.ceil(Number(cooldownTime) / 3600)}h remaining)
              </div>
            ) : (
              <button
                onClick={handleClaim}
                disabled={!canClaim || isClaiming || isWaitingClaim}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition shadow-lg shadow-blue-500/20"
              >
                {isClaiming || isWaitingClaim ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Claiming 100 AUN on Base...</span>
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    <span>Claim 100 Free AUN</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {isClaimSuccess && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Success! 100 AUN transferred to your wallet. You can now purchase AI query credits.</span>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span>FAUCET POOL BALANCE:</span>
          <span className="text-emerald-400 font-bold">
            {faucetBalance ? Number(formatEther(faucetBalance as bigint)).toLocaleString() : "5,000,000"} AUN
          </span>
        </div>
      </div>

      {/* Contract Verification Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-gray-900/40 border border-gray-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
            <Coins className="w-4 h-4 text-blue-400" />
            <span>Verified Contract Addresses</span>
          </div>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Click to copy contract addresses to import into your Web3 wallet:
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-950 border border-gray-800/80 font-mono">
              <div>
                <span className="text-gray-500 block text-[10px]">AUN TOKEN CONTRACT:</span>
                <span className="text-gray-300">{CONTRACT_ADDRESSES.token}</span>
              </div>
              <button
                onClick={() => copyToClipboard(CONTRACT_ADDRESSES.token, setCopiedToken)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-950 border border-gray-800/80 font-mono">
              <div>
                <span className="text-gray-500 block text-[10px]">AI SERVICE GATEWAY:</span>
                <span className="text-gray-300">{CONTRACT_ADDRESSES.gateway}</span>
              </div>
              <button
                onClick={() => copyToClipboard(CONTRACT_ADDRESSES.gateway, setCopiedGateway)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition"
              >
                {copiedGateway ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-950 border border-gray-800/80 font-mono">
              <div>
                <span className="text-gray-500 block text-[10px]">TESTNET FAUCET:</span>
                <span className="text-gray-300">{CONTRACT_ADDRESSES.faucet}</span>
              </div>
              <button
                onClick={() => copyToClipboard(CONTRACT_ADDRESSES.faucet, setCopiedFaucet)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition"
              >
                {copiedFaucet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-blue-950/20 border border-blue-900/30">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-300 mb-2">
            <Info className="w-4 h-4 text-blue-400" />
            <span>Base Sepolia Network Details</span>
          </div>
          <p className="text-xs text-gray-400 mb-3 leading-relaxed">
            Need free Base Sepolia ETH for gas? Gas fees on Base are less than $0.001 per transaction.
          </p>
          <div className="space-y-1.5 text-xs text-gray-300">
            <div>• <strong>Network Name:</strong> Base Sepolia Testnet</div>
            <div>• <strong>Chain ID:</strong> 84532</div>
            <div>• <strong>Currency Symbol:</strong> ETH</div>
            <div>• <strong>RPC URL:</strong> https://sepolia.base.org</div>
            <div>• <strong>Free ETH Faucet:</strong> <a href="https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet" target="_blank" rel="noreferrer" className="text-blue-400 underline">Coinbase Faucet</a></div>
          </div>
        </div>
      </div>
    </div>
  );
};
