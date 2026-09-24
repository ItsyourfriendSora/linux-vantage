export default function Navbar() {
  return (
    <nav className="w-full bg-[#1A233A] text-white flex justify-between items-center h-12 shadow-sm relative z-20">
      <div className="flex items-center h-full">
        {/* Lenovo L logo box */}
        <div className="w-12 h-full bg-[#3DB7D6] flex items-center justify-center font-bold text-xl">
          L
        </div>
      </div>
      
      <div className="flex items-center h-full">
        <div className="flex h-full">
          <div className="w-24 flex items-center justify-center bg-blue-500 cursor-pointer text-sm font-medium">
            Device
          </div>
          <div className="w-24 flex items-center justify-center cursor-pointer hover:bg-gray-800 text-sm font-medium gap-1 text-gray-300">
            Security <span className="text-[9px] mt-0.5">▼</span>
          </div>
          <div className="w-24 flex items-center justify-center cursor-pointer hover:bg-gray-800 text-sm font-medium gap-1 text-gray-300 relative">
            Support <span className="text-[9px] mt-0.5">▼</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
