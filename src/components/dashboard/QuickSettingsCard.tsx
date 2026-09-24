import ToggleSwitch from "../ui/ToggleSwitch";

export default function QuickSettingsCard() {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-light text-white mb-4">Quick Settings</h2>
      <div className="bg-[#1A233A] rounded-xl p-6 shadow-lg border border-gray-800 flex flex-col gap-3">
        <ToggleSwitch label="Rapid Charge" />
        <ToggleSwitch label="WiFi Security" checked={true} hasSettingsIcon={true} />
      </div>
    </div>
  );
}

