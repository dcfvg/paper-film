import { useState, useRef, useEffect } from 'react';
import './SplitView.css';

interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultSplit?: number; // Percentage for left panel (default 30%)
  minSize?: number; // Minimum percentage for each panel
  minLeftWidth?: number; // Minimum pixel width for left panel (default 410px)
}

export function SplitView({
  left,
  right,
  defaultSplit = 30,
  minSize = 20,
  minLeftWidth = 410
}: SplitViewProps) {
  const [splitPosition, setSplitPosition] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ajuster la position du split lors du redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const currentLeftWidth = (splitPosition / 100) * rect.width;

      // Si la largeur actuelle est inférieure au minimum, ajuster
      if (currentLeftWidth < minLeftWidth) {
        const minLeftPercentage = (minLeftWidth / rect.width) * 100;
        setSplitPosition(Math.min(minLeftPercentage, 100 - minSize));
      }
    };

    window.addEventListener('resize', handleResize);
    // Vérifier aussi au montage
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [splitPosition, minLeftWidth, minSize]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const newLeftWidth = e.clientX - rect.left;

      // Calculer le pourcentage, mais avec contrainte de largeur minimale en pixels
      const percentage = (newLeftWidth / rect.width) * 100;

      // Contrainte de largeur minimale en pixels pour le panneau gauche
      const minLeftPercentage = (minLeftWidth / rect.width) * 100;
      const minRightPercentage = minSize;

      // Constrain entre minLeftWidth (en pixels) et (100 - minSize)
      const constrained = Math.max(
        minLeftPercentage,
        Math.min(100 - minRightPercentage, percentage)
      );

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
  }, [isDragging, minSize, minLeftWidth]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  return (
    <div ref={containerRef} className={`split-view ${isDragging ? 'dragging' : ''}`}>
      <div className="split-panel split-left" style={{ width: `${splitPosition}%` }}>
        {left}
      </div>

      <div className="split-divider" onMouseDown={handleMouseDown}>
        <div className="split-handle" />
      </div>

      <div className="split-panel split-right" style={{ width: `${100 - splitPosition}%` }}>
        {right}
      </div>
    </div>
  );
}
