import React from 'react';

interface SpinWheelIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isSpinning?: boolean;
}

export const SpinWheelIcon: React.FC<SpinWheelIconProps> = ({
  className = '',
  size = 'md',
  isSpinning = false,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-18 h-18 sm:w-20 sm:h-20',
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${sizeClasses} ${className} group select-none`}
    >
      {/* Outer ambient glow: deep amber in dark mode, warm gold with dark shadow in light mode */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 opacity-60 dark:opacity-85 blur-[3px] group-hover:opacity-100 group-hover:blur-[5px] group-hover:scale-110 transition-all duration-300 animate-pulse pointer-events-none" />

      {/* Rotating dashed celestial orbit ring for high-tech gaming aesthetic - High contrast in light & dark */}
      <div className="absolute -inset-[3px] rounded-full border border-slate-700/50 dark:border-amber-300/60 border-dashed animate-[spin_8s_linear_infinite] group-hover:animate-[spin_2s_linear_infinite] pointer-events-none" />

      {/* High-contrast Bezel Chassis: dark outer ring in light mode for razor-sharp silhouette */}
      <div className="relative w-full h-full rounded-full p-[2.5px] bg-gradient-to-tr from-slate-900 via-amber-500 to-slate-900 dark:from-amber-600 dark:via-yellow-300 dark:to-amber-700 border border-slate-900/60 dark:border-amber-400/80 shadow-[0_2px_8px_rgba(15,23,42,0.4)] dark:shadow-[0_0_18px_rgba(245,158,11,0.7)] group-hover:shadow-[0_4px_14px_rgba(15,23,42,0.5)] dark:group-hover:shadow-[0_0_25px_rgba(245,158,11,0.95)] transition-all duration-300 flex items-center justify-center overflow-hidden">
        
        {/* Inner spinning wheel disc on obsidian bed */}
        <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center shadow-inner border border-amber-300/60 dark:border-transparent">
          <img
            src="/assets/aistudio/image_2026-10-27_172409302_18fa3e59.png"
            alt="Spin Wheel"
            className={`w-full h-full object-cover scale-[1.08] ${
              isSpinning
                ? 'animate-[spin_0.5s_linear_infinite]'
                : 'animate-[spin_4s_linear_infinite] group-hover:animate-[spin_0.8s_linear_infinite]'
            } transition-all duration-200 will-change-transform`}
            loading="lazy"
          />

          {/* Glistening light sweep effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
        </div>
      </div>

      {/* 3D Golden Flapper / Needle at Top with Dark Outline for perfect visibility in light mode */}
      <div className="absolute -top-1.5 start-1/2 -translate-x-1/2 z-20 pointer-events-none filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] transition-transform group-hover:scale-110 group-hover:-translate-y-0.5">
        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[9px] border-t-amber-500 dark:border-t-amber-400 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
      </div>
    </div>
  );
};

export default SpinWheelIcon;
