import ToggleSwitch from "../ui/ToggleSwitch";

export default function LegionEdgeCard() {
  return (
    <div className="bg-[#1A233A] rounded-xl p-6 shadow-lg h-full border border-gray-800">
      <div className="mb-6 flex justify-between items-center bg-[#111827] p-3 rounded-lg border border-gray-800">
        <div>
          <div className="text-sm font-semibold text-white">Thermal Mode</div>
          <div className="text-xs text-gray-500">Balance</div>
        </div>
        <div className="text-gray-400">
          {/* Simple speed/thermal icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <circle cx="12" cy="12" r="10"></circle>
             <circle cx="12" cy="12" r="6"></circle>
             <circle cx="12" cy="12" r="2"></circle>
          </svg>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <ToggleSwitch label="Network Boost" hasSettingsIcon={true} />
        <ToggleSwitch label="Auto Close" hasSettingsIcon={true} />
        <ToggleSwitch label="Hybrid Mode" />
        <ToggleSwitch label="Touchpad Lock" />
      </div>
    </div>
  );
}

