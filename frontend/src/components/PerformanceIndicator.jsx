import React from 'react';

const PerformanceIndicator = ({ useSimpleBackground, fps }) => {
  if (!fps && !useSimpleBackground) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm border border-white/20">
        {useSimpleBackground ? (
          <div className="flex items-center space-x-2">
            <span className="text-green-400">⚡</span>
            <span>Performance Mode</span>
          </div>
        ) : (
          fps && (
            <div className="flex items-center space-x-2">
              <span className={fps < 30 ? 'text-red-400' : fps < 50 ? 'text-yellow-400' : 'text-green-400'}>
                ●
              </span>
              <span>{fps.toFixed(0)} FPS</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PerformanceIndicator;
