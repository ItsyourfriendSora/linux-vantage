import { useState, useRef } from 'react';

interface LineChartCardProps {
  data: number[];
}

export default function LineChartCard({ data }: LineChartCardProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Map temperature range 30°C - 100°C to SVG Y-coordinates 150 - 0
  const mapTempToY = (temp: number) => {
    return Math.max(0, Math.min(150, 150 - ((temp - 30) / 70) * 150));
  };

  const points = data.map((temp, index) => {
    const x = (index / Math.max(data.length - 1, 1)) * 500;
    const y = mapTempToY(temp);
    return `${x},${y}`;
  }).join(' L ');

  const activeIdx = hoverIdx !== null ? hoverIdx : data.length - 1;
  const activeTemp = data[activeIdx] || 0;
  
  const activeX = (activeIdx / Math.max(data.length - 1, 1)) * 500;
  const activeY = mapTempToY(activeTemp);

  const fillPath = `M 0 150 L ${points.replace(/,/g, ' ')} L 500 150 Z`;
  const strokePath = `M ${points.replace(/,/g, ' ')}`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPos = e.clientX - rect.left;
    const percentage = xPos / rect.width;
    const idx = Math.min(data.length - 1, Math.max(0, Math.round(percentage * (data.length - 1))));
    setHoverIdx(idx);
  };

  return (
    <div className="bg-[#121212] rounded-lg p-6 shadow-sm border border-gray-900 w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-semibold text-lg flex items-center gap-3">
          System Temperature
          <span className="text-sm font-normal text-gray-400">
            {hoverIdx !== null ? 'History: ' : ''}{activeTemp.toFixed(1)}°C
          </span>
        </h3>
      </div>
      
      <div className="flex w-full h-64">
        {/* Y-axis labels positioned absolutely relative to their temperature */}
        <div className="relative min-w-[70px] h-full text-[10px] mr-2">
          {/* 95°C -> 150 - ((95-30)/70)*150 = 10.7px => 7.1% */}
          <span className="absolute text-red-500 font-medium" style={{ top: '7%' }}>Overheating</span>
          {/* 80°C -> 150 - ((80-30)/70)*150 = 42.8px => 28.5% */}
          <span className="absolute text-orange-500 font-medium" style={{ top: '28%' }}>Danger</span>
          {/* 60°C -> 150 - ((60-30)/70)*150 = 85.7px => 57% */}
          <span className="absolute text-green-500 font-medium" style={{ top: '57%' }}>Normal</span>
          {/* 40°C -> 150 - ((40-30)/70)*150 = 128px => 85% */}
          <span className="absolute text-blue-500 font-medium" style={{ top: '85%' }}>Very Normal</span>
        </div>

        {/* Real-time Line Chart */}
        <div 
          className="flex-1 relative h-full cursor-crosshair"
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <svg viewBox="0 0 500 150" className="w-full h-full preserve-3d" preserveAspectRatio="none">
             <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path 
              d={fillPath}
              fill="url(#lineGrad)" 
            />
            <path 
              d={strokePath}
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="drop-shadow-lg"
            />
            
            {/* Interactive Dot */}
            <circle 
              cx={activeX} 
              cy={activeY} 
              r="6" 
              fill="#121212" 
              stroke={hoverIdx !== null ? "#ffffff" : "#3b82f6"} 
              strokeWidth="3" 
              className="transition-all duration-100" 
            />

            {/* Vertical Line on Hover */}
            {hoverIdx !== null && (
              <line 
                x1={activeX} 
                y1="0" 
                x2={activeX} 
                y2="150" 
                stroke="#ffffff" 
                strokeWidth="1" 
                strokeDasharray="4"
                opacity="0.3"
              />
            )}
          </svg>
          
          {/* Hover Tooltip */}
          {hoverIdx !== null && (
            <div 
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full pb-2"
              style={{ left: `${(activeX / 500) * 100}%`, top: `${(activeY / 150) * 100}%` }}
            >
              <div className="bg-[#242424] text-white text-xs py-1 px-2 rounded-md shadow-lg border border-gray-700 whitespace-nowrap">
                {activeTemp.toFixed(1)}°C
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
