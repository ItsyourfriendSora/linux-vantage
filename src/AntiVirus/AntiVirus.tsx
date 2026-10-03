export default function AntiVirus() {
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
      title: 'Account protection',
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
      title: 'Family options',
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
        <h1 className="text-2xl font-semibold text-white mb-2">Security at a glance</h1>
        <p className="text-gray-400 text-sm mb-8">
          See what's happening with the security and health of your device and take any actions needed.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
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
      </div>
    </div>
  );
}
