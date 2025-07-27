"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const theme = {
  from: "#000e1a",
  via: "#001f2f",
  to: "#012d3a",
  text: "text-green-300",
  border: "border-cyan-400/30",
  glow: "hover:border-green-400 hover:shadow-[0_0_30px_#00ffe088]",
  title: "from-green-400 via-cyan-400 to-teal-300 ",
};

const Page = () => {
  const [glitching, setGlitching] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    setGlitching(true);
    setTimeout(() => router.back(), 800);
  };

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
          Custom Mode
        </h1>

        <div>Coming Soon...</div>
      </div>
    </div>
  );
};

export default Page;
