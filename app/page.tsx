// app/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu } from "lucide-react";

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
  const boardSizes = [3, 4, 5];
  const [glitching, setGlitching] = useState(false);
  const router = useRouter();

  const handleClick = (size: number) => {
    setGlitching(true);
    setTimeout(() => {
      if (size === 0) {
        router.push("/custom");
      } else if (size === -1) {
        router.push("/infinite");
      } else {
        router.push(`/game/${size}x${size}`);
      }
    }, 800); // Delay for glitch effect
  };

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

      <div className="max-w-5xl mx-auto text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
          <Cpu className="w-10 h-10 text-cyan-300 animate-pulse drop-shadow-[0_0_10px_#00ffe0]" />
          <h1
            className={`text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r ${theme.title} text-transparent bg-clip-text drop-shadow-[0_0_15px_#00f5d4]`}
          >
            Tic Tac Gallery
          </h1>
        </div>

        <p className="text-cyan-300 text-lg mb-12">
          Hacker mode: Select your grid and outplay the system.
        </p>

        {/* Grid Options */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {boardSizes.map((size) => (
            <div
              key={size}
              onClick={() => handleClick(size)}
              className={`bg-white/5 border ${theme.border} backdrop-blur-sm hover:scale-105 transition-transform duration-300 rounded-2xl p-6 cursor-pointer shadow-[0_0_20px_#00ffe033] ${theme.glow}`}
            >
              <div
                className={`text-3xl font-bold mb-1 glitch-hover ${theme.text}`}
              >
                {size} × {size}
              </div>
              <div className="text-sm text-cyan-200 tracking-wide uppercase">
                Enter Grid
              </div>
            </div>
          ))}

          {/* Custom Mode */}
          <div
            onClick={() => handleClick(0)}
            className={`bg-white/5 border ${theme.border} backdrop-blur-sm hover:scale-105 transition-transform duration-300 rounded-2xl p-6 cursor-pointer shadow-[0_0_20px_#00ffe033] ${theme.glow}`}
          >
            <div
              className={`text-2xl font-bold mb-1 glitch-hover ${theme.text}`}
            >
              Custom Mode
            </div>
            <div className="text-sm text-cyan-200 tracking-wide uppercase">
              Choose Size
            </div>
          </div>

          {/* Infinite Mode */}
          <div
            onClick={() => handleClick(-1)}
            className={`bg-white/5 border ${theme.border} backdrop-blur-sm hover:scale-105 transition-transform duration-300 rounded-2xl p-6 cursor-pointer shadow-[0_0_20px_#00ffe033] ${theme.glow}`}
          >
            <div
              className={`text-2xl font-bold mb-1 glitch-hover ${theme.text}`}
            >
              Infinite Mode
            </div>
            <div className="text-sm text-cyan-200 tracking-wide uppercase">
              No Limits
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
