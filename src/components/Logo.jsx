const Logo = ({ className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Image */}
      <div className="relative">
        <img 
          src="/logonew.png" 
          alt="Vantage Dating Logo" 
          className="h-10 w-auto object-contain"
        />
      </div>
    </div>
  );
};

export default Logo;



