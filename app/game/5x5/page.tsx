"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  BrainCircuit,
  Skull,
  Bot,
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

const SIZE = 5;
const MAX_PIECES = 5;

const generateWinningCombos = () => {
  const combos: number[][] = [];

  // Rows
  for (let row = 0; row < SIZE; row++) {
    combos.push([...Array(SIZE)].map((_, i) => row * SIZE + i));
  }

  // Columns
  for (let col = 0; col < SIZE; col++) {
    combos.push([...Array(SIZE)].map((_, i) => i * SIZE + col));
  }

  // Diagonal TL to BR
  combos.push([...Array(SIZE)].map((_, i) => i * (SIZE + 1)));

  // Diagonal TR to BL
  combos.push([...Array(SIZE)].map((_, i) => (i + 1) * (SIZE - 1)));

  return combos;
};

const WINNING_COMBOS = generateWinningCombos();

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
  const [aiThinking, setAiThinking] = useState(false);
  const [loadingMode, setLoadingMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (mode !== "pvp" && current === "O" && !winner && !aiThinking) {
      makeAIMove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, mode]);

  const getBackgroundGradient = () => {
    if (mode === "impossible") {
      return "linear-gradient(to bottom right, #330000, #550000, #220000)";
    }
    return `linear-gradient(to bottom right, ${theme.from}, ${theme.via}, ${theme.to})`;
  };

  const checkWinner = (b: (null | "X" | "O")[]) => {
    for (const combo of WINNING_COMBOS) {
      const [first, ...rest] = combo;
      if (b[first] && rest.every((i) => b[i] === b[first])) {
        return b[first];
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (winner || (current === "O" && mode !== "pvp") || aiThinking) return;

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

    if (newBoard[index] === null && placed[player] < MAX_PIECES) {
      newBoard[index] = player;
      setBoard(newBoard);
      setPlaced((prev) => ({ ...prev, [player]: prev[player] + 1 }));
      const maybeWinner = checkWinner(newBoard);
      if (maybeWinner) setWinner(maybeWinner);
      else setCurrent(player === "X" ? "O" : "X");
    }
  };

  const makeAIMove = () => {
    setAiThinking(true);

    setTimeout(() => {
      const newBoard = [...board];
      const ai = "O";
      const human = "X";
      let moveIndex = -1;

      switch (mode) {
        case "easy":
          moveIndex = getRandomMove(newBoard);
          break;
        case "normal":
          moveIndex = getSmartMove(newBoard, ai, human);
          break;
        case "hard":
          moveIndex = getBetterMove(newBoard, ai, human);
          break;
        case "nightmare":
        case "impossible":
          moveIndex = getBestMoveMinimax(newBoard, ai, human);
          break;
      }

      if (moveIndex === -1) return setAiThinking(false);

      if (placed["O"] < MAX_PIECES) {
        newBoard[moveIndex] = "O";
        setPlaced((prev) => ({ ...prev, O: prev.O + 1 }));
      } else {
        for (let i = 0; i < SIZE * SIZE; i++) {
          if (newBoard[i] === "O") {
            newBoard[i] = null;
            break;
          }
        }
        newBoard[moveIndex] = "O";
      }

      setBoard(newBoard);
      const maybeWinner = checkWinner(newBoard);
      if (maybeWinner) setWinner(maybeWinner);
      else setCurrent("X");

      setAiThinking(false);
    }, 1000 + Math.random() * 1000);
  };

  const getRandomMove = (b: (null | "X" | "O")[]) => {
    const options = b
      .map((cell, idx) => (cell === null ? idx : null))
      .filter((i): i is number => i !== null);
    return options[Math.floor(Math.random() * options.length)] ?? -1;
  };

  const getSmartMove = (
    b: (null | "X" | "O")[],
    ai: "X" | "O",
    player: "X" | "O"
  ) => {
    for (const combo of WINNING_COMBOS) {
      const line = combo.map((i) => b[i]);
      if (
        line.filter((v) => v === ai).length === SIZE - 1 &&
        line.includes(null)
      ) {
        return combo[line.indexOf(null)];
      }
    }
    for (const combo of WINNING_COMBOS) {
      const line = combo.map((i) => b[i]);
      if (
        line.filter((v) => v === player).length === SIZE - 1 &&
        line.includes(null)
      ) {
        return combo[line.indexOf(null)];
      }
    }
    return getRandomMove(b);
  };

  const getBetterMove = (
    b: (null | "X" | "O")[],
    ai: "X" | "O",
    player: "X" | "O"
  ) => {
    const smart = getSmartMove(b, ai, player);
    if (smart !== -1) return smart;

    const preferred = [
      12, // center
      6,
      7,
      8,
      11,
      13,
      16,
      17,
      18, // inner ring
      0,
      4,
      20,
      24, // corners
      1,
      2,
      3,
      5,
      9,
      10,
      14,
      15,
      19,
      21,
      22,
      23, // edges and remaining
    ];
    return preferred.find((i) => b[i] === null) ?? -1;
  };

  const getBestMoveMinimax = (
    b: (null | "X" | "O")[],
    ai: "X" | "O",
    player: "X" | "O"
  ) => {
    const smart = getSmartMove(b, ai, player);
    if (smart !== -1) return smart;

    let bestMove = -1;
    let bestScore = -1;

    for (let i = 0; i < b.length; i++) {
      if (b[i] === null) {
        let score = 0;

        for (const combo of WINNING_COMBOS) {
          if (combo.includes(i)) {
            const line = combo.map((idx) => b[idx]);
            const aiCount = line.filter((v) => v === ai).length;
            const playerCount = line.filter((v) => v === player).length;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const emptyCount = line.filter((v) => v === null).length;

            if (playerCount === 0) {
              score += aiCount * aiCount;
            }
            if (aiCount === 0 && playerCount >= 2) {
              score += playerCount * 2;
            }
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove !== -1 ? bestMove : getBetterMove(b, ai, player);
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
    setAiThinking(false);
  };

  const modes = [
    { value: "pvp", label: "Player vs Player", icon: Users },
    { value: "easy", label: "Easy", icon: BrainCircuit },
    { value: "normal", label: "Normal", icon: BrainCircuit },
    { value: "hard", label: "Hard", icon: BrainCircuit },
    { value: "nightmare", label: "Nightmare", icon: Skull },
    { value: "impossible", label: "Impossible", icon: Bot },
  ];

  return (
    <div
      className="relative min-h-screen px-6 py-12 font-mono text-white overflow-hidden"
      style={{
        backgroundImage: getBackgroundGradient(),
      }}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#00ffe033_1px,transparent_1px)] [background-size:20px_20px] animate-pulse-slow"></div>

      {glitching && (
        <div className="fixed inset-0 z-50 bg-black animate-glitch-fade"></div>
      )}

      {loadingMode && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-cyan-300 text-sm animate-pulse">
            <RotateCcw className="w-4 h-4 animate-spin-slow" />
            <span>Loading Mode...</span>
          </div>
        </div>
      )}

      <button
        onClick={handleBack}
        className="absolute top-6 left-6 text-cyan-400 hover:text-cyan-200 flex items-center gap-2 z-10 cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="max-w-4xl mx-auto text-center">
        <h1
          className={`text-4xl font-bold mb-6 bg-gradient-to-r ${theme.title} text-transparent bg-clip-text drop-shadow-[0_0_15px_#00f5d4]`}
        >
          5x5 Cyber Board
        </h1>

        <div className="mb-6 flex flex-wrap justify-center gap-2 text-sm text-cyan-200">
          {modes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setLoadingMode(true);
                setTimeout(() => {
                  setMode(value);
                  resetGame();
                  setLoadingMode(false);
                }, 1000);
              }}
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

        <div className="grid grid-cols-5 gap-3 w-fit mx-auto mt-6">
          {board.map((cell, idx) => (
            <div
              key={idx}
              onClick={() => handleClick(idx)}
              className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-xl border ${
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

        {aiThinking && mode !== "pvp" && (
          <div className="mt-2 flex items-center justify-center gap-2 text-cyan-400 animate-pulse text-sm">
            <Bot className="w-4 h-4 animate-spin-slow" />
            <span>AI is thinking...</span>
          </div>
        )}

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
