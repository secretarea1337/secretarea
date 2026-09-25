import React, { useState, useEffect, useMemo } from 'react';

export const LowPolyBackground = ({ 
  fillClass = "fill-slate-100/30 dark:fill-[#0B0F19]/50",
  strokeClass = "stroke-blue-500/30 dark:stroke-cyan-500/30",
  opacityRange = [0.01, 0.08],
  activeOpacityRange = [0, 0.3, 0]
}) => {
  const polygons = useMemo(() => {
    const cols = 8;
    const rows = 6;
    const width = 100;
    const height = 100;
    const cellW = width / cols;
    const cellH = height / rows;

    const points: {x: number, y: number}[][] = [];
    for (let i = 0; i <= rows; i++) {
      const row = [];
      for (let j = 0; j <= cols; j++) {
        let x = j * cellW;
        let y = i * cellH;
        if (j > 0 && j < cols) x += (Math.random() - 0.5) * (cellW * 0.9);
        if (i > 0 && i < rows) y += (Math.random() - 0.5) * (cellH * 0.9);
        row.push({ x, y });
      }
      points.push(row);
    }

    const polys = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const p1 = points[i][j];
        const p2 = points[i][j+1];
        const p3 = points[i+1][j];
        const p4 = points[i+1][j+1];

        const baseOpacity1 = opacityRange[0] + Math.random() * opacityRange[1];
        const baseOpacity2 = opacityRange[0] + Math.random() * opacityRange[1];

        polys.push({
          id: `poly-${i}-${j}-1`,
          points: `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`,
          baseOpacity: baseOpacity1,
          dur: 3 + Math.random() * 4,
          delay: Math.random() * 2
        });
        polys.push({
          id: `poly-${i}-${j}-2`,
          points: `${p2.x},${p2.y} ${p4.x},${p4.y} ${p3.x},${p3.y}`,
          baseOpacity: baseOpacity2,
          dur: 3 + Math.random() * 4,
          delay: Math.random() * 2
        });
      }
    }
    return polys;
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {polygons.map(poly => (
          <polygon 
            key={poly.id}
            points={poly.points}
            className={`${fillClass} ${strokeClass}`}
            strokeWidth="0.15"
            opacity={poly.baseOpacity}
          >
            <animate 
              attributeName="opacity" 
              values={`${poly.baseOpacity};${poly.baseOpacity + activeOpacityRange[1]};${poly.baseOpacity}`} 
              dur={`${poly.dur}s`} 
              begin={`${poly.delay}s`} 
              repeatCount="indefinite" 
            />
          </polygon>
        ))}
      </svg>
    </div>
  );
};
