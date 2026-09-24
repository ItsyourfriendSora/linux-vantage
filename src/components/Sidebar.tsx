interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { name: 'Processes', icon: <rect x="3" y="3" width="7" height="7" rx="1" />, icon2: <rect x="14" y="3" width="7" height="7" rx="1" />, icon3: <rect x="14" y="14" width="7" height="7" rx="1" />, icon4: <rect x="3" y="14" width="7" height="7" rx="1" /> },
    { name: 'Performance', icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /> },
    { name: 'App history', icon: <circle cx="12" cy="12" r="10" />, icon2: <polyline points="12 6 12 12 16 14" /> },
    { name: 'Startup apps', icon: <path d="M12 2v20" />, icon2: <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
    { name: 'Users', icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />, icon2: <circle cx="9" cy="7" r="4" />, icon3: <path d="M23 21v-2a4 4 0 0 0-3-3.87" />, icon4: <path d="M16 3.13a4 4 0 0 1 0 7.75" /> },
    { name: 'Details', icon: <line x1="8" y1="6" x2="21" y2="6" />, icon2: <line x1="8" y1="12" x2="21" y2="12" />, icon3: <line x1="8" y1="18" x2="21" y2="18" />, icon4: <line x1="3" y1="6" x2="3.01" y2="6" />, icon5: <line x1="3" y1="12" x2="3.01" y2="12" />, icon6: <line x1="3" y1="18" x2="3.01" y2="18" /> },
    { name: 'Services', icon: <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />, icon2: <circle cx="12" cy="12" r="3" /> },
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
