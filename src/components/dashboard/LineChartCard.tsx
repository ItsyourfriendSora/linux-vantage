export default function LineChartCard() {
  return (
    <div className="bg-[#121212] rounded-3xl p-6 shadow-sm border border-gray-900 w-full">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-white font-semibold text-lg">System Temperature</h3>
        <select className="bg-transparent text-gray-400 text-sm outline-none cursor-pointer border-none">
          <option>Last 7 days</option>
          <option>Last 24 hours</option>
        </select>
      </div>
      
      {/* Fake Line Chart mimicking the smooth curve */}
      <div className="w-full h-40 relative">
        <svg viewBox="0 0 500 150" className="w-full h-full preserve-3d" preserveAspectRatio="none">
           <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path 
            d="M 0 100 C 50 100, 100 120, 150 90 C 200 60, 220 20, 250 20 C 280 20, 320 80, 380 80 C 440 80, 480 120, 500 130 L 500 150 L 0 150 Z" 
            fill="url(#lineGrad)" 
          />
          <path 
            d="M 0 100 C 50 100, 100 120, 150 90 C 200 60, 220 20, 250 20 C 280 20, 320 80, 380 80 C 440 80, 480 120, 500 130" 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="4" 
            strokeLinecap="round" 
            className="drop-shadow-lg"
          />
          <circle cx="250" cy="20" r="6" fill="#121212" stroke="#3b82f6" strokeWidth="3" />
        </svg>
      </div>

      <div className="flex justify-between items-center mt-4 text-xs text-gray-500 px-2">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>
    </div>
  );
}
