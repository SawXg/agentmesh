import React from "react";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import { CONTRACT_ADDRESSES, GATEWAY_ABI } from "../config/contracts.ts";
import { Flame, Zap, TrendingUp, ShieldCheck } from "lucide-react";

export const ProtocolStats: React.FC = () => {
  const { data: totalQueries } = useReadContract({
    address: CONTRACT_ADDRESSES.gateway,
    abi: GATEWAY_ABI,
    functionName: "totalQueriesServed",
  });

  const { data: totalBurned } = useReadContract({
    address: CONTRACT_ADDRESSES.gateway,
    abi: GATEWAY_ABI,
    functionName: "totalTokensBurned",
  });

  const { data: totalRewards } = useReadContract({
    address: CONTRACT_ADDRESSES.gateway,
    abi: GATEWAY_ABI,
    functionName: "totalRewardsRouted",
  });

  const { data: queryFee } = useReadContract({
    address: CONTRACT_ADDRESSES.gateway,
    abi: GATEWAY_ABI,
    functionName: "queryFee",
  });


  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 backdrop-blur">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Queries Executed</span>
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-bold text-white">
          {totalQueries !== undefined ? (totalQueries as bigint).toString() : "0"}
        </div>
        <div className="text-[11px] text-gray-500 mt-1">Autonomous AI tasks</div>
      </div>

      <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 backdrop-blur">
        <div className="flex items-center justify-between text-xs text-red-400 mb-2">
          <span>Burned (Deflation)</span>
          <Flame className="w-4 h-4 text-red-500 animate-pulse" />
        </div>
        <div className="text-2xl font-bold text-red-400">
          {totalBurned !== undefined
            ? Number(formatEther(totalBurned as bigint)).toLocaleString(undefined, { maximumFractionDigits: 1 })
            : "0"}{" "}
          <span className="text-sm font-normal text-red-300">AUN</span>
        </div>
        <div className="text-[11px] text-red-400/70 mt-1">50% permanently burned</div>
      </div>

      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 backdrop-blur">
        <div className="flex items-center justify-between text-xs text-emerald-400 mb-2">
          <span>Staker Rewards</span>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold text-emerald-400">
          {totalRewards !== undefined
            ? Number(formatEther(totalRewards as bigint)).toLocaleString(undefined, { maximumFractionDigits: 1 })
            : "0"}{" "}
          <span className="text-sm font-normal text-emerald-300">AUN</span>
        </div>
        <div className="text-[11px] text-emerald-400/70 mt-1">50% routed to stakers</div>
      </div>

      <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 backdrop-blur">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Fee Per Query</span>
          <ShieldCheck className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-2xl font-bold text-white">
          {queryFee ? formatEther(queryFee as bigint) : "5"}{" "}
          <span className="text-sm font-normal text-gray-400">AUN</span>
        </div>
        <div className="text-[11px] text-gray-500 mt-1">100M Max Supply</div>
      </div>
    </div>
  );
};
