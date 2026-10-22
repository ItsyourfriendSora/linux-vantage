import { useEffect, useState, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number; // in bytes
  disk_read: number;
  disk_write: number;
}

const BACKGROUND_PROCESS_NAMES = new Set([
  'svchost.exe', 'conhost.exe', 'dllhost.exe', 'system', 'services.exe', 'lsass.exe',
  'smss.exe', 'wininit.exe', 'csrss.exe', 'winlogon.exe', 'taskhostw.exe', 'sihost.exe',
  'explorer.exe', 'searchindexer.exe', 'fontdrvhost.exe', 'runtimebroker.exe',
  'dwm.exe', 'spoolsv.exe', 'audiodg.exe', 'wlanext.exe', 'wmiprvse.exe', 'registry',
  'securityhealthservice.exe', 'shellexperiencehost.exe', 'startmenuexperiencehost.exe',
  'ctfmon.exe', 'smartscreen.exe', 'searchhost.exe', 'lockapp.exe', 'aggregatorhost.exe',
  'dashost.exe', 'lsaiso.exe', 'sedsvc.exe', 'securityhealthsystray.exe',
  'system idle process', 'memory compression'
]);

const isBackgroundProcess = (name: string): boolean => {
  const lower = name.toLowerCase();
  if (BACKGROUND_PROCESS_NAMES.has(lower)) return true;
  if (lower.endsWith('service.exe') || lower.endsWith('svc.exe') || lower.endsWith('daemon.exe')) return true;
  return false;
};

