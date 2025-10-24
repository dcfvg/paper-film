import { useState, useRef, useEffect } from 'react';
import './SplitView.css';

interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultSplit?: number; // Percentage for left panel (default 30%)
  minSize?: number; // Minimum percentage for each panel
}

export function SplitView({ 
  left, 
  right, 
  defaultSplit = 30,
  minSize = 20 
}: SplitViewProps) {
  const [splitPosition, setSplitPosition] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const percentage = ((e.clientX - rect.left) / rect.width) * 100;

      // Constrain between minSize and (100 - minSize)
      const constrained = Math.max(minSize, Math.min(100 - minSize, percentage));
      setSplitPosition(constrained);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, minSize]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  return (
    <div 
      ref={containerRef}
      className={`split-view ${isDragging ? 'dragging' : ''}`}
    >
      <div 
        className="split-panel split-left"
        style={{ width: `${splitPosition}%` }}
      >
        {left}
      </div>
      
      <div 
        className="split-divider"
        onMouseDown={handleMouseDown}
      >
        <div className="split-handle" />
      </div>
      
      <div 
        className="split-panel split-right"
        style={{ width: `${100 - splitPosition}%` }}
      >
        {right}
      </div>
    </div>
  );
}
