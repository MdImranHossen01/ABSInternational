import React from 'react';

export function CosmicAuthBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none bg-[#07080e]">
      {/* Cosmic Nebula Radial Glows */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[550px] opacity-75 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 25%, rgba(20, 184, 166, 0.22) 0%, rgba(13, 148, 136, 0.12) 40%, rgba(6, 78, 59, 0.05) 65%, transparent 80%)'
        }}
      />
      <div 
        className="absolute bottom-10 right-0 w-[450px] h-[450px] opacity-40 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)'
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-30 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)'
        }}
      />

      {/* Hexagonal Honeycomb Geometric Mesh */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.16] pointer-events-none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern 
            id="cosmic-hex-mesh" 
            width="56" 
            height="96.995" 
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 28 0 L 56 16.166 L 56 48.497 L 28 64.663 L 0 48.497 L 0 16.166 Z M 0 64.663 L 28 80.83 L 28 113.16 L 0 129.33 L -28 113.16 L -28 80.83 Z M 56 64.663 L 84 80.83 L 84 113.16 L 56 129.33 L 28 113.16 L 28 80.83 Z"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cosmic-hex-mesh)" />
      </svg>

      {/* Subtle Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

      {/* Decorative Gold Chevrons in bottom right like the screenshot */}
      <div className="hidden lg:flex fixed bottom-8 right-8 flex-col items-center gap-1 opacity-60 pointer-events-none z-0">
        <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2L2 12H7L14 6L21 12H26L14 2Z" fill="#dfb248" />
          <path d="M14 8L2 18H7L14 12L21 18H26L14 8Z" fill="#dfb248" />
          <path d="M14 14L2 24H7L14 18L21 24H26L14 14Z" fill="#dfb248" />
        </svg>
      </div>
    </div>
  );
}
