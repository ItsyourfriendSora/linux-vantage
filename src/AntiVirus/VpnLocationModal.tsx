import { useState, useMemo, useEffect } from 'react';

export interface VpnLocation {
  id: string;
  country: string;
  city: string;
  countryCode: string;
  flag: string;
  ping: number; // in milliseconds
  privateIp: string;
  region: 'Americas' | 'Europe' | 'Asia-Pacific' | 'Other';
  isRecommended?: boolean;
}

export const VPN_LOCATIONS: VpnLocation[] = [
  { id: 'id-jkt', country: 'Indonesia', city: 'Jakarta', countryCode: 'ID', flag: '🇮🇩', ping: 8, privateIp: '10.30.1.15', region: 'Asia-Pacific', isRecommended: true },
  { id: 'sg-sin', country: 'Singapore', city: 'Singapore', countryCode: 'SG', flag: '🇸🇬', ping: 14, privateIp: '10.12.4.19', region: 'Asia-Pacific', isRecommended: true },
  { id: 'us-nyc', country: 'United States', city: 'New York, NY', countryCode: 'US', flag: '🇺🇸', ping: 24, privateIp: '10.8.12.44', region: 'Americas', isRecommended: true },
  { id: 'us-la', country: 'United States', city: 'Los Angeles, CA', countryCode: 'US', flag: '🇺🇸', ping: 38, privateIp: '10.8.24.108', region: 'Americas' },
  { id: 'us-mia', country: 'United States', city: 'Miami, FL', countryCode: 'US', flag: '🇺🇸', ping: 33, privateIp: '10.8.16.89', region: 'Americas' },
  { id: 'ca-tor', country: 'Canada', city: 'Toronto', countryCode: 'CA', flag: '🇨🇦', ping: 31, privateIp: '10.22.3.57', region: 'Americas' },
  { id: 'jp-tyo', country: 'Japan', city: 'Tokyo', countryCode: 'JP', flag: '🇯🇵', ping: 42, privateIp: '10.14.8.72', region: 'Asia-Pacific', isRecommended: true },
  { id: 'kr-sel', country: 'South Korea', city: 'Seoul', countryCode: 'KR', flag: '🇰🇷', ping: 48, privateIp: '10.26.3.61', region: 'Asia-Pacific' },
  { id: 'hk-hkg', country: 'Hong Kong', city: 'Hong Kong', countryCode: 'HK', flag: '🇭🇰', ping: 27, privateIp: '10.34.4.16', region: 'Asia-Pacific' },
  { id: 'au-syd', country: 'Australia', city: 'Sydney', countryCode: 'AU', flag: '🇦🇺', ping: 84, privateIp: '10.20.7.31', region: 'Asia-Pacific' },
  { id: 'de-fra', country: 'Germany', city: 'Frankfurt', countryCode: 'DE', flag: '🇩🇪', ping: 64, privateIp: '10.16.2.33', region: 'Europe', isRecommended: true },
  { id: 'gb-lon', country: 'United Kingdom', city: 'London', countryCode: 'GB', flag: '🇬🇧', ping: 69, privateIp: '10.18.5.20', region: 'Europe', isRecommended: true },
  { id: 'nl-ams', country: 'Netherlands', city: 'Amsterdam', countryCode: 'NL', flag: '🇳🇱', ping: 67, privateIp: '10.24.1.88', region: 'Europe' },
  { id: 'fr-par', country: 'France', city: 'Paris', countryCode: 'FR', flag: '🇫🇷', ping: 73, privateIp: '10.28.2.14', region: 'Europe' },
  { id: 'ch-zrh', country: 'Switzerland', city: 'Zurich', countryCode: 'CH', flag: '🇨🇭', ping: 68, privateIp: '10.32.0.95', region: 'Europe' },
  { id: 'se-sto', country: 'Sweden', city: 'Stockholm', countryCode: 'SE', flag: '🇸🇪', ping: 75, privateIp: '10.40.1.12', region: 'Europe' },
  { id: 'es-mad', country: 'Spain', city: 'Madrid', countryCode: 'ES', flag: '🇪🇸', ping: 78, privateIp: '10.42.3.84', region: 'Europe' },
  { id: 'in-bom', country: 'India', city: 'Mumbai', countryCode: 'IN', flag: '🇮🇳', ping: 56, privateIp: '10.38.2.29', region: 'Asia-Pacific' },
  { id: 'ae-dxb', country: 'United Arab Emirates', city: 'Dubai', countryCode: 'AE', flag: '🇦🇪', ping: 61, privateIp: '10.44.0.50', region: 'Other' },
  { id: 'br-sao', country: 'Brazil', city: 'São Paulo', countryCode: 'BR', flag: '🇧🇷', ping: 122, privateIp: '10.36.1.41', region: 'Americas' },
];

interface VpnLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: VpnLocation;
  onSelectLocation: (location: VpnLocation) => void;
}

export default function VpnLocationModal({
  isOpen,
  onClose,
  selectedLocation,
  onSelectLocation,
}: VpnLocationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState<'All' | 'Asia-Pacific' | 'Americas' | 'Europe'>('All');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredLocations = useMemo(() => {
    return VPN_LOCATIONS.filter((loc) => {
      const matchesSearch =
        loc.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.countryCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion = activeRegion === 'All' || loc.region === activeRegion;

      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, activeRegion]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#141414] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-white text-lg font-bold">Select VPN Location</h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Choose a country to route your private connection
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Search Bar & Filter Tabs */}
        <div className="p-4 border-b border-gray-800/80 bg-[#161616] space-y-3">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search country or city (e.g. Indonesia, Singapore, New York)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full bg-[#1e1e1e] border border-gray-700/80 focus:border-blue-500 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['All', 'Asia-Pacific', 'Americas', 'Europe'] as const).map((region) => (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeRegion === region
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700/80'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Location List */}
        <div className="overflow-y-auto max-h-[380px] p-2 divide-y divide-gray-800/50">
          {filteredLocations.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No VPN server found matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredLocations.map((loc) => {
              const isSelected = selectedLocation.id === loc.id;
              const isFast = loc.ping < 30;

              return (
                <div
                  key={loc.id}
                  onClick={() => onSelectLocation(loc)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-900/30 border border-blue-600/40'
                      : 'hover:bg-[#1a1a1a] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700/60 flex items-center justify-center text-lg shadow-sm">
                      {loc.flag}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-semibold">{loc.city}</span>
                        <span className="text-gray-400 text-xs">({loc.country})</span>
                        {loc.isRecommended && (
                          <span className="text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Fastest
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                        <span>IP: <span className="font-mono text-gray-300">{loc.privateIp}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isFast ? 'bg-emerald-400' : loc.ping < 70 ? 'bg-blue-400' : 'bg-amber-400'
                        }`}
                      />
                      <span
                        className={
                          isFast ? 'text-emerald-400' : loc.ping < 70 ? 'text-blue-400' : 'text-amber-400'
                        }
                      >
                        {loc.ping} ms
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-700 bg-transparent text-transparent'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-gray-800 bg-[#161616] flex items-center justify-between text-[11px] text-gray-400">
          <span>{filteredLocations.length} locations available</span>
          <span className="text-gray-400">Selecting a location will automatically connect</span>
        </div>
      </div>
    </div>
  );
}

