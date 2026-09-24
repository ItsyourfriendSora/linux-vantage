import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number; // in bytes
  disk_read: number;
  disk_write: number;
}

export default function Processes() {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    const fetchProcesses = async () => {
      try {
        const data: ProcessInfo[] = await invoke('get_processes');
        setProcesses(data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchProcesses();
    interval = setInterval(fetchProcesses, 1500); // Fetch every 1.5 seconds

    return () => clearInterval(interval);
  }, []);

  const getHeatmapColor = (num: number, type: 'cpu'|'mem'|'disk'|'net') => {
    if (num === 0) return 'transparent';
    if (type === 'cpu') {
      if (num > 10) return 'bg-teal-500/40 text-teal-100';
      if (num > 2) return 'bg-teal-500/20 text-teal-200';
    }
    if (type === 'mem') { // Megabytes
      if (num > 500) return 'bg-teal-500/40 text-teal-100';
      if (num > 100) return 'bg-teal-500/20 text-teal-200';
    }
    if (type === 'disk') {
      if (num > 1) return 'bg-teal-500/40 text-teal-100'; // > 1 MB/s
    }
    if (type === 'net') {
      if (num > 1) return 'bg-teal-500/40 text-teal-100'; // > 1 Mbps
    }
    return 'transparent';
  };

  const formatMem = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };
  
  const formatDisk = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb < 0.1) return '0 MB/s';
    return `${mb.toFixed(1)} MB/s`;
  };

  const formatCPU = (val: number) => {
    if (val < 0.1) return '0%';
    return `${val.toFixed(1)}%`;
  };

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('chrome') || n.includes('brave') || n.includes('firefox') || n.includes('edge')) return '🌐';
    if (n.includes('discord') || n.includes('slack') || n.includes('messenger')) return '💬';
    if (n.includes('code') || n.includes('nvim') || n.includes('nano')) return '📝';
    if (n.includes('spotify') || n.includes('music')) return '🎵';
    if (n.includes('steam') || n.includes('game')) return '🎮';
    if (n.includes('system') || n.includes('daemon') || n.includes('service') || n.includes('dbus')) return '⚙️';
    return '⚙️'; // Default gear icon as requested
  };

  // Grouping
  const apps = processes.filter(p => p.cpu > 0.5 || p.memory > 50 * 1024 * 1024).slice(0, 15); 
  const bgApps = processes.filter(p => !apps.includes(p));

  const totalCpu = processes.reduce((acc, p) => acc + p.cpu, 0);
  const totalMem = processes.reduce((acc, p) => acc + p.memory, 0);
  
  // Assuming a rough scale for total percent
  const totalCpuPercent = Math.min(100, totalCpu / 8).toFixed(0); 
  const totalMemPercent = Math.min(100, (totalMem / (16 * 1024 * 1024 * 1024)) * 100).toFixed(0); // Assuming 16GB total roughly for the header indicator

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
            <span className="text-gray-400">{totalCpuPercent}%</span>
            <span className="text-gray-500">CPU</span>
          </div>
          <div className="p-3 border-r border-gray-800 hover:bg-[#1e1e1e] cursor-pointer flex flex-col items-end">
            <span className="text-gray-400">{totalMemPercent}%</span>
            <span className="text-gray-500">Memory</span>
          </div>
          <div className="p-3 border-r border-gray-800 hover:bg-[#1e1e1e] cursor-pointer flex flex-col items-end">
            <span className="text-gray-400">0%</span>
            <span className="text-gray-500">Disk</span>
          </div>
          <div className="p-3 hover:bg-[#1e1e1e] cursor-pointer flex flex-col items-end">
            <span className="text-gray-400">0%</span>
            <span className="text-gray-500">Network</span>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-y-auto flex-1 pb-10">
          
          {/* Apps Group */}
          <div className="p-3 font-semibold text-sm bg-[#0a0a0a] sticky top-0 border-b border-gray-800 z-10 shadow-sm">
            Apps ({apps.length})
          </div>
          {apps.map((app, i) => (
            <div key={`app-${app.pid}-${i}`} className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-800/50 hover:bg-[#1e1e1e] text-sm group">
              <div className="p-2 border-r border-gray-800/50 flex items-center gap-3 overflow-hidden whitespace-nowrap text-ellipsis">
                <span className="text-gray-600 group-hover:text-gray-400 text-xs w-4 text-center cursor-pointer flex-shrink-0">&gt;</span>
                <span className="text-lg flex-shrink-0">{getIcon(app.name)}</span>
                <span className="text-gray-200 truncate" title={app.name}>{app.name}</span>
              </div>
              <div className="p-2 border-r border-gray-800/50 flex items-center justify-center">
                 {/* Leaf icon omitted for now */}
              </div>
              <div className={`p-2 border-r border-gray-800/50 text-right ${getHeatmapColor(app.cpu, 'cpu')}`}>
                {formatCPU(app.cpu)}
              </div>
              <div className={`p-2 border-r border-gray-800/50 text-right ${getHeatmapColor(app.memory / (1024 * 1024), 'mem')}`}>
                {formatMem(app.memory)}
              </div>
              <div className={`p-2 border-r border-gray-800/50 text-right ${getHeatmapColor(app.disk_read / (1024 * 1024), 'disk')}`}>
                {formatDisk(app.disk_read + app.disk_write)}
              </div>
              <div className="p-2 text-right">
                0 Mbps
              </div>
            </div>
          ))}

          {/* Background Processes Group */}
          <div className="p-3 font-semibold text-sm bg-[#0a0a0a] sticky top-0 border-b border-gray-800 mt-2 z-10 shadow-sm">
            Background processes ({bgApps.length})
          </div>
          {bgApps.map((app, i) => (
            <div key={`bg-${app.pid}-${i}`} className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-800/50 hover:bg-[#1e1e1e] text-sm group">
              <div className="p-2 border-r border-gray-800/50 flex items-center gap-3 overflow-hidden whitespace-nowrap text-ellipsis">
                <span className="text-gray-600 group-hover:text-gray-400 text-xs w-4 text-center cursor-pointer flex-shrink-0">&gt;</span>
                <span className="text-lg opacity-70 flex-shrink-0">{getIcon(app.name)}</span>
                <span className="text-gray-400 group-hover:text-gray-300 truncate" title={app.name}>{app.name}</span>
              </div>
              <div className="p-2 border-r border-gray-800/50"></div>
              <div className={`p-2 border-r border-gray-800/50 text-right ${getHeatmapColor(app.cpu, 'cpu')}`}>
                {formatCPU(app.cpu)}
              </div>
              <div className={`p-2 border-r border-gray-800/50 text-right ${getHeatmapColor(app.memory / (1024 * 1024), 'mem')}`}>
                {formatMem(app.memory)}
              </div>
              <div className={`p-2 border-r border-gray-800/50 text-right ${getHeatmapColor(app.disk_read / (1024 * 1024), 'disk')}`}>
                {formatDisk(app.disk_read + app.disk_write)}
              </div>
              <div className="p-2 text-right text-gray-500">
                0 Mbps
              </div>
            </div>
          ))}
          
        </div>
      </div>
    </div>
  );
}
