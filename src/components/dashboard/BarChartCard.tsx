export default function BarChartCard() {
  const bars = [
    { label: 'Mon', h: '40%' },
    { label: 'Tue', h: '55%' },
    { label: 'Wed', h: '30%', active: true },
    { label: 'Thu', h: '60%' },
    { label: 'Fri', h: '45%' },
    { label: 'Sat', h: '70%' },
    { label: 'Sun', h: '35%' },
  ];

  return (
    <div className="bg-[#121212] rounded-lg p-6 shadow-sm border border-gray-900 flex flex-col h-72">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-semibold text-lg">Power Draw</h3>
        <span className="text-gray-400 text-xs cursor-pointer">Last week ▾</span>
      </div>
      <div className="text-2xl font-bold text-white mb-6">43W</div>
      
      <div className="flex-1 flex items-end justify-between px-2">
        {bars.map((bar, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-1.5 h-24 bg-gray-800 rounded-full flex items-end">
              <div 
                className={`w-full rounded-full transition-all duration-500 ${bar.active ? 'bg-blue-500' : 'bg-gray-600'}`}
                style={{ height: bar.h }}
              ></div>
            </div>
            <span className={`text-[10px] ${bar.active ? 'text-white font-bold bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-500'}`}>
              {bar.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
