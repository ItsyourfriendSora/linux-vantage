import { useState } from 'react';

function ToggleRow({ label, hasSettings, active }: { label: string, hasSettings?: boolean, active?: boolean }) {
  const [isOn, setIsOn] = useState(active || false);
  return (
    <div className="flex justify-between items-center py-5 border-b border-gray-700/30 last:border-0">
      <span className="text-white font-medium text-sm">{label}</span>
      <div className="flex items-center gap-4">
        {hasSettings && (
          <button className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        )}
        <button 
          onClick={() => setIsOn(!isOn)}
          className={`w-10 h-[22px] rounded-full relative transition-colors duration-200 ${isOn ? 'bg-blue-500' : 'bg-[#4b5563]'}`}
        >
          <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[4px] transition-transform duration-200 ${isOn ? 'translate-x-[22px]' : 'translate-x-[4px]'}`} />
        </button>
      </div>
    </div>
  );
}

export default function ListCard() {
  return (
    <div className="bg-[#202736] rounded-3xl p-8 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-white font-bold text-lg mb-1">Thermal Mode</h3>
          <p className="text-gray-400 text-sm">Balance</p>
        </div>
        <div className="w-9 h-9 rounded-full border border-gray-400 flex items-center justify-center text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2a10 10 0 0 1 10 10"></path>
            <circle cx="12" cy="12" r="2"></circle>
            <line x1="12" y1="12" x2="16" y2="8"></line>
            <path d="M7 12h.01"></path>
            <path d="M17 12h.01"></path>
            <path d="M12 17h.01"></path>
            <path d="M12 7h.01"></path>
          </svg>
        </div>
      </div>

      <div className="flex-1 flex flex-col mt-2">
        <ToggleRow label="Network Boost" hasSettings={true} active={true} />
        <ToggleRow label="Auto Close" hasSettings={true} active={true} />
        <ToggleRow label="Hybrid Mode" active={true} />
        <ToggleRow label="Touchpad Lock" active={true} />
      </div>
    </div>
  );
}
