import React from 'react';

const SimpleGradientBackground = () => {
  return (
    <div className="w-full h-full">
      {/* Animated CSS gradient fallback */}
      <div 
        className="w-full h-full animate-pulse"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(177, 158, 239, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(177, 158, 239, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(177, 158, 239, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(177, 158, 239, 0.1) 100%)
          `,
          backgroundSize: '200% 200%',
          animation: 'gradientShift 8s ease-in-out infinite alternate'
        }}
      />
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 0%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 100%; }
          }
        `}
      </style>
    </div>
  );
};

export default SimpleGradientBackground;
