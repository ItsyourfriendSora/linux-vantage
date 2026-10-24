import { useState } from 'react';

interface ControlItemProps {
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  hasSettings?: boolean;
  active?: boolean;
}

function ControlItem({ label, subtitle, icon, iconBg, hasSettings, active }: ControlItemProps) {
  const [isOn, setIsOn] = useState(active || false);

  return (
    <div className="bg-[#18181b]/80 hover:bg-[#1f1f23] border border-gray-800/80 hover:border-gray-700/80 rounded-lg py-3 px-4 flex items-center justify-between transition-all duration-200 group shadow-sm">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-200 ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <h4 className="text-white font-semibold text-sm truncate tracking-tight">{label}</h4>
          <p className="text-gray-400 text-xs truncate mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0 ml-3">
        {hasSettings && (
          <button 
            type="button" 
            title={`Settings for ${label}`}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        )}
        <button 
          type="button"
          onClick={() => setIsOn(!isOn)}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm ${
            isOn 
              ? 'bg-[#6366f1] text-white hover:bg-[#5558e6] shadow-[0_2px_8px_rgba(99,102,241,0.35)]' 
              : 'bg-[#27272a] text-gray-400 hover:bg-[#323238] hover:text-gray-200 border border-gray-700/50'
          }`}
        >
          {isOn && <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
          {isOn ? 'On' : 'Off'}
        </button>
      </div>
    </div>
  );
}

export default function ListCard() {
  const modes = ['Quiet', 'Balance', 'Performance'];
  const [modeIdx, setModeIdx] = useState(1);

  const cycleMode = () => {
    setModeIdx((prev) => (prev + 1) % modes.length);
  };

  const getModeColor = () => {
    if (modes[modeIdx] === 'Performance') {
      return {
        bg: 'bg-red-500/15 text-red-400',
        btn: 'bg-red-500 hover:bg-red-600 text-white shadow-[0_2px_8px_rgba(239,68,68,0.35)]',
      };
    }
    if (modes[modeIdx] === 'Quiet') {
      return {
        bg: 'bg-emerald-500/15 text-emerald-400',
        btn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)]',
      };
    }
    return {
      bg: 'bg-blue-500/15 text-blue-400',
      btn: 'bg-[#6366f1] hover:bg-[#5558e6] text-white shadow-[0_2px_8px_rgba(99,102,241,0.35)]',
    };
  };

  const modeTheme = getModeColor();

  return (
    <div className="bg-[#121212] rounded-lg p-5 sm:p-6 shadow-sm border border-gray-900 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-5">
        <h3 className="text-white font-semibold text-lg tracking-tight">System Controls</h3>
      </div>

      {/* Cards List with slightly more breathing room */}
      <div className="flex flex-col gap-3.5 sm:gap-4">
        
        {/* Thermal Mode Card */}
        <div className="bg-[#18181b]/80 hover:bg-[#1f1f23] border border-gray-800/80 hover:border-gray-700/80 rounded-lg py-3 px-4 flex items-center justify-between transition-all duration-200 group shadow-sm">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-200 ${modeTheme.bg}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a10 10 0 0 1 10 10"></path>
                <circle cx="12" cy="12" r="2"></circle>
                <line x1="12" y1="12" x2="16" y2="8"></line>
              </svg>
            </div>
            <div className="min-w-0">
              <h4 className="text-white font-semibold text-sm truncate tracking-tight">Thermal Mode</h4>
              <p className="text-gray-400 text-xs truncate mt-0.5">Mode: <span className="text-white font-medium">{modes[modeIdx]}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <button 
              type="button"
              onClick={cycleMode}
              title="Switch Thermal Mode"
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm ${modeTheme.btn}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m17 2 4 4-4 4"/>
                <path d="M3 11v-1a4 4 0 0 1 4-4h14"/>
                <path d="m7 22-4-4 4-4"/>
                <path d="M21 13v1a4 4 0 0 1-4 4H3"/>
              </svg>
              {modes[modeIdx]}
            </button>
          </div>
        </div>

        {/* Network Boost Card */}
        <ControlItem 
          label="Network Boost"
          subtitle="Gaming traffic priority"
          hasSettings={true}
          active={true}
          iconBg="bg-indigo-500/15 text-indigo-400"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
          }
        />

        {/* Auto Close Card */}
        <ControlItem 
          label="Auto Close"
          subtitle="Free idle background RAM"
          hasSettings={true}
          active={true}
          iconBg="bg-purple-500/15 text-purple-400"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          }
        />

        {/* Hybrid Mode Card */}
        <ControlItem 
          label="Hybrid Mode"
          subtitle="Dynamic iGPU / dGPU"
          active={true}
          iconBg="bg-teal-500/15 text-teal-400"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2"></rect>
              <rect x="9" y="9" width="6" height="6"></rect>
              <line x1="9" y1="1" x2="9" y2="4"></line>
              <line x1="15" y1="1" x2="15" y2="4"></line>
              <line x1="9" y1="20" x2="9" y2="23"></line>
              <line x1="15" y1="20" x2="15" y2="23"></line>
              <line x1="20" y1="9" x2="23" y2="9"></line>
              <line x1="20" y1="14" x2="23" y2="14"></line>
              <line x1="1" y1="9" x2="4" y2="9"></line>
              <line x1="1" y1="14" x2="4" y2="14"></line>
            </svg>
          }
        />

        {/* Touchpad Lock Card */}
        <ControlItem 
          label="Touchpad Lock"
          subtitle="Lock trackpad while typing"
          active={false}
          iconBg="bg-rose-500/15 text-rose-400"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="4"></rect>
              <line x1="12" y1="12" x2="12" y2="22"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          }
        />

      </div>
    </div>
  );
}
