import React from "react";
import { Header } from "./components/Header.tsx";
import { ProtocolStats } from "./components/ProtocolStats.tsx";
import { AIPromptTerminal } from "./components/AIPromptTerminal.tsx";
import { FaucetSection } from "./components/FaucetSection.tsx";
import { Flame, ShieldCheck, Zap } from "lucide-react";

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Autonomous AI Pay-Per-Query Protocol</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Cryptographic Utility for <br />
            <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Decentralized AI Agents
            </span>
          </h1>
          <p className="text-sm md:text-base text-gray-400 mt-4 leading-relaxed">
            Every AI query burns 50% of the token fee on-chain and streams 50% directly to network stakers. Zero inflation, pure utility.
          </p>
        </div>

        {/* Live Protocol Metrics */}
        <div className="mb-8">
          <ProtocolStats />
        </div>

        {/* Interactive Terminal */}
        <div className="mb-8">
          <AIPromptTerminal />
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-gray-900/30 border border-gray-800/80">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">1. True Utility</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              $AUN is not a speculative meme. It is the direct fuel required to run machine intelligence queries across the network.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900/30 border border-gray-800/80">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center mb-3">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">2. 50% Permanent Burn</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Half of every query fee is sent to 0x0...dEaD on Base, ensuring the circulating supply contracts as usage grows.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900/30 border border-gray-800/80">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">3. Staker Yield</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              The remaining 50% feeds the node provider and community staking pool, aligning long-term participants.
            </p>
          </div>
        </div>

        {/* Faucet & Contracts Info */}
        <FaucetSection />
      </main>

      <footer className="border-t border-gray-800/60 py-6 text-center text-xs text-gray-500">
        AgentMesh Protocol • Built on Base L2 • OpenZeppelin Audited Standards
      </footer>
    </div>
  );
};

export default App;
