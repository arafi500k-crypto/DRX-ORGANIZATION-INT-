import React, { useEffect, useState, useRef } from "react";
import { DragonLogo } from "./DragonLogo.tsx";

interface SplashViewProps {
  onFinish: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const onFinishRef = useRef(onFinish);

  // Keep ref up to date
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Handle progress increments
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 25); // ~2.5 seconds to reach 100%

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Enter the website 1 second after 100% is reached (well within the requested 3 second window)
  useEffect(() => {
    if (progress >= 100) {
      const enterTimer = setTimeout(() => {
        onFinishRef.current();
      }, 1000); // 1 second lag for polished entry transition
      return () => clearTimeout(enterTimer);
    }
  }, [progress]);

  return (
    <div className="fixed inset-0 bg-[#0b0f19] flex flex-col items-center justify-between py-16 px-6 select-none z-50 overflow-hidden font-display">
      {/* Background ambient animations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-red-600/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-600/5 blur-3xl" />

      {/* Top spacing */}
      <div />

      {/* Main Content */}
      <div className="flex flex-col items-center gap-6 z-10">
        <div className="relative animate-bounce duration-1000">
          <DragonLogo size={160} />
          {/* Futuristic radar line sweep overlay across logo */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/15 to-transparent h-1.5 w-full top-0 animate-infinite animate-scan" style={{ animation: 'scan 2.5s linear infinite' }} />
        </div>

        {/* Brand Text */}
        <div className="text-center mt-4">
          <h1 className="text-white text-3xl font-bold tracking-widest font-display">
            DRX ORGANIZATION
          </h1>
          <p className="text-red-500 text-xs font-mono tracking-[0.3em] uppercase mt-1">
            Championship Platform
          </p>
        </div>
      </div>

      {/* Bottom loading indicators */}
      <div className="w-full max-w-xs flex flex-col items-center gap-4 z-10">
        <p className="text-gray-400 text-xs font-mono tracking-wider animate-pulse uppercase">
          Initializing Applet... {progress}%
        </p>

        {/* ProgressBar container */}
        <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden p-0.5 border border-gray-800/80">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Staggered pulsing bullets */}
        <div className="flex gap-1.5 mt-2">
          <span className={`w-1.5 h-1.5 rounded-full ${progress > 20 ? 'bg-red-500 animate-ping' : 'bg-gray-800'}`} />
          <span className={`w-1.5 h-1.5 rounded-full ${progress > 50 ? 'bg-red-500 animate-ping' : 'bg-gray-800'}`} style={{ animationDelay: '200ms' }} />
          <span className={`w-1.5 h-1.5 rounded-full ${progress > 80 ? 'bg-red-500 animate-ping' : 'bg-gray-800'}`} style={{ animationDelay: '400ms' }} />
        </div>
      </div>

      {/* Mini scan keyframe injection */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
};