export default function Processes() {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    const fetchProcesses = async () => {
      try {
        const data: ProcessInfo[] = await invoke('get_processes');
        setProcesses(prev => {
          if (prev.length === 0) {
            return data;
          }
          
          const dataMap = new Map<number, ProcessInfo>();
          data.forEach(p => dataMap.set(p.pid, p));

          // Retain existing processes in their EXACT current positions, updating metrics in-place
          const updated = prev
            .filter(p => dataMap.has(p.pid)) // remove terminated processes
            .map(p => dataMap.get(p.pid)!);  // update stats in-place

          // Check if any new processes were spawned
          const prevPidSet = new Set(prev.map(p => p.pid));
          const newProcesses = data.filter(p => !prevPidSet.has(p.pid));

          if (newProcesses.length === 0) {
            return updated;
          }

          // Combine with newly spawned processes, keeping stable alphabetical order
          const combined = [...updated, ...newProcesses];
          combined.sort((a, b) => {
            const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
            return cmp !== 0 ? cmp : a.pid - b.pid;
          });
          return combined;
        });
      } catch (e) {
        console.error(e);
      }
    };

    fetchProcesses();
    interval = setInterval(fetchProcesses, 1500); // Fetch every 1.5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleEndTask = async () => {
    if (selectedPid === null) return;
    try {
      await invoke('kill_process', { pid: selectedPid });
      setProcesses(prev => prev.filter(p => p.pid !== selectedPid));
      setSelectedPid(null);
    } catch (err) {
      console.error("Failed to end task:", err);
    }
  };

  const getHeatmapColor = (num: number, type: 'cpu'|'mem'|'disk'|'net') => {
    if (num === 0) return 'transparent';
    if (type === 'cpu') {
      if (num > 15) return 'bg-teal-500/40 text-teal-100';
      if (num > 3) return 'bg-teal-500/20 text-teal-200';
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
    if (n.includes('code') || n.includes('nvim') || n.includes('nano') || n.includes('antigravity')) return '📝';
    if (n.includes('spotify') || n.includes('music')) return '🎵';
    if (n.includes('steam') || n.includes('game') || n.includes('roblox')) return '🎮';
    return '⚙️';
  };

  // Filtered by search if user is searching
  const filtered = useMemo(() => {
    if (!search.trim()) return processes;
    const q = search.toLowerCase();
    return processes.filter(p => p.name.toLowerCase().includes(q) || p.pid.toString().includes(q));
  }, [processes, search]);

  // Stable grouping: category NEVER changes based on momentary CPU usage
  const { apps, bgApps } = useMemo(() => {
    const a: ProcessInfo[] = [];
    const b: ProcessInfo[] = [];

    filtered.forEach(p => {
      if (isBackgroundProcess(p.name)) {
        b.push(p);
      } else {
        a.push(p);
      }
    });

    if (!sortAsc) {
      a.reverse();
      b.reverse();
    }

    return { apps: a, bgApps: b };
  }, [filtered, sortAsc]);

  const totalCpu = processes.reduce((acc, p) => acc + p.cpu, 0);
  const totalMem = processes.reduce((acc, p) => acc + p.memory, 0);
  
  const totalCpuPercent = Math.min(100, Math.round(totalCpu / 8)); 
  const totalMemPercent = Math.min(100, Math.round((totalMem / (16 * 1024 * 1024 * 1024)) * 100));

  return (
    <div className="flex-1 w-full h-full flex flex-col p-6 bg-[#000000] text-gray-300">
      {/* Top Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-white">Processes</h1>
          <input
            type="text"
            placeholder="Search processes (Name or PID)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#121212] border border-gray-800 text-xs text-white rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500 placeholder-gray-500 w-64"
          />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button 
            onClick={handleEndTask}
            disabled={selectedPid === null}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-xs font-medium ${
              selectedPid !== null 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 cursor-pointer shadow-sm' 
                : 'text-gray-600 border border-gray-800/50 cursor-not-allowed opacity-40'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
            End task {selectedPid !== null ? `(PID ${selectedPid})` : ''}
          </button>
          <button 
            onClick={() => setSortAsc(prev => !prev)}
            className="flex items-center gap-2 hover:bg-[#1e1e1e] border border-gray-800 px-3 py-1.5 rounded-md transition-colors text-white text-xs"
            title="Toggle Name Sort Order"
          >
            Sort: Name {sortAsc ? 'A-Z ↑' : 'Z-A ↓'}
          </button>
        </div>
      </div>

      {/* Table Structure */}
      <div className="flex-1 bg-[#121212] rounded-lg border border-gray-800 flex flex-col overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-800 text-xs font-semibold select-none">
          <div 
            onClick={() => setSortAsc(prev => !prev)}
            className="p-3 border-r border-gray-800 hover:bg-[#1e1e1e] cursor-pointer flex items-center justify-between"
          >
            <span>Name</span>
            <span className="text-[10px] text-blue-400 font-bold">{sortAsc ? '▲ A-Z' : '▼ Z-A'}</span>
          </div>
          <div className="p-3 border-r border-gray-800 flex items-center justify-between">
            Status
          </div>
          <div className="p-3 border-r border-gray-800 flex flex-col items-end">
            <span className="text-gray-400">{totalCpuPercent}%</span>
            <span className="text-gray-500">CPU</span>
          </div>
          <div className="p-3 border-r border-gray-800 flex flex-col items-end">
            <span className="text-gray-400">{totalMemPercent}%</span>
            <span className="text-gray-500">Memory</span>
          </div>
          <div className="p-3 border-r border-gray-800 flex flex-col items-end">
            <span className="text-gray-400">0%</span>
            <span className="text-gray-500">Disk</span>
          </div>
          <div className="p-3 flex flex-col items-end">
            <span className="text-gray-400">0%</span>
            <span className="text-gray-500">Network</span>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-y-auto flex-1 pb-10">
          
          {/* Apps Group */}
          {apps.length > 0 && (
            <>
              <div className="p-3 font-semibold text-sm bg-[#0a0a0a] sticky top-0 border-b border-gray-800 z-10 shadow-sm flex items-center justify-between">
                <span>Apps ({apps.length})</span>
                <span className="text-xs font-normal text-gray-500">Positions fixed in alphabetical order</span>
              </div>
              {apps.map((app) => {
                const isSelected = selectedPid === app.pid;
                return (
                  <div 
                    key={`proc-${app.pid}`} 
                    onClick={() => setSelectedPid(prev => prev === app.pid ? null : app.pid)}
                    className={`grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-800/50 text-sm cursor-pointer transition-colors group ${
                      isSelected 
                        ? 'bg-blue-600/20 border-l-4 border-l-blue-500 border-r-0' 
                        : 'hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <div className="p-2 border-r border-gray-800/50 flex items-center gap-3 overflow-hidden whitespace-nowrap text-ellipsis">
                      <span className="text-gray-600 group-hover:text-gray-400 text-xs w-4 text-center flex-shrink-0">&gt;</span>
                      <span className="text-lg flex-shrink-0">{getIcon(app.name)}</span>
                      <span className={`truncate font-medium ${isSelected ? 'text-blue-300' : 'text-gray-200'}`} title={app.name}>
                        {app.name}
                      </span>
                      <span className="text-[10px] text-gray-600 ml-1">PID {app.pid}</span>
                    </div>
                    <div className="p-2 border-r border-gray-800/50 flex items-center justify-center text-xs text-gray-500">
                      Running
                    </div>
                    <div className={`p-2 border-r border-gray-800/50 text-right font-mono text-xs flex items-center justify-end ${getHeatmapColor(app.cpu, 'cpu')}`}>
                      {formatCPU(app.cpu)}
                    </div>
                    <div className={`p-2 border-r border-gray-800/50 text-right font-mono text-xs flex items-center justify-end ${getHeatmapColor(app.memory / (1024 * 1024), 'mem')}`}>
                      {formatMem(app.memory)}
                    </div>
                    <div className={`p-2 border-r border-gray-800/50 text-right font-mono text-xs flex items-center justify-end ${getHeatmapColor(app.disk_read / (1024 * 1024), 'disk')}`}>
                      {formatDisk(app.disk_read + app.disk_write)}
                    </div>
                    <div className="p-2 text-right font-mono text-xs text-gray-500 flex items-center justify-end">
                      0 Mbps
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Background Processes Group */}
          {bgApps.length > 0 && (
            <>
              <div className="p-3 font-semibold text-sm bg-[#0a0a0a] sticky top-0 border-b border-gray-800 mt-2 z-10 shadow-sm flex items-center justify-between">
                <span>Background processes ({bgApps.length})</span>
              </div>
              {bgApps.map((app) => {
                const isSelected = selectedPid === app.pid;
                return (
                  <div 
                    key={`proc-${app.pid}`} 
                    onClick={() => setSelectedPid(prev => prev === app.pid ? null : app.pid)}
                    className={`grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-800/50 text-sm cursor-pointer transition-colors group ${
                      isSelected 
                        ? 'bg-blue-600/20 border-l-4 border-l-blue-500 border-r-0' 
                        : 'hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <div className="p-2 border-r border-gray-800/50 flex items-center gap-3 overflow-hidden whitespace-nowrap text-ellipsis">
                      <span className="text-gray-600 group-hover:text-gray-400 text-xs w-4 text-center flex-shrink-0">&gt;</span>
                      <span className="text-lg opacity-70 flex-shrink-0">{getIcon(app.name)}</span>
                      <span className={`truncate ${isSelected ? 'text-blue-300' : 'text-gray-400 group-hover:text-gray-300'}`} title={app.name}>
                        {app.name}
                      </span>
                      <span className="text-[10px] text-gray-600 ml-1">PID {app.pid}</span>
                    </div>
                    <div className="p-2 border-r border-gray-800/50 flex items-center justify-center text-xs text-gray-500">
                      Running
                    </div>
                    <div className={`p-2 border-r border-gray-800/50 text-right font-mono text-xs flex items-center justify-end ${getHeatmapColor(app.cpu, 'cpu')}`}>
                      {formatCPU(app.cpu)}
                    </div>
                    <div className={`p-2 border-r border-gray-800/50 text-right font-mono text-xs flex items-center justify-end ${getHeatmapColor(app.memory / (1024 * 1024), 'mem')}`}>
                      {formatMem(app.memory)}
                    </div>
                    <div className={`p-2 border-r border-gray-800/50 text-right font-mono text-xs flex items-center justify-end ${getHeatmapColor(app.disk_read / (1024 * 1024), 'disk')}`}>
                      {formatDisk(app.disk_read + app.disk_write)}
                    </div>
                    <div className="p-2 text-right font-mono text-xs text-gray-500 flex items-center justify-end">
                      0 Mbps
                    </div>
                  </div>
                );
              })}
            </>
          )}
          
        </div>
      </div>
    </div>
  );
}
