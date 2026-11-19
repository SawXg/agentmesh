import React from "react";
import { useAccount, useConnect, useDisconnect, useReadContract } from "wagmi";
import { injected } from "wagmi/connectors";
import { formatEther } from "viem";
import { CONTRACT_ADDRESSES, TOKEN_ABI } from "../config/contracts.ts";
import { Wallet, LogOut, ExternalLink, Cpu } from "lucide-react";

export const Header: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESSES.token,
    abi: TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  return (
    <header className="border-b border-gray-800 bg-[#0d1322]/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">AgentMesh</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Base Sepolia
              </span>
            </div>
            <p className="text-xs text-gray-400">Decentralized AI Micro-Payment Gateway</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`https://sepolia.basescan.org/token/${CONTRACT_ADDRESSES.token}`}
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 transition"
          >
            <span>Contract</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs">
                <span className="text-gray-400">Balance: </span>
                <span className="font-semibold text-emerald-400">
                  {balance ? Number(formatEther(balance as bigint)).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0"} AUN
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-xs text-blue-300 font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <button
                onClick={() => disconnect()}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800/60 rounded-lg transition"
                title="Disconnect"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-md shadow-blue-600/30 transition"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
