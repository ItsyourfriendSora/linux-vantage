import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface SystemPerformance {
  cpu_usage: number;
  cpu_name: string;
  cpu_frequency: number;
  cpu_cores: number;
  total_memory: number;
  used_memory: number;
  uptime: number;
}

export default function Performance() {
  const [perf, setPerf] = useState<SystemPerformance | null>(null);
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(60).fill(0));
  const [memHistory, setMemHistory] = useState<number[]>(Array(60).fill(0));
  const [selectedTab, setSelectedTab] = useState('CPU');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    const fetchPerf = async () => {
      try {
        const data: SystemPerformance = await invoke('get_system_performance');
        setPerf(data);
        
        setCpuHistory(prev => {
          const next = [...prev, data.cpu_usage];
          if (next.length > 60) next.shift();
          return next;
        });

        setMemHistory(prev => {
          const next = [...prev, data.used_memory];
          if (next.length > 60) next.shift();
          return next;
        });
      } catch (e) {
        console.error(e);
      }
    };

    fetchPerf();
    interval = setInterval(fetchPerf, 1000); // Fetch every second

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}:${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `0:${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatGHz = (mhz: number) => {
    return (mhz / 1000).toFixed(2) + ' GHz';
  };
  
  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  

  // SVG Chart rendering settings
  const chartHeight = 200;
  const chartWidth = 800; // Will scale via SVG viewBox

  // CPU Chart
  const cpuPoints = cpuHistory.map((val, idx) => {
    const x = (idx / 59) * chartWidth;
    const y = chartHeight - ((val / 100) * chartHeight);
    return `${x},${y}`;
  }).join(' ');
  const cpuAreaPoints = `0,${chartHeight} ${cpuPoints} ${chartWidth},${chartHeight}`;

  // Mem Chart
  const maxMem = perf ? perf.total_memory : 1;
  const memPoints = memHistory.map((val, idx) => {
    const x = (idx / 59) * chartWidth;
    const y = chartHeight - ((val / maxMem) * chartHeight);
    return `${x},${y}`;
  }).join(' ');
  const memAreaPoints = `0,${chartHeight} ${memPoints} ${chartWidth},${chartHeight}`;

  return (
    <div className="flex-1 w-full h-full flex flex-col p-6 bg-[#000000] text-gray-300">
      {/* Top Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Performance</h1>
        <div className="flex items-center gap-4 text-sm">
          <button className="flex items-center gap-2 hover:bg-[#1e1e1e] px-3 py-1.5 rounded-md transition-colors text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            Run new task
          </button>
          <button className="flex items-center gap-2 hover:bg-[#1e1e1e] px-2 py-1.5 rounded-md transition-colors text-white">
            <span className="text-xl leading-none -mt-1">...</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* Left Sidebar */}
        <div className="w-64 flex flex-col gap-1 overflow-y-auto pr-2">
          
          <div onClick={() => setSelectedTab('CPU')} className={`p-3 rounded-lg flex gap-3 cursor-pointer border ${selectedTab === 'CPU' ? 'bg-[#1e1e1e] border-gray-700' : 'border-transparent hover:bg-[#121212]'}`}>
            <div className="w-16 h-12 bg-[#121212] border border-gray-800 rounded relative overflow-hidden flex-shrink-0">
               <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full opacity-60">
                 <polyline points={cpuHistory.map((v, i) => `${(i/59)*100},${40 - (v/100)*40}`).join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2" />
               </svg>
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-semibold text-white text-sm">CPU</span>
              <span className="text-xs text-gray-400">{perf ? perf.cpu_usage.toFixed(0) : 0}% {perf ? formatGHz(perf.cpu_frequency) : '0 GHz'}</span>
            </div>
          </div>

          <div onClick={() => setSelectedTab('Memory')} className={`p-3 rounded-lg flex gap-3 cursor-pointer border ${selectedTab === 'Memory' ? 'bg-[#1e1e1e] border-gray-700' : 'border-transparent hover:bg-[#121212]'}`}>
            <div className="w-16 h-12 bg-[#121212] border border-gray-800 rounded relative flex-shrink-0 p-1">
               <div className="w-full h-full border border-purple-500/30 flex items-end">
                 <div className="w-full bg-purple-500/20 border-t border-purple-500" style={{ height: perf ? `${(perf.used_memory / perf.total_memory)*100}%` : '0%' }}></div>
               </div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-semibold text-white text-sm">Memory</span>
              <span className="text-xs text-gray-400">
                {perf ? formatBytes(perf.used_memory) : '0 GB'}/{perf ? formatBytes(perf.total_memory) : '0 GB'}
              </span>
            </div>
          </div>
          
          <div className="p-3 rounded-lg flex gap-3 cursor-pointer border border-transparent hover:bg-[#121212]">
            <div className="w-16 h-12 bg-[#121212] border border-gray-800 rounded flex-shrink-0 p-2 flex items-end">
               <div className="w-full border-b-2 border-teal-500"></div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-semibold text-white text-sm">Disk 0 (D: C:)</span>
              <span className="text-xs text-gray-400">SSD<br/>1%</span>
            </div>
          </div>
          
          <div className="p-3 rounded-lg flex gap-3 cursor-pointer border border-transparent hover:bg-[#121212]">
            <div className="w-16 h-12 bg-[#121212] border border-gray-800 rounded flex-shrink-0 flex items-end justify-center p-2">
               <div className="w-1/2 border-b-2 border-gray-500 border-dashed"></div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-semibold text-white text-sm">Wi-Fi</span>
              <span className="text-xs text-gray-400">Wi-Fi<br/>S: 0 R: 0 Kbps</span>
            </div>
          </div>
          
          <div className="p-3 rounded-lg flex gap-3 cursor-pointer border border-transparent hover:bg-[#121212]">
            <div className="w-16 h-12 bg-[#121212] border border-gray-800 rounded flex-shrink-0"></div>
            <div className="flex flex-col justify-center">
              <span className="font-semibold text-white text-sm">GPU 0</span>
              <span className="text-xs text-gray-400">Intel(R) HD Graphi...<br/>0%</span>
            </div>
          </div>

        </div>

        {/* Right Pane */}
        <div className="flex-1 bg-[#0a0a0a] rounded-lg border border-gray-800 p-6 flex flex-col relative overflow-y-auto">
          
          {selectedTab === 'CPU' && (
            <>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-semibold text-white">CPU</h2>
                <div className="text-right text-gray-300 font-semibold">{perf?.cpu_name || 'Loading CPU Info...'}</div>
              </div>

              <div className="text-sm text-gray-400 mb-2">% Utilization</div>
              
              <div className="w-full h-[250px] bg-[#121212] border border-gray-800 rounded-lg relative overflow-hidden flex flex-col justify-between mb-2">
                <div className="absolute inset-0 grid grid-rows-4 grid-cols-6 opacity-20 pointer-events-none border-t border-l border-gray-700">
                   {Array(24).fill(0).map((_, i) => (
                     <div key={`cgrid-${i}`} className="border-r border-b border-gray-700"></div>
                   ))}
                </div>
                
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                  <polygon points={cpuAreaPoints} fill="rgba(59, 130, 246, 0.1)" />
                  <polyline points={cpuPoints} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mb-8">
                <span>60 seconds</span>
                <span>0</span>
              </div>

              <div className="grid grid-cols-2 gap-8 text-sm">
                <div className="grid grid-cols-3 gap-6 gap-y-4">
                  <div className="flex flex-col">
                    <span className="text-gray-400">Utilization</span>
                    <span className="text-2xl font-semibold text-white">{perf?.cpu_usage.toFixed(0)}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400">Speed</span>
                    <span className="text-2xl font-semibold text-white">{perf ? formatGHz(perf.cpu_frequency) : '0 GHz'}</span>
                  </div>
                  <div></div>
                  
                  <div className="flex flex-col">
                    <span className="text-gray-400">Processes</span>
                    <span className="text-xl font-semibold text-white">151</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400">Threads</span>
                    <span className="text-xl font-semibold text-white">1543</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400">Handles</span>
                    <span className="text-xl font-semibold text-white">61915</span>
                  </div>
                  
                  <div className="flex flex-col col-span-3 mt-2">
                    <span className="text-gray-400">Up time</span>
                    <span className="text-2xl font-semibold text-white">{perf ? formatUptime(perf.uptime) : '0:00:00:00'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-gray-300">
                  <div className="text-gray-500">Base speed:</div>
                  <div>{perf ? formatGHz(perf.cpu_frequency) : '0 GHz'}</div>
                  
                  <div className="text-gray-500">Sockets:</div>
                  <div>1</div>
                  
                  <div className="text-gray-500">Cores:</div>
                  <div>{perf ? Math.max(1, Math.floor(perf.cpu_cores / 2)) : 0}</div>
                  
                  <div className="text-gray-500">Logical processors:</div>
                  <div>{perf?.cpu_cores || 0}</div>
                  
                  <div className="text-gray-500">Virtualization:</div>
                  <div>Enabled</div>
                  
                  <div className="text-gray-500 mt-2">L1 cache:</div>
                  <div className="mt-2">128 KB</div>
                  
                  <div className="text-gray-500">L2 cache:</div>
                  <div>512 KB</div>
                  
                  <div className="text-gray-500">L3 cache:</div>
                  <div>3.0 MB</div>
                </div>
              </div>
            </>
          )}

          {selectedTab === 'Memory' && (
            <>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-semibold text-white">Memory</h2>
                <div className="text-right text-gray-300 font-semibold flex flex-col">
                  <span>{perf ? formatBytes(perf.total_memory) : '0 GB'}</span>
                  <span className="text-gray-500 text-sm font-normal">{perf ? formatBytes(perf.total_memory - (200*1024*1024)) : '0 GB'}</span>
                </div>
              </div>

              <div className="text-sm text-gray-400 mb-2">Memory usage</div>
              
              {/* Big Chart for Memory */}
              <div className="w-full h-[250px] bg-[#121212] border border-gray-800 rounded-lg relative overflow-hidden flex flex-col justify-between mb-2">
                <div className="absolute inset-0 grid grid-rows-4 grid-cols-6 opacity-20 pointer-events-none border-t border-l border-gray-700">
                   {Array(24).fill(0).map((_, i) => (
                     <div key={`mgrid-${i}`} className="border-r border-b border-gray-700"></div>
                   ))}
                </div>
                
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                  <polygon points={memAreaPoints} fill="rgba(168, 85, 247, 0.1)" />
                  <polyline points={memPoints} fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mb-4">
                <span>60 seconds</span>
                <span>0</span>
              </div>

              {/* Memory composition bar */}
              <div className="text-xs text-gray-400 mb-1">Memory composition</div>
              <div className="w-full h-6 bg-[#121212] border border-gray-800 flex items-center mb-8 rounded overflow-hidden p-0.5 gap-0.5">
                 <div className="h-full bg-purple-500/80 rounded-sm" style={{ width: perf ? `${(perf.used_memory / perf.total_memory) * 100}%` : '50%' }}></div>
                 <div className="h-full bg-gray-500/30 rounded-sm flex-1"></div>
              </div>

              {/* Stats Grid for Memory */}
              <div className="grid grid-cols-2 gap-8 text-sm">
                
                <div className="grid grid-cols-2 gap-6 gap-y-4">
                  <div className="flex flex-col">
                    <span className="text-gray-400">In use (Compressed)</span>
                    <span className="text-xl font-semibold text-white">{perf ? formatBytes(perf.used_memory) : '0 GB'} (0 MB)</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400">Available</span>
                    <span className="text-xl font-semibold text-white">{perf ? formatBytes(perf.total_memory - perf.used_memory) : '0 GB'}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-gray-400">Committed</span>
                    <span className="text-xl font-semibold text-white">
                       {perf ? formatBytes(perf.used_memory + (1.5 * 1024 * 1024 * 1024)) : '0 GB'}/{perf ? formatBytes(perf.total_memory + (4 * 1024 * 1024 * 1024)) : '0 GB'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400">Cached</span>
                    <span className="text-xl font-semibold text-white">{perf ? formatBytes(perf.used_memory * 0.3) : '0 GB'}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-400">Paged pool</span>
                    <span className="text-xl font-semibold text-white">482 MB</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400">Non-paged pool</span>
                    <span className="text-xl font-semibold text-white">248 MB</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-gray-300">
                  <div className="text-gray-500">Speed:</div>
                  <div>2400 MHz</div>
                  
                  <div className="text-gray-500">Slots used:</div>
                  <div>2 of 4</div>
                  
                  <div className="text-gray-500">Form factor:</div>
                  <div>DIMM</div>
                  
                  <div className="text-gray-500">Hardware reserved:</div>
                  <div>56.8 MB</div>
                </div>

              </div>
            </>
          )}

          {selectedTab !== 'CPU' && selectedTab !== 'Memory' && (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
               {selectedTab} detailed view is under construction...
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
