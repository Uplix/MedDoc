import React, { useState, useEffect } from 'react';

const LoadingPage = ({ onComplete }) => {
  const [dots, setDots] = useState([true, false, false, false]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete('form');
    }, 4000);

    const interval = setInterval(() => {
      setDots(prev => {
        const next = [...prev];
        const activeIndex = next.findIndex(d => d);
        next[activeIndex] = false;
        next[(activeIndex + 1) % next.length] = true;
        return next;
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onComplete]);

  // Dot logic using standard Tailwind classes + custom animation
  const dotClasses = (isActive, index) => {
    let color = ['bg-blue-600', 'bg-blue-400', 'bg-blue-300', 'bg-blue-200'][index];
    if (!isActive) {
      color = 'bg-gray-200';
    }
    return `w-4 h-4 rounded-full ${color} transition-all duration-300 ${isActive ? 'animate-loading-pulse' : ''}`;
  };

  return (
    // Uses custom color med-bg-light
    <div className="min-w-screen flex flex-col items-center    bg-transparent">
    <div className='max-w-lg space-x-4 mb-8 bg-med-bg-soft rounded-lg shadow-2xl mx-auto p-16'>
      <div className="flex justify-center mb-8">
        {dots.map((isActive, index) => (
          <div key={index} className={dotClasses(isActive, index)}></div>
        ))}
      </div>
      <p className="text-3xl tracking-widest font-light text-center text-gray-600">
        L O A D I N G
      </p>
    </div>
    </div>
  );
};
export default LoadingPage;