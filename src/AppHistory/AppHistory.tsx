import { useEffect, useState } from 'react';
import { HistoryEvent, getHistory, subscribeHistory } from '../store/historyStore';

export default function AppHistory() {
  const [events, setEvents] = useState<HistoryEvent[]>(getHistory());

  useEffect(() => {
    const unsubscribe = subscribeHistory((newHistory) => {
      setEvents([...newHistory]);
    });
    return unsubscribe;
  }, []);

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('chrome') || n.includes('brave') || n.includes('firefox') || n.includes('edge')) return '🌐';
    if (n.includes('discord') || n.includes('slack') || n.includes('messenger')) return '💬';
    if (n.includes('code') || n.includes('nvim') || n.includes('nano')) return '📝';
    if (n.includes('spotify') || n.includes('music')) return '🎵';
    if (n.includes('steam') || n.includes('game')) return '🎮';
    if (n.includes('system') || n.includes('daemon') || n.includes('service') || n.includes('dbus')) return '⚙️';
    return '⚙️';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col p-6 bg-[#000000] text-gray-300">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">App History</h1>
      </div>

      <div className="flex-1 bg-[#121212] rounded-lg border border-gray-800 flex flex-col overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[3fr_1fr_2fr_1fr] border-b border-gray-800 text-xs font-semibold">
          <div className="p-3 border-r border-gray-800 hover:bg-[#1e1e1e] cursor-pointer">
            Name
          </div>
          <div className="p-3 border-r border-gray-800 hover:bg-[#1e1e1e] cursor-pointer">
            PID
          </div>
          <div className="p-3 border-r border-gray-800 hover:bg-[#1e1e1e] cursor-pointer">
            Time
          </div>
          <div className="p-3 hover:bg-[#1e1e1e] cursor-pointer">
            Event
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-y-auto flex-1 pb-10">
          {events.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No recent app history recorded yet. Open or close some apps to see them here!
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="grid grid-cols-[3fr_1fr_2fr_1fr] border-b border-gray-800/50 hover:bg-[#1e1e1e] text-sm group">
                <div className="p-2 border-r border-gray-800/50 flex items-center gap-3 overflow-hidden whitespace-nowrap text-ellipsis">
                  <span className="text-lg flex-shrink-0">{getIcon(event.name)}</span>
                  <span className="text-gray-200 truncate" title={event.name}>{event.name}</span>
                </div>
                <div className="p-2 border-r border-gray-800/50 text-gray-400 flex items-center">
                  {event.pid}
                </div>
                <div className="p-2 border-r border-gray-800/50 text-gray-400 flex items-center">
                  {formatTime(event.time)}
                </div>
                <div className="p-2 flex items-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    event.type === 'Opened' ? 'bg-teal-500/20 text-teal-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {event.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
