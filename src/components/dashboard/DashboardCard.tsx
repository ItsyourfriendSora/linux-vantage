export default function DashboardCard() {
  return (
    <div className="bg-[#1A233A] rounded-xl p-6 shadow-lg border border-gray-800 relative">
      <div className="absolute top-4 right-6 text-blue-500 font-bold text-sm tracking-wider cursor-pointer hover:text-blue-400">
        INFO →
      </div>
      
      <div className="flex gap-4 mt-6">
        {/* CPU / GPU / VRAM Section */}
        <div className="flex-1 bg-[#111827] rounded-lg p-6 flex justify-between items-center border border-gray-800">
          
          {/* GPU Bar */}
          <div className="flex flex-col items-center gap-2">
            <div className="h-24 w-4 bg-gray-800 rounded-full overflow-hidden relative">
              <div className="absolute bottom-0 w-full h-[40%] bg-green-500"></div>
              {/* Segments overlay */}
              <div className="absolute inset-0 flex flex-col justify-between py-1">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="w-full h-px bg-gray-900"></div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-300 text-sm font-bold">GPU</div>
              <div className="text-gray-500 text-[10px]">1.43/2.10GHz</div>
            </div>
          </div>

          {/* CPU Dial */}
          <div className="flex flex-col items-center relative">
            {/* Outer segmented ring (simplified visualization) */}
            <div className="w-40 h-40 rounded-full border-[12px] border-gray-800 relative flex items-center justify-center">
              <div className="absolute inset-[-12px] rounded-full border-[12px] border-blue-500" style={{ clipPath: 'polygon(0 0, 70% 0, 70% 100%, 0 100%)' }}></div>
              <div className="text-center">
                <div className="text-3xl font-light text-white">CPU</div>
                <div className="text-gray-500 text-xs mt-1">4.05/4.45GHz</div>
              </div>
            </div>
          </div>

          {/* VRAM Bar */}
          <div className="flex flex-col items-center gap-2">
            <div className="h-24 w-4 bg-gray-800 rounded-full overflow-hidden relative">
              <div className="absolute bottom-0 w-full h-[15%] bg-purple-500"></div>
              <div className="absolute inset-0 flex flex-col justify-between py-1">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="w-full h-px bg-gray-900"></div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-300 text-sm font-bold">VRAM</div>
              <div className="text-gray-500 text-[10px]">0.81/7.00GHz</div>
            </div>
          </div>

        </div>

        {/* SSD Section */}
        <div className="w-48 bg-[#111827] rounded-lg p-6 flex flex-col items-center justify-center border border-gray-800">
          <div className="w-24 h-24 rounded-full border-[8px] border-gray-800 relative flex items-center justify-center mb-4">
             <div className="absolute inset-[-8px] rounded-full border-[8px] border-blue-500" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0 60%)' }}></div>
             <span className="text-xl text-blue-400 font-medium">56%</span>
          </div>
          <div className="text-center">
            <div className="text-gray-300 text-sm font-bold flex items-center justify-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M2 2h9v9H2zm11 0h9v9h-9zm0 11h9v9h-9zM2 13h9v9H2z"/></svg>
              SSD
            </div>
            <div className="text-gray-500 text-[10px]">531GB/953GB</div>
          </div>
        </div>
      </div>
    </div>
  );
}

