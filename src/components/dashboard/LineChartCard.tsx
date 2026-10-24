import { useState, useRef } from 'react';

interface LineChartCardProps {
  data: number[];
}

export default function LineChartCard({ data }: LineChartCardProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayData = data.length > 0 ? data : Array(20).fill(42.0);

  // Map temperature range 30°C - 100°C to SVG Y-coordinates 150 - 0
  const mapTempToY = (temp: number) => {
    return Math.max(0, Math.min(150, 150 - ((temp - 30) / 70) * 150));
  };

  const points = displayData.map((temp, index) => {
    const x = (index / Math.max(displayData.length - 1, 1)) * 500;
    const y = mapTempToY(temp);
    return `${x},${y}`;
  }).join(' L ');

  const activeIdx = hoverIdx !== null ? hoverIdx : displayData.length - 1;
  const activeTemp = displayData[activeIdx] || 42.0;
  
  const activeX = (activeIdx / Math.max(displayData.length - 1, 1)) * 500;
  const activeY = mapTempToY(activeTemp);

  const fillPath = `M 0 150 L ${points.replace(/,/g, ' ')} L 500 150 Z`;
  const strokePath = `M ${points.replace(/,/g, ' ')}`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPos = e.clientX - rect.left;
    const percentage = xPos / rect.width;
    const idx = Math.min(displayData.length - 1, Math.max(0, Math.round(percentage * (displayData.length - 1))));
    setHoverIdx(idx);
  };

  let statusText = 'Normal';
  let statusColor = 'text-green-400 border-green-500/30 bg-green-500/10';
  let badgeColor = 'bg-green-500';

  if (activeTemp >= 90) {
    statusText = 'Overheating';
    statusColor = 'text-red-400 border-red-500/30 bg-red-500/10';
    badgeColor = 'bg-red-500 animate-pulse';
  } else if (activeTemp >= 75) {
    statusText = 'Danger';
    statusColor = 'text-orange-400 border-orange-500/30 bg-orange-500/10';
    badgeColor = 'bg-orange-500';
  } else if (activeTemp >= 55) {
    statusText = 'Normal';
    statusColor = 'text-green-400 border-green-500/30 bg-green-500/10';
    badgeColor = 'bg-green-500';
  } else {
    statusText = 'Very Normal';
    statusColor = 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    badgeColor = 'bg-blue-500';
  }

  return (
    <div className="bg-[#121212] rounded-lg p-6 shadow-sm border border-gray-900 w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            System Temperature
          </h3>
          <span className={`text-xs px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 font-medium ${statusColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badgeColor}`}></span>
            {statusText}
          </span>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-2xl font-bold text-white tracking-tight leading-none">
            {activeTemp.toFixed(1)}°C
          </span>
          <span className={`text-[11px] font-medium mt-1.5 h-4 transition-colors ${
            hoverIdx !== null ? 'text-blue-400' : 'text-gray-500'
          }`}>
            {hoverIdx !== null ? 'History checkpoint' : 'Live reading'}
          </span>
        </div>
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
          </svg>
          
          {/* Vertical Guide Line on Hover */}
          {hoverIdx !== null && (
            <div 
              className="absolute top-0 bottom-0 pointer-events-none border-l border-dashed border-white/30 -translate-x-1/2 z-10"
              style={{ left: `${(activeX / 500) * 100}%` }}
            />
          )}

          {/* Interactive Dot - Only rendered on hover so it does not jump to the far right edge when mouse leaves */}
          {hoverIdx !== null && (
            <div 
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center transition-all duration-75"
              style={{ 
                left: `${(activeX / 500) * 100}%`, 
                top: `${(activeY / 150) * 100}%` 
              }}
            >
              <div 
                className="w-5 h-5 rounded-full bg-[#121212] border-[3.5px] border-white shadow-[0_0_10px_rgba(0,0,0,0.9)]"
              />
            </div>
          )}

          {/* Hover Tooltip */}
          {hoverIdx !== null && (
            <div 
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full pb-3 z-30"
              style={{ 
                left: `${Math.min(95, Math.max(5, (activeX / 500) * 100))}%`, 
                top: `${(activeY / 150) * 100}%` 
              }}
            >
              <div className="bg-[#242424] text-white text-xs py-1 px-2.5 rounded-md shadow-lg border border-gray-700 whitespace-nowrap font-medium">
                {activeTemp.toFixed(1)}°C
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
