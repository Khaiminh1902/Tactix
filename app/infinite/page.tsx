/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  BrainCircuit,
  Skull,
  Bot,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Infinity,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ChevronLeft,
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

interface Cell {
  player: "X" | "O" | null;
  x: number;
  y: number;
}

const Page = () => {
  const [glitching, setGlitching] = useState(false);
  const [board, setBoard] = useState<Map<string, Cell>>(new Map());
  const [current, setCurrent] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<null | "X" | "O">(null);
  const [mode, setMode] = useState("pvp");
  const [aiThinking, setAiThinking] = useState(false);
  const [viewCenter, setViewCenter] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [moveCount, setMoveCount] = useState(0);

  const router = useRouter();
  const CELL_SIZE = 60;
  const VISIBLE_RANGE = 8;
  const WIN_CONDITION = 5;
  const MOVE_STEP = 2;

  const getCellKey = (x: number, y: number) => `${x},${y}`;

  const getCell = (x: number, y: number): Cell => {
    const key = getCellKey(x, y);
    return board.get(key) || { player: null, x, y };
  };

  const setCell = (x: number, y: number, player: "X" | "O" | null) => {
    const newBoard = new Map(board);
    const key = getCellKey(x, y);

    if (player === null) {
      newBoard.delete(key);
    } else {
      newBoard.set(key, { player, x, y });
    }

    setBoard(newBoard);
  };

  const checkWinnerAround = useCallback(
    (x: number, y: number, player: "X" | "O"): boolean => {
      const directions = [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, -1],
      ];

      for (const [dx, dy] of directions) {
        let count = 1;

        for (let i = 1; i < WIN_CONDITION; i++) {
          const cell = getCell(x + dx * i, y + dy * i);
          if (cell.player === player) {
            count++;
          } else {
            break;
          }
        }

        for (let i = 1; i < WIN_CONDITION; i++) {
          const cell = getCell(x - dx * i, y - dy * i);
          if (cell.player === player) {
            count++;
          } else {
            break;
          }
        }

        if (count >= WIN_CONDITION) {
          return true;
        }
      }

      return false;
    },
    [board]
  );

  const handleCellClick = (x: number, y: number) => {
    if (winner || (current === "O" && mode !== "pvp") || aiThinking) return;

    const cell = getCell(x, y);
    if (cell.player !== null) return;

    setCell(x, y, current);
    setMoveCount((prev) => prev + 1);

    if (checkWinnerAround(x, y, current)) {
      setWinner(current);
    } else {
      setCurrent(current === "X" ? "O" : "X");
    }
  };

  const makeAIMove = useCallback(() => {
    if (mode === "pvp" || current !== "O" || winner || aiThinking) return;

    setAiThinking(true);

    setTimeout(() => {
      const centerX = viewCenter.x;
      const centerY = viewCenter.y;
      const searchRange = 10;

      const emptyCells: { x: number; y: number; score: number }[] = [];

      for (let x = centerX - searchRange; x <= centerX + searchRange; x++) {
        for (let y = centerY - searchRange; y <= centerY + searchRange; y++) {
          const cell = getCell(x, y);
          if (cell.player === null) {
            let hasNearbyPiece = false;
            for (let dx = -2; dx <= 2; dx++) {
              for (let dy = -2; dy <= 2; dy++) {
                if (dx === 0 && dy === 0) continue;
                const nearbyCell = getCell(x + dx, y + dy);
                if (nearbyCell.player !== null) {
                  hasNearbyPiece = true;
                  break;
                }
              }
              if (hasNearbyPiece) break;
            }

            if (hasNearbyPiece || (x >= -1 && x <= 1 && y >= -1 && y <= 1)) {
              let score = 0;

              if (checkWinnerAround(x, y, "O")) {
                score += 1000;
              }

              if (checkWinnerAround(x, y, "X")) {
                score += 500;
              }

              score += Math.max(0, 10 - Math.abs(x) - Math.abs(y));

              emptyCells.push({ x, y, score });
            }
          }
        }
      }

      if (emptyCells.length === 0) {
        setCell(0, 0, "O");
        setMoveCount((prev) => prev + 1);
      } else {
        emptyCells.sort((a, b) => b.score - a.score);
        const bestMove = emptyCells[0];

        setCell(bestMove.x, bestMove.y, "O");
        setMoveCount((prev) => prev + 1);

        if (checkWinnerAround(bestMove.x, bestMove.y, "O")) {
          setWinner("O");
        } else {
          setCurrent("X");
        }
      }

      setAiThinking(false);
    }, 1000 + Math.random() * 1000);
  }, [mode, current, winner, aiThinking, viewCenter, checkWinnerAround]);

  useEffect(() => {
    makeAIMove();
  }, [makeAIMove]);

  const handleBack = () => {
    setGlitching(true);
    setTimeout(() => router.back(), 800);
  };

  const resetGame = () => {
    setBoard(new Map());
    setCurrent("X");
    setWinner(null);
    setMoveCount(0);
    setViewCenter({ x: 0, y: 0 });
    setZoom(1);
    setAiThinking(false);
  };

  const moveView = (direction: "up" | "down" | "left" | "right") => {
    setViewCenter((prev) => {
      switch (direction) {
        case "up":
          return { ...prev, y: prev.y - MOVE_STEP };
        case "down":
          return { ...prev, y: prev.y + MOVE_STEP };
        case "left":
          return { ...prev, x: prev.x - MOVE_STEP };
        case "right":
          return { ...prev, x: prev.x + MOVE_STEP };
        default:
          return prev;
      }
    });
  };

  const modes = [
    { value: "pvp", label: "Player vs Player", icon: Users },
    { value: "easy", label: "Easy AI", icon: BrainCircuit },
    { value: "hard", label: "Hard AI", icon: Skull },
    { value: "impossible", label: "Impossible AI", icon: Bot },
  ];

  const renderGrid = () => {
    const cells = [];
    const startX = viewCenter.x - VISIBLE_RANGE;
    const endX = viewCenter.x + VISIBLE_RANGE;
    const startY = viewCenter.y - VISIBLE_RANGE;
    const endY = viewCenter.y + VISIBLE_RANGE;

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const cell = getCell(x, y);
        const isCenter = x === 0 && y === 0;

        cells.push(
          <div
            key={getCellKey(x, y)}
            onClick={() => handleCellClick(x, y)}
            className={`
              flex items-center justify-center border transition-all duration-200 rounded-lg cursor-pointer
              ${theme.border} bg-[#001f2f] ${
              theme.text
            } hover:shadow-[0_0_15px_#00ffe088]
              ${isCenter ? "ring-2 ring-yellow-400/50" : ""}
              ${
                cell.player === "X"
                  ? "text-red-400"
                  : cell.player === "O"
                  ? "text-blue-400"
                  : ""
              }
            `}
            style={{
              width: CELL_SIZE * zoom,
              height: CELL_SIZE * zoom,
              fontSize: 20 * zoom + "px",
            }}
          >
            {cell.player || (isCenter && moveCount === 0 ? "·" : "")}
          </div>
        );
      }
    }

    return cells;
  };

  return (
    <div
      className="relative min-h-screen px-6 py-12 font-mono text-white overflow-hidden select-none"
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${theme.from}, ${theme.via}, ${theme.to})`,
      }}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#00ffe033_1px,transparent_1px)] [background-size:20px_20px] animate-pulse-slow"></div>

      {glitching && (
        <div className="fixed inset-0 z-50 bg-black animate-glitch-fade"></div>
      )}

      <button
        onClick={handleBack}
        className="absolute top-6 left-6 text-cyan-400 hover:text-cyan-200 flex items-center gap-2 z-10 cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <h1
          className={`text-4xl font-bold mb-4 bg-gradient-to-r ${theme.title} text-transparent bg-clip-text drop-shadow-[0_0_15px_#00f5d4] flex items-center justify-center gap-2`}
        >
          <Infinity className="w-8 h-8" />
          Infinite Mode
        </h1>

        <div className="text-cyan-300 text-sm mb-6 flex items-center justify-center gap-4">
          <span>Get {WIN_CONDITION} in a row to win</span>
          <span>•</span>
          <span>Moves: {moveCount}</span>
          <span>•</span>
          <span>
            Position: ({viewCenter.x}, {viewCenter.y})
          </span>
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-2 text-sm text-cyan-200">
          {modes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setMode(value);
                resetGame();
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

        <div className="mb-4 flex justify-center gap-2">
          <button
            onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.2))}
            className="px-3 py-1 border border-cyan-400/30 rounded-full text-cyan-300 hover:border-cyan-300 flex items-center gap-1 transition-all duration-200 hover:scale-105"
          >
            <ZoomOut className="w-4 h-4" /> Zoom Out
          </button>
          <button
            onClick={() => setViewCenter({ x: 0, y: 0 })}
            className="px-3 py-1 border border-cyan-400/30 rounded-full text-cyan-300 hover:border-cyan-300 flex items-center gap-1 transition-all duration-200 hover:scale-105"
          >
            <Move className="w-4 h-4" /> Center
          </button>
          <button
            onClick={() => setZoom((prev) => Math.min(2, prev + 0.2))}
            className="px-3 py-1 border border-cyan-400/30 rounded-full text-cyan-300 hover:border-cyan-300 flex items-center gap-1 transition-all duration-200 hover:scale-105"
          >
            <ZoomIn className="w-4 h-4" /> Zoom In
          </button>
        </div>

        <div className="flex items-center justify-center gap-8">
          <div
            className="grid w-fit gap-1 bg-[#000a1a] p-4 rounded-xl border border-cyan-400/20"
            style={{
              gridTemplateColumns: `repeat(${
                VISIBLE_RANGE * 2 + 1
              }, minmax(0, 1fr))`,
              maxHeight: "60vh",
              overflow: "hidden",
            }}
          >
            {renderGrid()}
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="text-cyan-300 text-sm font-semibold mb-2">
              Movement Controls
            </div>

            <button
              onClick={() => moveView("up")}
              className="w-12 h-12 border border-cyan-400/30 rounded-lg bg-[#001f2f] text-cyan-300 hover:border-cyan-300 hover:shadow-[0_0_15px_#00ffe088] transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-95"
            >
              <ArrowUp className="w-6 h-6" />
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => moveView("left")}
                className="w-12 h-12 border border-cyan-400/30 rounded-lg bg-[#001f2f] text-cyan-300 hover:border-cyan-300 hover:shadow-[0_0_15px_#00ffe088] transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => moveView("right")}
                className="w-12 h-12 border border-cyan-400/30 rounded-lg bg-[#001f2f] text-cyan-300 hover:border-cyan-300 hover:shadow-[0_0_15px_#00ffe088] transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-95"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            <button
              onClick={() => moveView("down")}
              className="w-12 h-12 border border-cyan-400/30 rounded-lg bg-[#001f2f] text-cyan-300 hover:border-cyan-300 hover:shadow-[0_0_15px_#00ffe088] transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-95"
            >
              <ArrowDown className="w-6 h-6" />
            </button>

            <div className="text-xs text-cyan-400/70 mt-2 text-center">
              <div>Move: {MOVE_STEP} cells</div>
              <div>per button press</div>
            </div>
          </div>
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

        {winner && (
          <div className="mt-10 text-green-300 animate-pulse drop-shadow-[0_0_10px_#00ffe0]">
            <h2 className="text-2xl font-bold mb-4">{winner} Wins!</h2>
            <button
              onClick={resetGame}
              className="px-4 py-2 rounded-full border border-green-300 text-green-300 flex items-center gap-2 hover:shadow-[0_0_10px_#00ffe088] hover:border-cyan-300 cursor-pointer mx-auto"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
          </div>
        )}

        <div className="mt-8 text-xs text-cyan-400/70 max-w-2xl mx-auto">
          <p className="mb-2">
            🎮 <strong>How to play:</strong>
          </p>
          <p>• Use the arrow buttons to move around the infinite board</p>
          <p>• Get {WIN_CONDITION} pieces in a row (any direction) to win</p>
          <p>• The yellow ring marks the center (0,0)</p>
          <p>• Use zoom controls to get a better view</p>
        </div>
      </div>
    </div>
  );
};

export default Page;
