import { invoke } from '@tauri-apps/api/core';

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  disk_read: number;
  disk_write: number;
}

export interface HistoryEvent {
  id: string;
  name: string;
  type: 'Opened' | 'Closed';
  time: Date;
  pid: number;
}

let history: HistoryEvent[] = [];
let knownProcesses: Map<number, string> = new Map();
let isPolling = false;
let listeners: ((history: HistoryEvent[]) => void)[] = [];

export const subscribeHistory = (listener: (history: HistoryEvent[]) => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

export const getHistory = () => history;

const pollProcesses = async () => {
  try {
    const data: ProcessInfo[] = await invoke('get_processes');
    const currentProcesses = new Map<number, string>();
    const newEvents: HistoryEvent[] = [];

    data.forEach(p => {
      currentProcesses.set(p.pid, p.name);
      if (!knownProcesses.has(p.pid)) {
        // Only record "Opened" if we already had a baseline
        if (knownProcesses.size > 0) {
          newEvents.push({
            id: `${p.pid}-${Date.now()}-opened`,
            name: p.name,
            type: 'Opened',
            time: new Date(),
            pid: p.pid,
          });
        }
      }
    });

    // Check for closed processes
    if (knownProcesses.size > 0) {
      knownProcesses.forEach((name, pid) => {
        if (!currentProcesses.has(pid)) {
          newEvents.push({
            id: `${pid}-${Date.now()}-closed`,
            name: name,
            type: 'Closed',
            time: new Date(),
            pid,
          });
        }
      });
    }

    knownProcesses = currentProcesses;

    if (newEvents.length > 0) {
      // Prepend new events
      history = [...newEvents.reverse(), ...history].slice(0, 100); // Keep last 100 events
      listeners.forEach(l => l(history));
    }
  } catch (e) {
    console.error(e);
  }
};

export const startHistoryPolling = () => {
  if (!isPolling) {
    isPolling = true;
    pollProcesses();
    setInterval(pollProcesses, 2000);
  }
};
