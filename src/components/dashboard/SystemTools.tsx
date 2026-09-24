export default function SystemTools() {
  const tools = [
    { name: "System Update", icon: "↑" },
    { name: "Macro Key", icon: "⌨" },
    { name: "Power", icon: "🔋" },
    { name: "Audio", icon: "🎵" }
  ];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-light text-white mb-4">System Tools</h2>
      <div className="bg-[#1A233A] rounded-xl p-8 shadow-lg border border-gray-800">
        <div className="grid grid-cols-4 gap-4">
          {tools.map((tool, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center cursor-pointer group">
              <div className="w-16 h-16 rounded-full border-2 border-blue-500 flex items-center justify-center text-blue-500 text-2xl mb-3 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                {tool.icon}
              </div>
              <span className="text-sm text-gray-300 font-medium">{tool.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

