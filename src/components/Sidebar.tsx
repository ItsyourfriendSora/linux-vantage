import React from 'react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

type MenuItem = {
  name: string;
  icon: React.ReactNode;
  icon2?: React.ReactNode;
  icon3?: React.ReactNode;
  icon4?: React.ReactNode;
  icon5?: React.ReactNode;
  icon6?: React.ReactNode;
};

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: <rect x="3" y="3" width="7" height="7" rx="1" />, icon2: <rect x="14" y="3" width="7" height="7" rx="1" />, icon3: <rect x="14" y="14" width="7" height="7" rx="1" />, icon4: <rect x="3" y="14" width="7" height="7" rx="1" /> },
    { name: 'Processes', icon: <circle cx="12" cy="12" r="10" />, icon2: <polyline points="12 6 12 12 16 14" /> },
    { name: 'Performance', icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /> },
    { name: 'App History', icon: <circle cx="12" cy="12" r="10" />, icon2: <polyline points="12 6 12 12 16 14" /> },
    { name: 'Backlight Keyboard', icon: <g><rect width="20" height="16" x="2" y="4" rx="2" ry="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/></g> },
    { name: 'Anti Virus', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
    { name: 'Storage', icon: <line x1="22" y1="12" x2="2" y2="12" />, icon2: <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />, icon3: <line x1="6" y1="16" x2="6.01" y2="16" />, icon4: <line x1="10" y1="16" x2="10.01" y2="16" /> },
  ];

  return (
    <div className="w-[260px] h-screen bg-[#000000] border-r border-gray-900 flex flex-col justify-between py-4">
      <div>
        {/* Hamburger Menu */}
        <div className="px-6 mb-6">
          <button className="text-white hover:bg-[#121212] p-2 rounded-md transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-1 px-3">
          {menuItems.map((item, idx) => {
            const isActive = activeTab === item.name;
            return (
              <div 
                key={idx} 
                onClick={() => onTabChange(item.name)}
                className={`flex items-center gap-4 px-3 py-2.5 rounded-lg cursor-pointer transition-colors relative ${isActive ? 'bg-[#1e1e1e]' : 'hover:bg-[#121212]'}`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-500 rounded-full"></div>
                )}
                <div className={`${isActive ? 'text-blue-400' : 'text-gray-400'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {item.icon}
                    {item.icon2}
                    {item.icon3}
                    {item.icon4}
                    {item.icon5}
                    {item.icon6}
                  </svg>
                </div>
                <span className={`text-sm ${isActive ? 'text-white' : 'text-gray-300'}`}>{item.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings at Bottom */}
      <div className="px-3">
        <div className="flex items-center gap-4 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#121212] transition-colors">
          <div className="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <span className="text-sm text-gray-300">Settings</span>
        </div>
      </div>
    </div>
  );
}
