import { useEffect, useState, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AppIcon } from '../components/AppIcon';

interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number; // in bytes
  disk_read: number;
  disk_write: number;
}

interface ProcessGroup {
  name: string;
  key: string;
  category: 'apps' | 'bg';
  cpu: number;
  memory: number;
  disk_read: number;
  disk_write: number;
  processes: ProcessInfo[];
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
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
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


  // Filtered by search if user is searching
  const filtered = useMemo(() => {
    if (!search.trim()) return processes;
    const q = search.toLowerCase();
    return processes.filter(p => p.name.toLowerCase().includes(q) || p.pid.toString().includes(q));
  }, [processes, search]);

  // Group processes by executable name within each category (Apps vs Background)
  const { appsGroups, bgAppsGroups, rawAppsCount, rawBgAppsCount } = useMemo(() => {
    const appMap = new Map<string, ProcessGroup>();
    const bgMap = new Map<string, ProcessGroup>();
    let aCount = 0;
    let bCount = 0;

    filtered.forEach(p => {
      const isBg = isBackgroundProcess(p.name);
      const targetMap = isBg ? bgMap : appMap;
      const category = isBg ? 'bg' : 'apps';
      const key = `${category}-${p.name.toLowerCase()}`;

      if (isBg) {
        bCount++;
      } else {
        aCount++;
      }

      let group = targetMap.get(key);
      if (!group) {
        group = {
          name: p.name,
          key,
          category,
          cpu: 0,
          memory: 0,
          disk_read: 0,
          disk_write: 0,
          processes: [],
        };
        targetMap.set(key, group);
      }

      group.cpu += p.cpu;
      group.memory += p.memory;
      group.disk_read += p.disk_read;
      group.disk_write += p.disk_write;
      group.processes.push(p);
    });

    const sortFn = (a: ProcessGroup, b: ProcessGroup) => {
      const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      return sortAsc ? cmp : -cmp;
    };

    const apps = Array.from(appMap.values()).sort(sortFn);
    const bgApps = Array.from(bgMap.values()).sort(sortFn);

    // Keep child processes inside each group sorted deterministically by PID
    apps.forEach(g => g.processes.sort((a, b) => a.pid - b.pid));
    bgApps.forEach(g => g.processes.sort((a, b) => a.pid - b.pid));

    return {
      appsGroups: apps,
      bgAppsGroups: bgApps,
      rawAppsCount: aCount,
      rawBgAppsCount: bCount,
    };
  }, [filtered, sortAsc]);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const isGroupExpanded = (key: string) => {
    if (search.trim().length > 0) return true; // auto-expand to show matches when searching
    return expandedGroups.has(key);
  };

  const allMultiGroups = useMemo(() => {
    return [...appsGroups, ...bgAppsGroups].filter(g => g.processes.length > 1);
  }, [appsGroups, bgAppsGroups]);

