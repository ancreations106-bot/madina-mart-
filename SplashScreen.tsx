import React, { useEffect, useState } from 'react';
import { Store, Sparkles, ShieldCheck, Truck } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, onFinish }) => {
  const [fading, setFading] = useState(false);

  const handleDone = () => {
    if (onComplete) onComplete();
    if (onFinish) onFinish();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        handleDone();
      }, 400);
    }, 1600);

    return () => clearTimeout(timer);
  }, [onComplete, onFinish]);

  return (
    <div
      id="splash-screen"
      className={`fixed inset-0 z-50 bg-gradient-to-b from-emerald-950 via-emerald-900 to-neutral-950 text-white flex flex-col items-center justify-between p-8 transition-opacity duration-400 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full flex justify-end">
        <button
          onClick={handleDone}
          className="text-xs text-emerald-300/80 hover:text-white underline font-semibold px-2 py-1"
        >
          Skip
        </button>
      </div>

      <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
        {/* Animated Brand Emblem */}
        <div className="relative mb-5">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-2xl shadow-emerald-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-emerald-950 rounded-[22px] flex items-center justify-center border border-emerald-500/40">
              <Store className="w-12 h-12 text-emerald-400 animate-bounce" />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-neutral-950 shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-['Outfit',sans-serif] mb-1">
          MADINA <span className="text-emerald-400">MART</span>
        </h1>

        {/* Tagline */}
        <p className="text-emerald-200/90 text-sm font-semibold tracking-widest uppercase mb-4">
          "Your Local Shopping Store"
        </p>

        {/* Feature Pills */}
        <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-medium">
          <span className="flex items-center gap-1 bg-emerald-800/60 px-2.5 py-1 rounded-full border border-emerald-700/50">
            <Truck className="w-3 h-3 text-emerald-400" /> Fast 2-Hour Delivery
          </span>
          <span className="flex items-center gap-1 bg-emerald-800/60 px-2.5 py-1 rounded-full border border-emerald-700/50">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> 100% Genuine
          </span>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="w-full max-w-xs flex flex-col items-center gap-2">
        <div className="w-32 h-1.5 bg-emerald-950/80 rounded-full overflow-hidden border border-emerald-800/40">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full animate-[pulse_1s_infinite]"></div>
        </div>
        <span className="text-[10px] text-emerald-400/80 font-mono tracking-wider">
          Connecting to local store...
        </span>
      </div>
    </div>
  );
};
