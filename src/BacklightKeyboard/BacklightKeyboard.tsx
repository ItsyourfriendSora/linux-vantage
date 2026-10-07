import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function BacklightKeyboard() {
  const [activeColor, setActiveColor] = useState('#3b82f6');
  const [brightness, setBrightness] = useState(80);
  const [effect, setEffect] = useState('Static');

  const handleColorChange = async (color: string) => {
    setActiveColor(color);
    try {
      await invoke('set_keyboard_color', { hexColor: color });
      console.log('Color sent to OpenRGB');
    } catch (e) {
      console.error('Failed to set physical keyboard color:', e);
    }
  };

  const presetColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#ffffff'
  ];

  const effects = [
    'Static', 'Breathing', 'Color Cycle', 'Wave', 'Ripple', 'Reactive'
  ];

  return (
    <div className="w-full h-full p-8 flex flex-col bg-[#000000] text-gray-300 overflow-y-auto">
      <div className="max-w-[1000px] mx-auto w-full">
        {/* Header & Device Info */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">Backlight Keyboard</h1>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Device Detected: <span className="text-white font-medium"> Mechanical Keyboard</span>
            </p>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2 bg-[#121212] px-3 py-1.5 rounded-full border border-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            Powered by OpenRGB Protocol
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Color Selection */}
          <div className="lg:col-span-2 bg-[#121212] rounded-2xl p-6 shadow-sm border border-gray-900">
            <h2 className="text-white font-medium mb-6">Color Selection</h2>
            
            <div className="flex items-center gap-8 mb-8">
              {/* Keyboard Preview Visual */}
              <div className="w-48 h-32 rounded-xl bg-[#0a0a0a] border border-gray-800 flex items-center justify-center relative p-4 shadow-inner">
                <svg width="100%" height="100%" viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  
                  {/* Keyboard Base */}
                  <rect x="10" y="10" width="380" height="130" rx="8" fill="#1e1e1e" stroke="#333" strokeWidth="2" />
                  
                  {/* Keys - Grouped to apply glow */}
                  <g filter="url(#glow)">
                    {/* Top Row (Function keys) */}
                    {[...Array(14)].map((_, i) => (
                      <rect key={`row1-${i}`} x={20 + i * 26} y="20" width="22" height="15" rx="3" fill="#2a2a2a" stroke={activeColor} strokeWidth="1.5" />
                    ))}
                    {/* Row 2 (Numbers) */}
                    {[...Array(14)].map((_, i) => (
                      <rect key={`row2-${i}`} x={20 + i * 26} y="40" width="22" height="20" rx="3" fill="#2a2a2a" stroke={activeColor} strokeWidth="1.5" />
                    ))}
                    {/* Row 3 */}
                    {[...Array(14)].map((_, i) => (
                      <rect key={`row3-${i}`} x={25 + i * 26} y="65" width="22" height="20" rx="3" fill="#2a2a2a" stroke={activeColor} strokeWidth="1.5" />
                    ))}
                    {/* Row 4 */}
                    {[...Array(13)].map((_, i) => (
                      <rect key={`row4-${i}`} x={30 + i * 26} y="90" width="22" height="20" rx="3" fill="#2a2a2a" stroke={activeColor} strokeWidth="1.5" />
                    ))}
                    {/* Spacebar Row */}
                    <rect x="20" y="115" width="30" height="20" rx="3" fill="#2a2a2a" stroke={activeColor} strokeWidth="1.5" />
                    <rect x="55" y="115" width="25" height="20" rx="3" fill="#2a2a2a" stroke={activeColor} strokeWidth="1.5" />
                    <rect x="85" y="115" width="25" height="20" rx="3" fill="#2a2a2a" stroke={activeColor} strokeWidth="1.5" />
                    <rect x="115" y="115" width="130" height="20" rx="3" fill="#2a2a2a" stroke={activeColor} strokeWidth="1.5" /> {/* Spacebar */}
                    <rect x="250" y="115" width="25" height="20" rx="3" fill="#2a2a2a" stroke={activeColor} strokeWidth="1.5" />
                    <rect x="280" y="115" width="25" height="20" rx="3" fill="#2a2a2a" stroke={activeColor} strokeWidth="1.5" />
                    <rect x="310" y="115" width="25" height="20" rx="3" fill="#2a2a2a" stroke={activeColor} strokeWidth="1.5" />
                    <rect x="340" y="115" width="40" height="20" rx="3" fill="#2a2a2a" stroke={activeColor} strokeWidth="1.5" />
                  </g>
                </svg>
              </div>

              {/* Preset Colors */}
              <div className="flex-1">
                <h3 className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">Presets</h3>
                <div className="flex flex-wrap gap-3">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${activeColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121212]' : ''}`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Color (Hex) */}
            <div>
              <h3 className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">Custom Color</h3>
              <div className="flex gap-4">
                <input 
                  type="color" 
                  value={activeColor} 
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-12 h-10 rounded bg-[#1e1e1e] border-0 cursor-pointer p-0" 
                />
                <input 
                  type="text" 
                  value={activeColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="bg-[#1e1e1e] border border-gray-800 rounded-lg px-4 text-white font-mono text-sm w-32 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Effects & Settings */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#121212] rounded-2xl p-6 shadow-sm border border-gray-900 flex-1">
              <h2 className="text-white font-medium mb-6">Lighting Effects</h2>
              <div className="flex flex-col gap-2">
                {effects.map((eff) => (
                  <button
                    key={eff}
                    onClick={() => setEffect(eff)}
                    className={`text-left px-4 py-3 rounded-xl text-sm transition-colors ${effect === eff ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:bg-[#1e1e1e] border border-transparent'}`}
                  >
                    {eff}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sliders (Bottom row spanning full width) */}
          <div className="lg:col-span-3 bg-[#121212] rounded-2xl p-6 shadow-sm border border-gray-900">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-medium">Brightness</h2>
              <span className="text-blue-400 font-semibold">{brightness}%</span>
            </div>
            <div className="flex items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M6.34 17.66l-1.41 1.41"></path><path d="M19.07 4.93l-1.41 1.41"></path></svg>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-2 bg-[#1e1e1e] rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
