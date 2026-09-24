export default function ListCard() {
  const processes = [
    { name: 'System Updater', type: 'Background', time: '12:00PM' },
    { name: 'Game Optimization', type: 'Active', time: '12:00PM' },
    { name: 'Network Monitor', type: 'Background', time: '12:00PM' },
    { name: 'Thermal Control', type: 'Active', time: '12:00PM' },
    { name: 'Audio Enhancement', type: 'Background', time: '12:00PM' },
  ];

  return (
    <div className="bg-[#121212] rounded-3xl p-8 shadow-sm border border-gray-900 h-full flex flex-col">

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
        {processes.map((proc, i) => (
          <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-800/50 rounded-xl transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <div>
                <div className="text-white text-sm font-bold">{proc.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{proc.type}</span>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {proc.time}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white">
                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
              <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white">
                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
