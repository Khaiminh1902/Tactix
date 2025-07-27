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

const SIZE = 4;
const WINNING_COMBOS = [
  // Rows
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [12, 13, 14, 15],
  // Columns
  [0, 4, 8, 12],
  [1, 5, 9, 13],
  [2, 6, 10, 14],
  [3, 7, 11, 15],
  // Diagonals
  [0, 5, 10, 15],
  [3, 6, 9, 12],
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
      const [a, b1, c, d] = combo;
      if (b[a] && b[a] === b[b1] && b[a] === b[c] && b[a] === b[d]) {
        return b[a];
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

    if (newBoard[index] === null && placed[player] < 4) {
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

      if (placed["O"] < 4) {
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
    for (const [a, b1, c, d] of WINNING_COMBOS) {
      const line = [b[a], b[b1], b[c], b[d]];
      if (line.filter((v) => v === ai).length === 3 && line.includes(null)) {
        return [a, b1, c, d][line.indexOf(null)];
      }
    }
    for (const [a, b1, c, d] of WINNING_COMBOS) {
      const line = [b[a], b[b1], b[c], b[d]];
      if (
        line.filter((v) => v === player).length === 3 &&
        line.includes(null)
      ) {
        return [a, b1, c, d][line.indexOf(null)];
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

    const preferred = [5, 6, 9, 10, 0, 3, 12, 15, 1, 2, 4, 7, 8, 11, 13, 14];
    return preferred.find((i) => b[i] === null) ?? -1;
  };

  const getBestMoveMinimax = (
    b: (null | "X" | "O")[],
    ai: "X" | "O",
    player: "X" | "O"
  ) => {
    let bestScore = -Infinity;
    let move = -1;

    for (let i = 0; i < b.length; i++) {
      if (b[i] === null) {
        b[i] = ai;
        const score = minimax(b, 0, false, ai, player, 6);
        b[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  const minimax = (
    board: (null | "X" | "O")[],
    depth: number,
    isMaximizing: boolean,
    ai: "X" | "O",
    player: "X" | "O",
    maxDepth: number = 6
  ): number => {
    const winner = checkWinner(board);
    if (winner === ai) return 10 - depth;
    if (winner === player) return depth - 10;
    if (!board.includes(null) || depth >= maxDepth) return 0;

    const scores: number[] = [];

    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = isMaximizing ? ai : player;
        const score = minimax(
          board,
          depth + 1,
          !isMaximizing,
          ai,
          player,
          maxDepth
        );
        scores.push(score);
        board[i] = null;
      }
    }

    return isMaximizing ? Math.max(...scores) : Math.min(...scores);
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

      <div className="max-w-md mx-auto text-center">
        <h1
          className={`text-4xl font-bold mb-6 bg-gradient-to-r ${theme.title} text-transparent bg-clip-text drop-shadow-[0_0_15px_#00f5d4]`}
        >
          4x4 Cyber Board
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

        <div className="grid grid-cols-4 gap-3 w-fit mx-auto">
          {board.map((cell, idx) => (
            <div
              key={idx}
              onClick={() => handleClick(idx)}
              className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-2xl border ${
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
