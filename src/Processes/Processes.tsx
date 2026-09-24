
export default function Processes() {
  const apps = [
    { name: 'Google Chrome (22)', icon: '🌐', cpu: '10.0%', mem: '1,812.5 MB', disk: '0.2 MB/s', net: '0.1 Mbps', active: true, leaf: false },
    { name: 'Messenger (2)', icon: '💬', cpu: '0.6%', mem: '106.5 MB', disk: '0 MB/s', net: '0 Mbps', active: false, leaf: false },
    { name: 'Microsoft Edge (15)', icon: '🌊', cpu: '0%', mem: '438.1 MB', disk: '0.1 MB/s', net: '0.1 Mbps', active: true, leaf: true },
    { name: 'Microsoft OneNote (32 bit) (2)', icon: '📓', cpu: '0%', mem: '30.0 MB', disk: '0 MB/s', net: '0 Mbps', active: false, leaf: false },
    { name: 'Notepad', icon: '📝', cpu: '0%', mem: '16.9 MB', disk: '0 MB/s', net: '0 Mbps', active: false, leaf: false },
    { name: 'Task Manager', icon: '📈', cpu: '1.5%', mem: '57.0 MB', disk: '0 MB/s', net: '0 Mbps', active: true, leaf: false },
  ];

  const backgroundApps = [
    { name: 'Antimalware Service Executable', icon: '🛡️', cpu: '0%', mem: '216.0 MB', disk: '0 MB/s', net: '0 Mbps' },
    { name: 'AnyDesk (32 bit)', icon: '🔴', cpu: '0%', mem: '19.5 MB', disk: '0 MB/s', net: '0 Mbps' },
    { name: 'Bonjour Service', icon: '🟦', cpu: '0%', mem: '1.8 MB', disk: '0 MB/s', net: '0 Mbps' },
    { name: 'COM Surrogate', icon: '⚙️', cpu: '0%', mem: '1.0 MB', disk: '0 MB/s', net: '0 Mbps' },
    { name: 'COM Surrogate', icon: '⚙️', cpu: '0%', mem: '3.0 MB', disk: '0 MB/s', net: '0 Mbps' },
    { name: 'COM Surrogate', icon: '⚙️', cpu: '0%', mem: '1.5 MB', disk: '0 MB/s', net: '0 Mbps' },
    { name: 'crashpad_handler.exe', icon: '⚙️', cpu: '0%', mem: '0.9 MB', disk: '0 MB/s', net: '0 Mbps' },
    { name: 'crashpad_handler.exe', icon: '⚙️', cpu: '0%', mem: '0.9 MB', disk: '0 MB/s', net: '0 Mbps' },
    { name: 'crashpad_handler.exe', icon: '⚙️', cpu: '0%', mem: '0.9 MB', disk: '0 MB/s', net: '0 Mbps' },
    { name: 'CTF Loader', icon: '⌨️', cpu: '0%', mem: '3.1 MB', disk: '0 MB/s', net: '0 Mbps' },
  ];

  const getHeatmapColor = (val: string, type: 'cpu'|'mem'|'disk') => {
    const num = parseFloat(val);
    if (num === 0) return 'transparent';
    if (type === 'cpu') {
      if (num > 5) return 'bg-teal-500/40 text-teal-100';
      if (num > 0) return 'bg-teal-500/20 text-teal-200';
    }
    if (type === 'mem') {
      if (num > 1000) return 'bg-teal-500/40 text-teal-100';
      if (num > 200) return 'bg-teal-500/20 text-teal-200';
    }
    if (type === 'disk') {
      if (num > 0) return 'bg-teal-500/40 text-teal-100';
    }
    return 'transparent';
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col p-6 bg-[#000000] text-gray-300">
      {/* Top Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Processes</h1>
        <div className="flex items-center gap-4 text-sm">
          <button className="flex items-center gap-2 hover:bg-[#1e1e1e] px-3 py-1.5 rounded-md transition-colors text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            Run new task
          </button>
          <button className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors px-2 py-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
            End task
          </button>
          <button className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors px-2 py-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Efficiency mode
          </button>
          <button className="flex items-center gap-2 hover:bg-[#1e1e1e] px-3 py-1.5 rounded-md transition-colors text-white">
            View <span className="text-[10px]">▼</span>
          </button>
        </div>
      </div>

      {/* Table Structure */}
      <div className="flex-1 bg-[#121212] rounded-lg border border-gray-800 flex flex-col overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-800 text-xs font-semibold">
          <div className="p-3 border-r border-gray-800 hover:bg-[#1e1e1e] cursor-pointer flex items-center justify-between">
            Name <span className="text-[10px] text-gray-500">^</span>
          </div>
          <div className="p-3 border-r border-gray-800 hover:bg-[#1e1e1e] cursor-pointer flex items-center justify-between">
            Status
          </div>
          <div className="p-3 border-r border-gray-800 hover:bg-[#1e1e1e] cursor-pointer flex flex-col items-end">
            <span className="text-gray-400">15%</span>
            <span className="text-gray-500">CPU</span>
          </div>
          <div className="p-3 border-r border-gray-800 hover:bg-[#1e1e1e] cursor-pointer flex flex-col items-end">
            <span className="text-gray-400">29%</span>
            <span className="text-gray-500">Memory</span>
          </div>
          <div className="p-3 border-r border-gray-800 hover:bg-[#1e1e1e] cursor-pointer flex flex-col items-end">
            <span className="text-gray-400">51%</span>
            <span className="text-gray-500">Disk</span>
          </div>
          <div className="p-3 hover:bg-[#1e1e1e] cursor-pointer flex flex-col items-end">
            <span className="text-gray-400">0%</span>
            <span className="text-gray-500">Network</span>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-y-auto flex-1">
          {/* Apps Group */}
          <div className="p-3 font-semibold text-sm bg-[#0a0a0a] sticky top-0 border-b border-gray-800">
            Apps (6)
          </div>
          {apps.map((app, i) => (
            <div key={i} className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-800/50 hover:bg-[#1e1e1e] text-sm group">
              <div className="p-2 border-r border-gray-800/50 flex items-center gap-3">
                <span className="text-gray-600 group-hover:text-gray-400 text-xs w-4 text-center cursor-pointer">&gt;</span>
                <span className="text-lg">{app.icon}</span>
                <span className="text-gray-200">{app.name}</span>
              </div>
              <div className="p-2 border-r border-gray-800/50 flex items-center justify-center">
                {app.leaf && <span className="text-green-500 text-xs" title="Efficiency mode">🍃</span>}
              </div>
              <div className={`p-2 border-r border-gray-800/50 text-right ${getHeatmapColor(app.cpu, 'cpu')}`}>
                {app.cpu}
              </div>
              <div className={`p-2 border-r border-gray-800/50 text-right ${getHeatmapColor(app.mem, 'mem')}`}>
                {app.mem}
              </div>
              <div className={`p-2 border-r border-gray-800/50 text-right ${getHeatmapColor(app.disk, 'disk')}`}>
                {app.disk}
              </div>
              <div className="p-2 text-right">
                {app.net}
              </div>
            </div>
          ))}

          {/* Background Processes Group */}
          <div className="p-3 font-semibold text-sm bg-[#0a0a0a] sticky top-0 border-b border-gray-800 mt-2">
            Background processes (84)
          </div>
          {backgroundApps.map((app, i) => (
            <div key={i} className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-800/50 hover:bg-[#1e1e1e] text-sm group">
              <div className="p-2 border-r border-gray-800/50 flex items-center gap-3">
                <span className="text-gray-600 group-hover:text-gray-400 text-xs w-4 text-center cursor-pointer">&gt;</span>
                <span className="text-lg opacity-70">{app.icon}</span>
                <span className="text-gray-400 group-hover:text-gray-300">{app.name}</span>
              </div>
              <div className="p-2 border-r border-gray-800/50"></div>
              <div className={`p-2 border-r border-gray-800/50 text-right ${getHeatmapColor(app.cpu, 'cpu')}`}>
                {app.cpu}
              </div>
              <div className={`p-2 border-r border-gray-800/50 text-right ${getHeatmapColor(app.mem, 'mem')}`}>
                {app.mem}
              </div>
              <div className={`p-2 border-r border-gray-800/50 text-right ${getHeatmapColor(app.disk, 'disk')}`}>
                {app.disk}
              </div>
              <div className="p-2 text-right text-gray-500">
                {app.net}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
