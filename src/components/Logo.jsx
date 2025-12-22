const Logo = ({ className = "" }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Gradient Heart Symbol */}
      <div className="relative w-10 h-10">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left line - Orange to Pink gradient */}
          <path
            d="M 50,30 Q 30,20 20,40 Q 20,50 30,60 L 50,80"
            stroke="url(#gradientLeft)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right line - Pink to Orange gradient */}
          <path
            d="M 50,30 Q 70,20 80,40 Q 80,50 70,60 L 50,80"
            stroke="url(#gradientRight)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="gradientLeft" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF6B35" /> {/* Orange */}
              <stop offset="100%" stopColor="#FF1493" /> {/* Pink */}
            </linearGradient>
            <linearGradient id="gradientRight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF1493" /> {/* Pink */}
              <stop offset="100%" stopColor="#FF6B35" /> {/* Orange */}
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Text with gradient */}
      <div className="flex items-baseline">
        <span className="text-2xl font-bold lowercase">
          <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            nex
          </span>
          <span className="text-white">dating.com</span>
        </span>
      </div>
    </div>
  );
};

export default Logo;

