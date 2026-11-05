import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import VirusThreatProtection from './VirusThreatProtection';
import VpnLocationModal, { VpnLocation, VPN_LOCATIONS } from './VpnLocationModal';

export default function AntiVirus() {
  const [currentView, setCurrentView] = useState<'overview' | 'virus_threat'>('overview');

  // VPN State
  const [isVpnOn, setIsVpnOn] = useState<boolean>(() => {
    return localStorage.getItem('nexora_vpn_enabled') === 'true';
  });
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [activePublicIp, setActivePublicIp] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<VpnLocation>(() => {
    const saved = localStorage.getItem('nexora_vpn_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return VPN_LOCATIONS[1]; // Default Singapore
  });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showVpnMenu, setShowVpnMenu] = useState(false);
  const [killSwitch, setKillSwitch] = useState<boolean>(() => {
    return localStorage.getItem('nexora_vpn_killswitch') === 'true';
  });

  useEffect(() => {
    invoke('get_vpn_proxy_status')
      .then((res: any) => {
        if (res && res.enabled) {
          setIsVpnOn(true);
        }
      })
      .catch((err) => {
        console.debug('Failed to get vpn status:', err);
      });
  }, []);

  const handleToggleVpn = async () => {
    setConnectionError(null);
    if (isVpnOn) {
      setIsConnecting(true);
      try {
        await invoke('disconnect_vpn_proxy');
        setIsVpnOn(false);
        setActivePublicIp(null);
        localStorage.setItem('nexora_vpn_enabled', 'false');
      } catch (err) {
        console.error('Failed to disconnect VPN:', err);
        setIsVpnOn(false);
      } finally {
        setIsConnecting(false);
      }
    } else {
      setIsConnecting(true);
      try {
        const res: any = await invoke('connect_vpn_proxy', {
          country: selectedLocation.countryCode,
          proxy: null,
        });
        if (res && res.success) {
          setIsVpnOn(true);
          setActivePublicIp(res.ip || null);
          setConnectionError(null);
          localStorage.setItem('nexora_vpn_enabled', 'true');
        } else {
          setIsVpnOn(false);
          setActivePublicIp(null);
          setConnectionError(res?.error || 'Could not connect to proxy server. Please retry.');
          localStorage.setItem('nexora_vpn_enabled', 'false');
        }
      } catch (err: any) {
        console.error('Failed to connect VPN proxy:', err);
        setIsVpnOn(false);
        setActivePublicIp(null);
        setConnectionError(typeof err === 'string' ? err : 'Connection failed. Please retry.');
        localStorage.setItem('nexora_vpn_enabled', 'false');
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const handleSelectLocation = async (location: VpnLocation) => {
    setConnectionError(null);
    setSelectedLocation(location);
    localStorage.setItem('nexora_vpn_location', JSON.stringify(location));
    setIsPickerOpen(false);

    // Otomatis nyala saat dipilih
    setIsConnecting(true);
    try {
      const res: any = await invoke('connect_vpn_proxy', {
        country: location.countryCode,
        proxy: null,
      });
      if (res && res.success) {
        setIsVpnOn(true);
        setActivePublicIp(res.ip || null);
        setConnectionError(null);
        localStorage.setItem('nexora_vpn_enabled', 'true');
      } else {
        setIsVpnOn(false);
        setActivePublicIp(null);
        setConnectionError(res?.error || `Could not find an active server for ${location.country}.`);
        localStorage.setItem('nexora_vpn_enabled', 'false');
      }
    } catch (err: any) {
      console.error('Failed to connect VPN proxy:', err);
      setIsVpnOn(false);
      setActivePublicIp(null);
      setConnectionError(typeof err === 'string' ? err : 'Connection failed. Please retry.');
      localStorage.setItem('nexora_vpn_enabled', 'false');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleToggleKillSwitch = () => {
    const nextVal = !killSwitch;
    setKillSwitch(nextVal);
    localStorage.setItem('nexora_vpn_killswitch', String(nextVal));
  };

  if (currentView === 'virus_threat') {
    return <VirusThreatProtection onBack={() => setCurrentView('overview')} />;
  }
  const cards = [
    {
      title: 'Virus & threat protection',
      subtitle: 'No action needed.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      hasCheck: true,
    },
    {
      title: 'Real Time Protection',
      subtitle: 'No action needed.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      hasCheck: true,
    },
    {
      title: 'Firewall & network protection',
      subtitle: 'No action needed.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h.01"></path>
          <path d="M2 8.82a15 15 0 0 1 20 0"></path>
          <path d="M5 12.86a10 10 0 0 1 14 0"></path>
          <path d="M8.5 16.43a5 5 0 0 1 7 0"></path>
        </svg>
      ),
      hasCheck: true,
    },
    {
      title: 'App & browser control',
      subtitle: 'No action needed.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <path d="M3 9h18"></path>
        </svg>
      ),
      hasCheck: true,
    },
    {
      title: 'Device security',
      subtitle: 'View status and manage hardware security features.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      ),
      hasCheck: true,
    },
    {
      title: 'Device performance & health',
      subtitle: 'No action needed.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
      ),
      hasCheck: false,
    },
    {
      title: 'Family Protection',
      subtitle: 'Manage how your family uses their devices.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      hasCheck: false,
    },
    {
      title: 'Protection history',
      subtitle: 'View latest protection actions and recommendations.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
      hasCheck: false,
    }
  ];

  return (
    <div className="w-full h-full p-8 flex flex-col bg-[#000000] text-gray-300 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto w-full">
        <h1 className="text-2xl font-semibold text-white mb-8">Security</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              onClick={() => {
                if (card.title === 'Virus & threat protection') {
                  setCurrentView('virus_threat');
                }
              }}
              className="bg-[#121212] rounded-lg p-6 shadow-sm border border-gray-900 flex flex-col justify-start min-h-[160px] cursor-pointer hover:bg-[#1a1a1a] transition-colors"
            >
              <div className="mb-4 relative w-fit">
                {card.icon}
                {card.hasCheck && (
                  <div className="absolute -bottom-1 -right-1 bg-[#121212] rounded-full p-[2px]">
                    <div className="bg-green-500 rounded-full w-4 h-4 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <h3 className="text-white font-semibold text-base mb-1">{card.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{card.subtitle}</p>
            </div>
          ))}
        </div>

        {/* VPN Section */}
        <div className="mt-10">
          <h2 className="text-[11px] font-bold text-gray-400 tracking-wider mb-4 uppercase">Online Privacy</h2>
          <div className="bg-[#121212] rounded-lg p-6 shadow-sm border border-gray-900 w-full min-h-[260px] flex flex-col md:flex-row justify-between relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6 relative z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                isConnecting
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : isVpnOn
                  ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                {isConnecting ? (
                  <svg className="animate-spin h-6 w-6 text-blue-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                ) : isVpnOn ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                  </svg>
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white font-bold text-lg">VPN</h3>
                  {isVpnOn && !isConnecting && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Active
                    </span>
                  )}
                </div>

                <p className="text-gray-400 text-sm mb-4">
                  {isConnecting ? (
                    <span className="text-blue-400 font-medium flex items-center gap-1.5">
                      Connecting to {selectedLocation.city}...
                    </span>
                  ) : isVpnOn ? (
                    <span>
                      Your connection is <span className="text-emerald-400 font-semibold">Protected</span>
                    </span>
                  ) : (
                    <span>
                      Your connection is <span className="text-red-500 font-medium">Public</span>
                    </span>
                  )}
                </p>

                {connectionError && (
                  <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 mb-4 max-w-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{connectionError}</span>
                  </div>
                )}

                {/* Country selector pill */}
                <div
                  onClick={() => setIsPickerOpen(true)}
                  className="flex items-center gap-5 bg-[#1a1a1a] hover:bg-[#222222] border border-gray-800 hover:border-gray-700 rounded-full px-4 py-2 w-fit mb-4 cursor-pointer transition-all duration-200 group select-none shadow-sm"
                  title="Click to change location"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center text-sm shadow-sm bg-gray-800">
                      {selectedLocation.flag}
                    </div>
                    <span className="text-white text-sm font-medium">{selectedLocation.city}, {selectedLocation.countryCode}</span>
                  </div>
                  <button
                    type="button"
                    className="text-blue-500 text-sm font-bold group-hover:text-blue-400 transition-colors flex items-center gap-1"
                  >
                    <span>Change</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:opacity-100 transition-opacity">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                </div> 

                {/* Private & Public IP Display */}
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs font-semibold">Private IP:</span>
                    {isConnecting ? (
                      <span className="text-blue-400 text-xs font-mono font-medium animate-pulse">
                        Assigning IP...
                      </span>
                    ) : isVpnOn ? (
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 text-xs font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 shadow-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          {selectedLocation.privateIp}
                        </span>
                        <span className="text-gray-500 text-[11px] font-mono">
                          ({selectedLocation.ping} ms)
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs font-semibold">-</span>
                    )}
                  </div>

                  {isVpnOn && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400 text-xs font-semibold">Public IP:</span>
                      <span className="text-blue-400 font-mono font-semibold bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                        {activePublicIp || selectedLocation.city}
                      </span>
                      <span className="text-gray-400 text-[11px] flex items-center gap-1">
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">Routing System &amp; Chrome</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between relative z-10 mt-6 md:mt-0">
              <div className="flex items-center gap-4 relative">
                {/* Interactive Toggle Switch */}
                <div
                  onClick={handleToggleVpn}
                  className={`relative flex items-center rounded-full p-1 w-24 h-9 cursor-pointer transition-colors duration-300 select-none shadow-inner ${
                    isVpnOn
                      ? 'bg-blue-600 hover:bg-blue-500 border border-blue-400/30'
                      : 'bg-gray-800 hover:bg-gray-700 border border-gray-700/40'
                  }`}
                  title={isVpnOn ? 'Turn VPN Off' : 'Turn VPN On'}
                >
                  <div
                    className={`absolute w-7 h-7 rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
                      isVpnOn
                        ? 'left-[calc(100%-2rem)] bg-white'
                        : 'left-1 bg-gray-400'
                    }`}
                  >
                    {isConnecting && (
                      <svg className="animate-spin h-3.5 w-3.5 text-blue-600" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm font-bold transition-all duration-300 ${
                      isVpnOn ? 'text-white ml-3' : 'text-gray-400 ml-9'
                    }`}
                  >
                    {isConnecting ? '...' : (isVpnOn ? 'ON' : 'OFF')}
                  </span>
                </div>

                {/* 3-dots Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowVpnMenu(!showVpnMenu)}
                    className={`p-2 rounded-lg transition-colors ${
                      showVpnMenu ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white hover:bg-gray-800/60'
                    }`}
                    title="VPN Settings"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1.5"></circle>
                      <circle cx="12" cy="5" r="1.5"></circle>
                      <circle cx="12" cy="19" r="1.5"></circle>
                    </svg>
                  </button>

                  {/* VPN Settings Popover */}
                  {showVpnMenu && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowVpnMenu(false)} />
                      <div className="absolute right-0 top-11 w-64 bg-[#181818] border border-gray-800 rounded-xl shadow-2xl p-3 z-30 space-y-2 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                          <span className="font-semibold text-white">VPN Settings</span>
                          <span className="text-[10px] text-gray-500 uppercase font-mono">v2.4</span>
                        </div>
                        <div
                          onClick={handleToggleKillSwitch}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-800/60 cursor-pointer"
                        >
                          <div>
                            <div className="text-gray-200 font-medium">Kill Switch</div>
                            <div className="text-[10px] text-gray-500">Block internet if VPN drops</div>
                          </div>
                          <div className={`w-8 h-4 rounded-full transition-colors p-0.5 ${killSwitch ? 'bg-blue-600' : 'bg-gray-700'}`}>
                            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${killSwitch ? 'translate-x-4' : 'translate-x-0'}`} />
                          </div>
                        </div>
                        <div className="py-1 px-2 text-[11px] text-gray-400 flex items-center justify-between">
                          <span>Protocol</span>
                          <span className="text-blue-400 font-mono">WireGuard</span>
                        </div>
                        <div className="py-1 px-2 text-[11px] text-gray-400 flex items-center justify-between">
                          <span>DNS Leak Shield</span>
                          <span className="text-emerald-400 font-medium">Active</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="absolute right-0 bottom-0 top-0 w-2/3 opacity-20 pointer-events-none select-none overflow-hidden flex items-end justify-end pb-2 pr-8">
              <div 
                  className={`w-[300px] h-[220px] bg-current origin-right scale-x-180 scale-y-135 transform -translate-y-7 -translate-x-6 transition-colors duration-500 ${
                    isVpnOn ? 'text-blue-400 opacity-80' : 'text-gray-600'
                  }`}
                  style={{
                    WebkitMaskImage: "url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')",
                    maskImage: "url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "right bottom",
                    maskPosition: "right bottom"
                  }}
              />
            </div>
            
          </div>
        </div>

        {/* VPN Location Modal */}
        <VpnLocationModal
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
        />
      </div>
    </div>
  );
}
