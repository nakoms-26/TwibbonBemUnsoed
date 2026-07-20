export const ArrowYellowLeft = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full stroke-current overflow-visible"
    style={{ color: "#8ea8ea" }}
    fill="none"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10,90 C 10,40 40,20 60,50 C 70,65 80,75 95,70" />
    <path d="M80,55 L95,70 L85,85" />
  </svg>
);

export const ArrowYellowRight = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full stroke-current overflow-visible"
    style={{ color: "#4f4d9a" }}
    fill="none"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M90,10 C 80,60 60,80 40,60 C 20,40 40,20 60,30 C 80,40 70,70 50,80" />
    <path d="M65,75 L50,80 L55,65" />
  </svg>
);

export const ArrowBlack = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full stroke-current overflow-visible"
    style={{ color: "#2f2f67" }}
    fill="none"
    strokeWidth="5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20,80 Q 40,20 80,40" />
    <path d="M60,20 L80,40 L50,60" />
  </svg>
);

export const CircularBadge = () => (
  <div
    className="relative w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center shadow-xl rotate-12 hover:scale-105 transition-transform cursor-pointer"
    style={{
      background: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(79, 77, 154, 0.2)",
      boxShadow: "0 8px 32px rgba(79, 77, 154, 0.15)",
    }}
  >
    <div className="absolute inset-1 animate-[spin_10s_linear_infinite]">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          id="circlePath"
          d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
          fill="none"
        />
        <text
          className="text-[11px] font-black tracking-[0.18em] uppercase"
          fill="#4f4d9a"
        >
          <textPath href="#circlePath" startOffset="0%">
            VOLUNTEER • EVENT • OPREC •
          </textPath>
        </text>
      </svg>
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="w-10 h-10 stroke-current"
        style={{ color: "#2f2f67" }}
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20,80 Q 40,50 30,30 T 80,20" />
        <path d="M60,10 L80,20 L70,40" />
      </svg>
    </div>
  </div>
);
