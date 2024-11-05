import React, { useState, useEffect, useRef } from 'react';
import { Clock, Square } from 'lucide-react';

interface FloatingTimerProps {
  timeLeft: number;
  onEndSession: () => void;
}

export default function FloatingTimer({ timeLeft, onEndSession }: FloatingTimerProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 220, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const timerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && timerRef.current) {
        const newX = Math.min(Math.max(0, e.clientX - dragOffset.x), window.innerWidth - timerRef.current.offsetWidth);
        const newY = Math.min(Math.max(0, e.clientY - dragOffset.y), window.innerHeight - timerRef.current.offsetHeight);
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (timerRef.current) {
      const rect = timerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  return (
    <div
      ref={timerRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-lg p-4 w-52 select-none"
    >
      <div className="flex flex-col items-center space-y-3">
        <div className="flex items-center space-x-2 text-white">
          <Clock className="h-4 w-4 text-blue-400" />
          <span className="font-semibold">{timeLeft} minutes left</span>
        </div>
        <button
          onClick={onEndSession}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600/20 border border-red-500/30 rounded-md text-red-100 hover:bg-red-600/30 transition-colors duration-200"
        >
          <Square className="h-4 w-4" />
          <span>End Session</span>
        </button>
      </div>
    </div>
  );
}