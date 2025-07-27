"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  BrainCircuit,
  Skull,
  Bot,
  Radiation,
  RotateCcw,
  GalleryHorizontal,
  Settings,
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

// Separate component that uses useSearchParams
const GameContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const SIZE = parseInt(searchParams.get("size") || "6");
  const WIN_CONDITION = parseInt(searchParams.get("win") || "4");
  const INITIAL_MODE = searchParams.get("mode") || "pvp";

  const [board, setBoard] = useState<(null | "X" | "O")[]>(
    Array(SIZE * SIZE).fill(null)
  );
  const [current, setCurrent] = useState<"X" | "O">("X");
  const [placed, setPlaced] = useState({ X: 0, O: 0 });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [glitching, setGlitching] = useState(false);
  const [mode, setMode] = useState(INITIAL_MODE);
  const [winner, setWinner] = useState<null | "X" | "O">(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [loadingMode, setLoadingMode] = useState(false);

  const generateWinningCombos = () => {
    const combos: number[][] = [];

    // Rows
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col <= SIZE - WIN_CONDITION; col++) {
        combos.push(
          [...Array(WIN_CONDITION)].map((_, i) => row * SIZE + col + i)
        );
      }
    }

    // Columns
    for (let col = 0; col < SIZE; col++) {
      for (let row = 0; row <= SIZE - WIN_CONDITION; row++) {
        combos.push(
          [...Array(WIN_CONDITION)].map((_, i) => (row + i) * SIZE + col)
        );
      }
    }

    // Diagonal TL to BR
    for (let row = 0; row <= SIZE - WIN_CONDITION; row++) {
      for (let col = 0; col <= SIZE - WIN_CONDITION; col++) {
        combos.push(
          [...Array(WIN_CONDITION)].map((_, i) => (row + i) * SIZE + (col + i))
        );
      }
    }

    // Diagonal TR to BL
    for (let row = 0; row <= SIZE - WIN_CONDITION; row++) {
      for (let col = WIN_CONDITION - 1; col < SIZE; col++) {
        combos.push(
          [...Array(WIN_CONDITION)].map((_, i) => (row + i) * SIZE + (col - i))
        );
      }
    }

    return combos;
  };

  const WINNING_COMBOS = generateWinningCombos();

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
      if (combo.length === WIN_CONDITION) {
        const [first, ...rest] = combo;
        if (b[first] && rest.every((i) => b[i] === b[first])) {
          return b[first];
        }
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

    if (newBoard[index] === null && placed[player] < SIZE) {
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
          moveIndex = getBestMove(newBoard, ai, human);
          break;
      }

      if (moveIndex === -1) return setAiThinking(false);

      if (placed["O"] < SIZE) {
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
      const aiCount = line.filter((v) => v === ai).length;
      const emptyCount = line.filter((v) => v === null).length;

      if (aiCount === WIN_CONDITION - 1 && emptyCount === 1) {
        return combo[line.indexOf(null)];
      }
    }

    for (const combo of WINNING_COMBOS) {
      const line = combo.map((i) => b[i]);
      const playerCount = line.filter((v) => v === player).length;
      const emptyCount = line.filter((v) => v === null).length;

      if (playerCount === WIN_CONDITION - 1 && emptyCount === 1) {
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const center = Math.floor((SIZE * SIZE) / 2);
    const positions = Array.from({ length: SIZE * SIZE }, (_, i) => i);

    positions.sort((a, b) => {
      const aRow = Math.floor(a / SIZE);
      const aCol = a % SIZE;
      const bRow = Math.floor(b / SIZE);
      const bCol = b % SIZE;
      const centerRow = Math.floor(SIZE / 2);
      const centerCol = Math.floor(SIZE / 2);

      const aDist = Math.abs(aRow - centerRow) + Math.abs(aCol - centerCol);
      const bDist = Math.abs(bRow - centerRow) + Math.abs(bCol - centerCol);

      return aDist - bDist;
    });

    return positions.find((i) => b[i] === null) ?? -1;
  };

  const getBestMove = (
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

            if (playerCount === 0) {
              score += Math.pow(aiCount + 1, 2);
            }
            if (aiCount === 0 && playerCount >= WIN_CONDITION - 2) {
              score += playerCount * 3;
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
    { value: "impossible", label: "Impossible", icon: Radiation },
  ];

  const getCellSize = () => {
    if (SIZE <= 5) return "w-16 h-16 sm:w-20 sm:h-20 text-2xl";
    if (SIZE <= 7) return "w-12 h-12 sm:w-16 sm:h-16 text-xl";
    if (SIZE <= 10) return "w-10 h-10 sm:w-12 sm:h-12 text-lg";
    return "w-8 h-8 sm:w-10 sm:h-10 text-sm";
  };

  const getGap = () => {
    if (SIZE <= 5) return "gap-4";
    if (SIZE <= 7) return "gap-3";
    if (SIZE <= 10) return "gap-2";
    return "gap-1";
  };

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

      <div className="max-w-6xl mx-auto text-center">
        <h1
          className={`text-4xl font-bold mb-4 bg-gradient-to-r ${theme.title} text-transparent bg-clip-text drop-shadow-[0_0_15px_#00f5d4]`}
        >
          Custom {SIZE}x{SIZE} Board
        </h1>

        <div className="text-cyan-300 text-sm mb-6 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            Get {WIN_CONDITION} in a row to win
          </span>
          <span>•</span>
          <span>Each player places {SIZE} pieces</span>
        </div>

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

        <div
          className={`grid w-fit mx-auto mt-6 ${getGap()}`}
          style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
        >
          {board.map((cell, idx) => (
            <div
              key={idx}
              onClick={() => handleClick(idx)}
              className={`${getCellSize()} flex items-center justify-center border ${
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
          <span className="text-xs ml-4 opacity-75">
            Pieces: X({placed.X}/{SIZE}) • O({placed.O}/{SIZE})
          </span>
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

const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
    <div className="text-cyan-300 text-lg animate-pulse">Loading game...</div>
  </div>
);

const Page = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GameContent />
    </Suspense>
  );
};

export default Page;
