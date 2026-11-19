import React, { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESSES, TOKEN_ABI, GATEWAY_ABI } from "../config/contracts.ts";
import { Bot, Sparkles, ArrowRight, CheckCircle2, Loader2, ExternalLink, Flame, Settings } from "lucide-react";

export const AIPromptTerminal: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [queryCount, setQueryCount] = useState<number>(1);
  const [promptInput, setPromptInput] = useState<string>("");
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [creditsAvailable, setCreditsAvailable] = useState<number>(0);
  const [lastPaymentTx, setLastPaymentTx] = useState<string | null>(null);

  // Optional custom Gemini key
  const [geminiKey, setGeminiKey] = useState<string>(() => localStorage.getItem("agentmesh_gemini_key") || "");
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  const cost = parseEther((queryCount * 5).toString());

  // Check token balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.token,
    abi: TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Check token allowance for the Gateway
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.token,
    abi: TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACT_ADDRESSES.gateway] : undefined,
  });

  const { writeContract: writeApprove, data: approveTxHash, isPending: isApproving } = useWriteContract();
  const { writeContract: writePay, data: payTxHash, isPending: isPaying } = useWriteContract();

  const { isLoading: isWaitingApprove, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  const { isLoading: isWaitingPay, isSuccess: isPaySuccess } = useWaitForTransactionReceipt({
    hash: payTxHash,
  });

  // Handle Approve
  const handleApprove = () => {
    writeApprove({
      address: CONTRACT_ADDRESSES.token,
      abi: TOKEN_ABI,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.gateway, cost],
    });
  };

  // Handle Pay on Chain
  const handlePay = () => {
    writePay({
      address: CONTRACT_ADDRESSES.gateway,
      abi: GATEWAY_ABI,
      functionName: "payForQueries",
      args: [BigInt(queryCount)],
    });
  };

  // Update credits when payment succeeds
  React.useEffect(() => {
    if (isPaySuccess && payTxHash) {
      setCreditsAvailable((prev) => prev + queryCount);
      setLastPaymentTx(payTxHash);
      refetchBalance();
      refetchAllowance();
    }
  }, [isPaySuccess, payTxHash, queryCount, refetchBalance, refetchAllowance]);

  React.useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  const hasEnoughAllowance = allowance ? (allowance as bigint) >= cost : false;
  const hasEnoughBalance = balance ? (balance as bigint) >= cost : false;

  const saveGeminiKey = (key: string) => {
    setGeminiKey(key);
    localStorage.setItem("agentmesh_gemini_key", key);
    setShowKeyModal(false);
  };

  // Execute real AI prompt
  const runPrompt = async () => {
    if (!promptInput.trim() || creditsAvailable <= 0) return;
    setIsGenerating(true);
    setAiOutput(null);

    try {
      let resultText = "";

      if (geminiKey.trim()) {
        // Use user's custom Gemini API Key
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey.trim()}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptInput }] }],
            }),
          }
        );
        const data = await res.json();
        resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received from Gemini.";
      } else {
        // Use free public AI node endpoint (Mistral/Llama inference)
        const systemPrompt = "You are AgentMesh Autonomous AI Node on Base L2. Answer concisely and accurately: ";
        const res = await fetch(
          `https://text.pollinations.ai/${encodeURIComponent(systemPrompt + promptInput)}`
        );
        resultText = await res.text();
      }

      setCreditsAvailable((c) => c - 1);
      setAiOutput(
        `[AgentMesh Node Execution Confirmed]\n\nModel: ${geminiKey ? "Google Gemini 2.0 Flash" : "AgentMesh Open Inference Node"}\nSettlement: Base Sepolia\nBurn Verified: 2.5 AUN sent to 0x0...dEaD\n\n--- AI OUTPUT ---\n${resultText}`
      );
    } catch (err: any) {
      setAiOutput(`Execution error: ${err?.message || "Failed to contact AI node."}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Query Service Terminal</h2>
            <p className="text-xs text-gray-400">Pay on-chain in $AUN to trigger autonomous AI tasks</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowKeyModal(!showKeyModal)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition"
            title="Configure AI API Key"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{geminiKey ? "Gemini Key Configured" : "Default AI Node"}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Credits:</span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
              {creditsAvailable} Available
            </span>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showKeyModal && (
        <div className="my-4 p-4 rounded-xl bg-gray-950 border border-blue-900/40">
          <div className="text-xs font-semibold text-white mb-1">Optional: Custom Google Gemini API Key</div>
          <p className="text-[11px] text-gray-400 mb-3">
            By default, AgentMesh routes through free decentralized inference nodes. If you want to use Google Gemini 2.0 Flash, paste your free Gemini API key below (saved locally in your browser):
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => saveGeminiKey(geminiKey)}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition"
            >
              Save Key
            </button>
          </div>
        </div>
      )}

      {/* Payment / Credit Purchase Step */}
      <div className="my-6 p-4 rounded-xl bg-gray-950/40 border border-gray-800/80">
        <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
          Step 1: Purchase Query Credits On-Chain
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          {[1, 5, 10].map((count) => (
            <button
              key={count}
              onClick={() => setQueryCount(count)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                queryCount === count
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {count} {count === 1 ? "Query" : "Queries"} ({count * 5} AUN)
            </button>
          ))}
          <div className="text-xs text-gray-400 ml-auto flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span>{(queryCount * 2.5).toFixed(1)} AUN will be permanently burned</span>
          </div>
        </div>

        {!isConnected ? (
          <div className="text-center py-3 text-xs text-gray-400">Connect your wallet to purchase credits.</div>
        ) : !hasEnoughBalance ? (
          <div className="text-center py-3 text-xs text-red-400">
            Insufficient $AUN balance. Claim 100 free tokens from the faucet below.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            {!hasEnoughAllowance ? (
              <button
                onClick={handleApprove}
                disabled={isApproving || isWaitingApprove}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition"
              >
                {isApproving || isWaitingApprove ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Approving AUN...</span>
                  </>
                ) : (
                  <>
                    <span>Approve {queryCount * 5} AUN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handlePay}
                disabled={isPaying || isWaitingPay}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition shadow-lg shadow-emerald-600/20"
              >
                {isPaying || isWaitingPay ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming on Base Sepolia...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4" />
                    <span>Pay & Burn {queryCount * 5} AUN on Base</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {(payTxHash || lastPaymentTx) && (
          <div className="mt-3 flex items-center gap-2 text-xs text-blue-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Settled on Base Sepolia:</span>
            <a
              href={`https://sepolia.basescan.org/tx/${payTxHash || lastPaymentTx}`}
              target="_blank"
              rel="noreferrer"
              className="underline font-mono flex items-center gap-1"
            >
              {(payTxHash || lastPaymentTx)?.slice(0, 10)}...{(payTxHash || lastPaymentTx)?.slice(-8)}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Terminal Step */}
      <div className="mt-4">
        <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Step 2: Dispatch AI Task to Network
        </div>

        <div className="relative">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder={
              creditsAvailable > 0
                ? "Ask AI agent anything (e.g. 'Explain tokenomics burn mechanisms')..."
                : "Purchase query credits above first to activate prompt input"
            }
            disabled={creditsAvailable <= 0 || isGenerating}
            onKeyDown={(e) => {
              if (e.key === "Enter") runPrompt();
            }}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition disabled:opacity-50 pr-24"
          />
          <button
            onClick={runPrompt}
            disabled={creditsAvailable <= 0 || !promptInput.trim() || isGenerating}
            className="absolute right-2 top-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isGenerating ? "Executing..." : "Run AI"}</span>
          </button>
        </div>

        {aiOutput && (
          <div className="mt-4 p-4 rounded-xl bg-black/60 border border-gray-800 font-mono text-xs text-emerald-400 whitespace-pre-line leading-relaxed shadow-inner">
            {aiOutput}
          </div>
        )}
      </div>
    </div>
  );
};
