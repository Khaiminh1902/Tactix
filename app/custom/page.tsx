"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Grid3X3,
  Target,
  Play,
  Users,
  BrainCircuit,
  Skull,
  Bot,
} from "lucide-react";

const theme = {
  from: "#000e1a",
  via: "#001f2f",
  to: "#012d3a",
  text: "text-green-300",
  border: "border-cyan-400/30",
  glow: "hover:border-green-400 hover:shadow-[0_0_30px_#00ffe088]",
  title: "from-green-400 via-cyan-400 to-teal-300",
};

const Page = () => {
  const [glitching, setGlitching] = useState(false);
  const [boardSize, setBoardSize] = useState(6);
  const [winCondition, setWinCondition] = useState(4);
  const [gameMode, setGameMode] = useState("pvp");
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    setGlitching(true);
    setTimeout(() => router.back(), 800);
  };

  const handleStartGame = () => {
    setIsStarting(true);

    const params = new URLSearchParams({
      size: boardSize.toString(),
      win: winCondition.toString(),
      mode: gameMode,
    });

    setTimeout(() => {
      router.push(`/game/custom?${params.toString()}`);
    }, 1000);
  };

  const modes = [
    { value: "pvp", label: "Player vs Player", icon: Users },
    { value: "easy", label: "Easy AI", icon: BrainCircuit },
    { value: "normal", label: "Normal AI", icon: BrainCircuit },
    { value: "hard", label: "Hard AI", icon: BrainCircuit },
    { value: "nightmare", label: "Nightmare AI", icon: Skull },
    { value: "impossible", label: "Impossible AI", icon: Bot },
  ];

  const presets = [
    { size: 6, win: 4, name: "Classic 6x6" },
    { size: 7, win: 4, name: "Big 7x7" },
    { size: 8, win: 5, name: "Large 8x8" },
    { size: 10, win: 5, name: "Massive 10x10" },
  ];

  return (
    <div
      className="relative min-h-screen px-6 py-12 font-mono text-white overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${theme.from}, ${theme.via}, ${theme.to})`,
      }}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#00ffe033_1px,transparent_1px)] [background-size:20px_20px] animate-pulse-slow"></div>

      {glitching && (
        <div className="fixed inset-0 z-50 bg-black animate-glitch-fade"></div>
      )}

      {isStarting && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="flex items-center gap-3 text-green-300 text-lg animate-pulse">
            <Play className="w-6 h-6 animate-spin-slow" />
            <span>Initializing Custom Game...</span>
          </div>
        </div>
      )}

      <button
        onClick={handleBack}
        className="absolute top-6 left-6 text-cyan-400 hover:text-cyan-200 flex items-center gap-2 z-10 cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="max-w-2xl mx-auto text-center">
        <h1
          className={`text-4xl font-bold mb-8 bg-gradient-to-r ${theme.title} text-transparent bg-clip-text drop-shadow-[0_0_15px_#00f5d4]`}
        >
          Custom Mode
        </h1>

        <div className="space-y-8">
          <div className="bg-[#001f2f]/50 p-6 rounded-xl border border-cyan-400/20 backdrop-blur-md">
            <h2 className="text-xl font-bold text-green-300 mb-4 flex items-center gap-2 justify-center">
              <Grid3X3 className="w-5 h-5" />
              Quick Presets
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setBoardSize(preset.size);
                    setWinCondition(preset.win);
                  }}
                  className={`px-4 py-3 border ${theme.border} rounded-lg backdrop-blur-md transition-all duration-200 cursor-pointer hover:shadow-[0_0_15px_#00ffe088] hover:border-green-300 text-cyan-200`}
                >
                  <div className="font-semibold">{preset.name}</div>
                  <div className="text-xs opacity-75">
                    {preset.size}x{preset.size} • {preset.win} to win
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#001f2f]/50 p-6 rounded-xl border border-cyan-400/20 backdrop-blur-md">
            <h2 className="text-xl font-bold text-green-300 mb-6 flex items-center gap-2 justify-center">
              <Target className="w-5 h-5" />
              Custom Configuration
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-cyan-300 text-sm font-semibold mb-3">
                  Board Size: {boardSize}x{boardSize}
                </label>
                <input
                  type="range"
                  min="4"
                  max="15"
                  value={boardSize}
                  onChange={(e) => setBoardSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-cyan-900/50 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #00ffe0 0%, #00ffe0 ${
                      ((boardSize - 4) / 11) * 100
                    }%, #001f2f ${
                      ((boardSize - 4) / 11) * 100
                    }%, #001f2f 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-cyan-500 mt-1">
                  <span>4x4</span>
                  <span>15x15</span>
                </div>
              </div>

              <div>
                <label className="block text-cyan-300 text-sm font-semibold mb-3">
                  Lines to Win: {winCondition}
                </label>
                <input
                  type="range"
                  min="3"
                  max={Math.min(boardSize, 8)}
                  value={winCondition}
                  onChange={(e) => setWinCondition(parseInt(e.target.value))}
                  className="w-full h-2 bg-cyan-900/50 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #00ffe0 0%, #00ffe0 ${
                      ((winCondition - 3) / (Math.min(boardSize, 8) - 3)) * 100
                    }%, #001f2f ${
                      ((winCondition - 3) / (Math.min(boardSize, 8) - 3)) * 100
                    }%, #001f2f 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-cyan-500 mt-1">
                  <span>3</span>
                  <span>{Math.min(boardSize, 8)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#000e1a]/50 rounded-lg border border-cyan-400/10">
              <div className="text-sm text-cyan-400 mb-2">Preview:</div>
              <div className="text-green-300 font-semibold">
                {boardSize}x{boardSize} board • Get {winCondition} in a row to
                win
              </div>
              <div className="text-xs text-cyan-500 mt-1">
                Each player can place up to {boardSize} pieces
              </div>
            </div>
          </div>

          <div className="bg-[#001f2f]/50 p-6 rounded-xl border border-cyan-400/20 backdrop-blur-md">
            <h2 className="text-xl font-bold text-green-300 mb-4 flex items-center gap-2 justify-center">
              <Bot className="w-5 h-5" />
              Game Mode
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {modes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setGameMode(value)}
                  className={`px-3 py-3 border ${
                    theme.border
                  } rounded-lg backdrop-blur-md transition-all duration-200 cursor-pointer flex flex-col items-center gap-2 hover:shadow-[0_0_10px_#00fff088] hover:border-green-300 ${
                    gameMode === value
                      ? "text-green-300 border-green-300 bg-green-400/10"
                      : "text-cyan-200"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartGame}
            disabled={winCondition > boardSize}
            className={`w-full py-4 px-8 rounded-xl font-bold text-lg border transition-all duration-300 flex items-center justify-center gap-3 ${
              winCondition > boardSize
                ? "border-red-500/50 text-red-400 cursor-not-allowed bg-red-900/20"
                : "border-green-300 text-green-300 hover:shadow-[0_0_20px_#00ffe088] hover:border-cyan-300 bg-green-400/5 cursor-pointer"
            }`}
          >
            <Play className="w-6 h-6" />
            {winCondition > boardSize
              ? "Invalid Configuration"
              : "Start Custom Game"}
          </button>

          {winCondition > boardSize && (
            <div className="text-red-400 text-sm">
              Win condition cannot be larger than board size!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
