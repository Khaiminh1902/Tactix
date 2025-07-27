// app/game/3x3/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  BrainCircuit,
  Skull,
  Radiation,
  RotateCcw,
  GalleryHorizontal,
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

const SIZE = 3;
const WINNING_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const Page = () => {
  const [board, setBoard] = useState<(null | "X" | "O")[]>(
    Array(SIZE * SIZE).fill(null)
  );
  const [current, setCurrent] = useState<"X" | "O">("X");
  const [placed, setPlaced] = useState({ X: 0, O: 0 });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [glitching, setGlitching] = useState(false);
  const [mode, setMode] = useState("pvp");
  const [winner, setWinner] = useState<null | "X" | "O">(null);
  const router = useRouter();

  const checkWinner = (b: (null | "X" | "O")[]) => {
    for (const combo of WINNING_COMBOS) {
      const [a, b1, c] = combo;
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
        return b[a];
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (winner) return;
    const newBoard = [...board];
    const player = current;

    if (selectedIndex !== null) {
      if (newBoard[index] === null) {
        newBoard[selectedIndex] = null;
        newBoard[index] = player;
        setBoard(newBoard);
        setSelectedIndex(null);
        const maybeWinner = checkWinner(newBoard);
        if (maybeWinner) setWinner(maybeWinner);
        else setCurrent(player === "X" ? "O" : "X");
      }
      return;
    }

    if (newBoard[index] === player) {
      setSelectedIndex(index);
      return;
    }

    if (newBoard[index] === null && placed[player] < 3) {
      newBoard[index] = player;
      setBoard(newBoard);
      setPlaced((prev) => ({ ...prev, [player]: prev[player] + 1 }));
      const maybeWinner = checkWinner(newBoard);
      if (maybeWinner) setWinner(maybeWinner);
      else setCurrent(player === "X" ? "O" : "X");
    }
  };

  const handleBack = () => {
    setGlitching(true);
    setTimeout(() => router.back(), 800);
  };

  const resetGame = () => {
    setBoard(Array(SIZE * SIZE).fill(null));
    setPlaced({ X: 0, O: 0 });
    setSelectedIndex(null);
    setWinner(null);
    setCurrent("X");
  };

  const modes = [
    { value: "pvp", label: "Player vs Player", icon: Users },
    { value: "easy", label: "Easy", icon: BrainCircuit },
    { value: "normal", label: "Normal", icon: BrainCircuit },
    { value: "hard", label: "Hard", icon: BrainCircuit },
    { value: "nightmare", label: "Nightmare", icon: Skull },
    { value: "impossible", label: "Impossible", icon: Radiation },
  ];

  return (
    <div
      className="relative min-h-screen px-6 py-12 font-mono text-white overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${theme.from}, ${theme.via}, ${theme.to})`,
      }}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#00ffe033_1px,transparent_1px)] [background-size:20px_20px] animate-pulse-slow"></div>

      {/* Glitch Overlay */}
      {glitching && (
        <div className="fixed inset-0 z-50 bg-black animate-glitch-fade"></div>
      )}

      <button
        onClick={handleBack}
        className="absolute top-6 left-6 text-cyan-400 hover:text-cyan-200 flex items-center gap-2 z-10 cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="max-w-md mx-auto text-center">
        <h1
          className={`text-4xl font-bold mb-6 bg-gradient-to-r ${theme.title} text-transparent bg-clip-text drop-shadow-[0_0_15px_#00f5d4]`}
        >
          3x3 Cyber Board
        </h1>

        {/* Mode Selector */}
        <div className="mb-6 flex flex-wrap justify-center gap-2 text-sm text-cyan-200">
          {modes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`px-3 py-1 border ${
                theme.border
              } rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer flex items-center gap-1 hover:shadow-[0_0_10px_#00fff088] hover:border-green-300 ${
                mode === value ? "text-green-300 border-green-300" : ""
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 justify-center">
          {board.map((cell, idx) => (
            <div
              key={idx}
              onClick={() => handleClick(idx)}
              className={`aspect-square w-20 sm:w-24 flex items-center justify-center text-3xl border ${
                theme.border
              } bg-[#001f2f] transition-all duration-200 rounded-lg cursor-pointer ${
                selectedIndex === idx ? "ring-2 ring-green-300" : ""
              } ${theme.text} hover:shadow-[0_0_15px_#00ffe088]`}
            >
              {cell}
            </div>
          ))}
        </div>

        <p className="mt-6 text-cyan-300 text-sm tracking-wide">
          Current Turn:{" "}
          <span className="font-bold text-green-300">{current}</span>
        </p>

        {selectedIndex !== null && (
          <p className="mt-2 text-green-400 text-xs">
            Selected your piece: Cell {selectedIndex + 1}
          </p>
        )}

        {winner && (
          <div className="mt-10 text-green-300 animate-pulse drop-shadow-[0_0_10px_#00ffe0]">
            <h2 className="text-2xl font-bold mb-4">{winner} Wins!</h2>
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetGame}
                className="px-4 py-2 rounded-full border border-green-300 text-green-300 flex items-center gap-2 hover:shadow-[0_0_10px_#00ffe088] hover:border-cyan-300 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Replay
              </button>
              <button
                onClick={handleBack}
                className="px-4 py-2 rounded-full border border-green-300 text-green-300 flex items-center gap-2 hover:shadow-[0_0_10px_#00ffe088] hover:border-cyan-300 cursor-pointer"
              >
                <GalleryHorizontal className="w-4 h-4" /> Gallery
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