  const allExpanded = allMultiGroups.length > 0 && allMultiGroups.every(g => expandedGroups.has(g.key));

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedGroups(new Set());
    } else {
      const next = new Set<string>();
      allMultiGroups.forEach(g => next.add(g.key));
      setExpandedGroups(next);
    }
  };

  // Find currently selected group or process for action button
  const currentSelectedGroup = useMemo(() => {
    if (!selectedGroupKey) return null;
    return [...appsGroups, ...bgAppsGroups].find(g => g.key === selectedGroupKey) || null;
  }, [selectedGroupKey, appsGroups, bgAppsGroups]);

  const handleEndTask = async () => {
    if (selectedPid !== null) {
      try {
        await invoke('kill_process', { pid: selectedPid });
        setProcesses(prev => prev.filter(p => p.pid !== selectedPid));
        setSelectedPid(null);
      } catch (err) {
        console.error("Failed to end task:", err);
      }
    } else if (currentSelectedGroup !== null) {
      const pids = currentSelectedGroup.processes.map(p => p.pid);
      try {
        await Promise.allSettled(pids.map(pid => invoke('kill_process', { pid })));
        setProcesses(prev => prev.filter(p => !pids.includes(p.pid)));
        setSelectedGroupKey(null);
      } catch (err) {
        console.error("Failed to end group processes:", err);
      }
    }
  };

  const getEndTaskButtonLabel = () => {
    if (selectedPid !== null) {
      return `End task (PID ${selectedPid})`;
    }
    if (currentSelectedGroup !== null) {
      const count = currentSelectedGroup.processes.length;
      return `End task (${currentSelectedGroup.name}${count > 1 ? ` · ${count}` : ''})`;
    }
    return 'End task';
  };

  const isEndTaskActive = selectedPid !== null || currentSelectedGroup !== null;

  const totalCpu = processes.reduce((acc, p) => acc + p.cpu, 0);
  const totalMem = processes.reduce((acc, p) => acc + p.memory, 0);
  
  const totalCpuPercent = Math.min(100, Math.round(totalCpu / 8)); 
  const totalMemPercent = Math.min(100, Math.round((totalMem / (16 * 1024 * 1024 * 1024)) * 100));

  const renderGroupRows = (groups: ProcessGroup[]) => {
    return groups.map(group => {
      const isExpanded = isGroupExpanded(group.key);
      const hasMultiple = group.processes.length > 1;
      const isGroupSelected = selectedGroupKey === group.key;

      return (
        <div key={group.key} className="flex flex-col">
          {/* Main Parent / Group Row */}
          <div 
            onClick={() => {
              if (hasMultiple) {
                setSelectedGroupKey(prev => prev === group.key ? null : group.key);
                setSelectedPid(null);
              } else {
                const singlePid = group.processes[0]?.pid;
                setSelectedPid(prev => prev === singlePid ? null : singlePid);
                setSelectedGroupKey(null);
              }
            }}
            onDoubleClick={() => {
              if (hasMultiple) {
                toggleGroup(group.key);
              }
            }}
            className={`grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-800/50 text-sm cursor-pointer transition-colors group select-none ${
              isGroupSelected || (group.processes.length === 1 && selectedPid === group.processes[0]?.pid)
                ? 'bg-blue-600/20 border-l-4 border-l-blue-500' 
                : 'hover:bg-[#1a1a1a]'
            }`}
          >
            <div className="p-2 border-r border-gray-800/50 flex items-center gap-2 min-w-0">
              {/* Expand / Collapse Arrow Button */}
              {hasMultiple ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGroup(group.key);
                  }}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-700/60 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                  title={isExpanded ? "Collapse group" : "Expand group"}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="13" 
                    height="13" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-90 text-blue-400' : 'rotate-0 text-gray-500 group-hover:text-gray-300'}`}
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              ) : (
                <span className="w-5 h-5 flex-shrink-0" />
              )}

              {/* Icon */}
              <AppIcon name={group.name} size={20} className="w-5 h-5 flex-shrink-0" />

              {/* Group Name */}
              <span 
                className={`truncate font-medium ${
                  isGroupSelected ? 'text-blue-300' : 'text-gray-200'
                }`} 
                title={group.name}
              >
                {group.name}
              </span>

              {/* Instance Count Badge or Single PID */}
              {hasMultiple ? (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#1e2330] text-blue-300 border border-blue-500/30 flex-shrink-0 ml-1">
                  {group.processes.length}
                </span>
              ) : (
                <span className="text-[10px] text-gray-600 ml-1 flex-shrink-0">
                  PID {group.processes[0]?.pid}
                </span>
              )}
            </div>

            <div className="p-2 border-r border-gray-800/50 flex items-center justify-center text-xs text-gray-500">
              Running
            </div>
            <div className={`p-2 border-r border-gray-800/50 text-right font-mono text-xs flex items-center justify-end ${getHeatmapColor(group.cpu, 'cpu')}`}>
              {formatCPU(group.cpu)}
            </div>
            <div className={`p-2 border-r border-gray-800/50 text-right font-mono text-xs flex items-center justify-end ${getHeatmapColor(group.memory / (1024 * 1024), 'mem')}`}>
              {formatMem(group.memory)}
            </div>
            <div className={`p-2 border-r border-gray-800/50 text-right font-mono text-xs flex items-center justify-end ${getHeatmapColor(group.disk_read / (1024 * 1024), 'disk')}`}>
              {formatDisk(group.disk_read + group.disk_write)}
            </div>
            <div className="p-2 text-right font-mono text-xs text-gray-500 flex items-center justify-end">
              0 Mbps
            </div>
          </div>

          {/* Child Processes (Rendered when expanded) */}
          {hasMultiple && isExpanded && (
            <div className="flex flex-col bg-[#0d0d0d]/80 border-b border-gray-800/60">
              {group.processes.map((child, idx) => {
                const isChildSelected = selectedPid === child.pid;
                const isLast = idx === group.processes.length - 1;

                return (
                  <div
                    key={`child-${child.pid}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPid(prev => prev === child.pid ? null : child.pid);
                      setSelectedGroupKey(null);
                    }}
                    className={`grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-800/30 text-sm cursor-pointer transition-colors select-none ${
                      isChildSelected
                        ? 'bg-blue-600/25 border-l-4 border-l-blue-400'
                        : 'hover:bg-[#1a1a1a]/90'
                    }`}
                  >
                    <div className="p-2 border-r border-gray-800/40 flex items-center gap-2 pl-9 min-w-0">
                      <span className="text-gray-600 text-xs font-mono flex-shrink-0 select-none">
                        {isLast ? '└─' : '├─'}
                      </span>
                      <AppIcon name={group.name} size={14} className="w-3.5 h-3.5 flex-shrink-0 opacity-75" />
                      <span className="text-xs text-gray-400 font-medium truncate">
                        {group.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161b26] text-blue-400 border border-blue-500/20 flex-shrink-0">
                        PID {child.pid}
                      </span>
                    </div>
                    <div className="p-2 border-r border-gray-800/40 flex items-center justify-center text-xs text-gray-500">
                      Running
                    </div>
                    <div className={`p-2 border-r border-gray-800/40 text-right font-mono text-xs flex items-center justify-end ${getHeatmapColor(child.cpu, 'cpu')}`}>
                      {formatCPU(child.cpu)}
                    </div>
                    <div className={`p-2 border-r border-gray-800/40 text-right font-mono text-xs flex items-center justify-end ${getHeatmapColor(child.memory / (1024 * 1024), 'mem')}`}>
                      {formatMem(child.memory)}
                    </div>
                    <div className={`p-2 border-r border-gray-800/40 text-right font-mono text-xs flex items-center justify-end ${getHeatmapColor(child.disk_read / (1024 * 1024), 'disk')}`}>
                      {formatDisk(child.disk_read + child.disk_write)}
                    </div>
                    <div className="p-2 text-right font-mono text-xs text-gray-500 flex items-center justify-end">
                      0 Mbps
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 w-full h-full min-h-0 flex flex-col p-6 bg-[#000000] text-gray-300 overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
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
            disabled={!isEndTaskActive}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-xs font-medium ${
              isEndTaskActive
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 cursor-pointer shadow-sm' 
                : 'text-gray-600 border border-gray-800/50 cursor-not-allowed opacity-40'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
            {getEndTaskButtonLabel()}
          </button>
          
          {allMultiGroups.length > 0 && (
            <button
              onClick={toggleExpandAll}
              className="flex items-center gap-1.5 hover:bg-[#1e1e1e] border border-gray-800 px-3 py-1.5 rounded-md transition-colors text-gray-300 hover:text-white text-xs"
              title="Expand or collapse all multi-process groups"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {allExpanded ? (
                  <>
                    <polyline points="4 14 12 6 20 14"></polyline>
                    <polyline points="4 18 12 10 20 18"></polyline>
                  </>
                ) : (
                  <>
                    <polyline points="4 6 12 14 20 6"></polyline>
                    <polyline points="4 10 12 18 20 10"></polyline>
                  </>
                )}
              </svg>
              {allExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          )}

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
      <div className="flex-1 min-h-0 bg-[#121212] rounded-lg border border-gray-800 flex flex-col overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] border-b border-gray-800 text-xs font-semibold select-none flex-shrink-0 bg-[#121212]">
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
        <div className="overflow-y-auto flex-1 min-h-0 pb-10 overscroll-contain">
          
          {/* Apps Group */}
          {appsGroups.length > 0 && (
            <>
              <div className="p-3 font-semibold text-sm bg-[#0a0a0a] sticky top-0 border-b border-gray-800 z-10 shadow-sm flex items-center justify-between">
                <span>Apps ({appsGroups.length})</span>
                <span className="text-xs font-normal text-gray-500">
                  {rawAppsCount} total processes
                </span>
              </div>
              {renderGroupRows(appsGroups)}
            </>
          )}

          {/* Background Processes Group */}
          {bgAppsGroups.length > 0 && (
            <>
              <div className="p-3 font-semibold text-sm bg-[#0a0a0a] sticky top-0 border-b border-gray-800 mt-2 z-10 shadow-sm flex items-center justify-between">
                <span>Background processes ({bgAppsGroups.length})</span>
                <span className="text-xs font-normal text-gray-500">
                  {rawBgAppsCount} total processes
                </span>
              </div>
              {renderGroupRows(bgAppsGroups)}
            </>
          )}

          {appsGroups.length === 0 && bgAppsGroups.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">
              No matching processes found
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

