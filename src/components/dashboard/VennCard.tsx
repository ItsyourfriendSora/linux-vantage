export default function VennCard() {
  return (
    <div className="bg-[#121212] rounded-3xl p-6 shadow-sm border border-gray-900 flex flex-col h-72">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-semibold text-lg">System Health</h3>
        <span className="text-gray-400 text-xs cursor-pointer">Show more ▾</span>
      </div>
      
      <div className="flex-1 flex items-center justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 opacity-60"></div>
            <span className="text-xs text-gray-300">Memory</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-60"></div>
            <span className="text-xs text-gray-300">Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400 opacity-60"></div>
            <span className="text-xs text-gray-300">Network</span>
          </div>
        </div>

        <div className="relative w-40 h-40 mr-4">
          <div className="absolute top-0 left-4 w-24 h-24 rounded-full border border-gray-600 bg-yellow-400/10 flex items-center justify-center">
            <span className="text-white font-bold ml-[-10px] mt-[-10px]">22%</span>
          </div>
          <div className="absolute top-4 right-0 w-28 h-28 rounded-full border border-gray-600 bg-blue-500/10 flex items-center justify-center">
             <span className="text-white font-bold text-xl ml-4">68%</span>
          </div>
          <div className="absolute bottom-0 left-8 w-20 h-20 rounded-full border border-gray-600 bg-red-400/10 flex items-center justify-center">
             <span className="text-white font-bold text-sm mt-4">10%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
