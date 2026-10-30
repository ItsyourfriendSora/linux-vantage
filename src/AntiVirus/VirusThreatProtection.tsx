import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

interface AntivirusStatus {
  antivirus_enabled: boolean;
  real_time_protection: boolean;
  cloud_protection: boolean;
  sample_submission: boolean;
  tamper_protection: boolean;
  last_scan_time: string;
  last_scan_type: string;
  threats_found: number;
  scan_duration: string;
  files_scanned: number;
  security_intelligence_version: string;
  last_update_time: string;
}

interface ScanProgress {
  current_file: string;
  files_scanned: number;
  threats_found: number;
  elapsed_seconds: number;
  percent: number;
  status: string; // 'scanning' | 'completed' | 'cancelled'
}

interface ThreatItem {
  id: string;
  name: string;
  severity: string;
  date: string;
  file_path: string;
  status: string;
}

interface VirusThreatProtectionProps {
  onBack: () => void;
}

export default function VirusThreatProtection({ onBack }: VirusThreatProtectionProps) {
  const [status, setStatus] = useState<AntivirusStatus>({
    antivirus_enabled: true,
    real_time_protection: true,
    cloud_protection: true,
    sample_submission: true,
    tamper_protection: true,
    last_scan_time: '29/10/2026 08:32',
    last_scan_type: 'quick scan',
    threats_found: 0,
    scan_duration: '4 minutes 55 seconds',
    files_scanned: 68074,
    security_intelligence_version: '1.463.24.0',
    last_update_time: '29/10/2026 21:50',
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [selectedScanType, setSelectedScanType] = useState<'quick' | 'full' | 'custom'>('quick');

  // Modals
  const [activeModal, setActiveModal] = useState<'scan_options' | 'settings' | 'history' | 'allowed' | 'ransomware' | null>(null);
  const [threatHistory, setThreatHistory] = useState<ThreatItem[]>([]);
  const [updatingIntelligence, setUpdatingIntelligence] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  // Fetch initial status
  useEffect(() => {
    async function loadStatus() {
      try {
        const data: AntivirusStatus = await invoke('get_antivirus_status');
        setStatus(data);
      } catch (err) {
        console.error('Failed to get antivirus status:', err);
      }

      // Try background refresh with real system data
      try {
        const refreshed: AntivirusStatus = await invoke('refresh_antivirus_status');
        setStatus(refreshed);
      } catch (err) {
        console.warn('Background refresh failed, using cached status:', err);
      }
    }
    loadStatus();
  }, []);

  // Listen to scan progress events
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    async function setupListener() {
      try {
        const remove = await listen<ScanProgress>('virus_scan_progress', (event) => {
          const payload = event.payload;
          setScanProgress(payload);

          if (payload.status === 'scanning') {
            setIsScanning(true);
          } else if (payload.status === 'completed') {
            setIsScanning(false);
            // Reload status to show updated scan duration and time
            invoke<AntivirusStatus>('get_antivirus_status').then(setStatus);
          } else if (payload.status === 'cancelled') {
            setIsScanning(false);
          }
        });
        unlisten = remove;
      } catch (err) {
        console.error('Failed to listen to virus_scan_progress:', err);
      }
    }

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  const handleStartScan = async (type: string = 'quick scan') => {
    try {
      setIsScanning(true);
      setScanProgress({
        current_file: 'Initializing scan engine...',
        files_scanned: 0,
        threats_found: 0,
        elapsed_seconds: 0,
        percent: 0,
        status: 'scanning',
      });
      await invoke('start_virus_scan', { scanType: type });
    } catch (err) {
      console.error('Failed to start scan:', err);
      setIsScanning(false);
    }
  };

  const handleCancelScan = async () => {
    try {
      await invoke('cancel_virus_scan');
    } catch (err) {
      console.error('Failed to cancel scan:', err);
    }
  };

  const handleToggleSetting = async (settingKey: string, currentValue: boolean) => {
    try {
      const updated: AntivirusStatus = await invoke('toggle_antivirus_setting', {
        setting: settingKey,
        value: !currentValue,
      });
      setStatus(updated);
    } catch (err) {
      console.error('Failed to toggle setting:', err);
    }
  };

  const handleCheckUpdates = async () => {
    setUpdatingIntelligence(true);
    setUpdateMessage(null);
    try {
      const updated: AntivirusStatus = await invoke('update_protection_intelligence');
      setStatus(updated);
      setUpdateMessage('Security intelligence is up to date.');
    } catch (err) {
      console.error('Failed to update signatures:', err);
      setUpdateMessage('Failed to check for updates.');
    } finally {
      setUpdatingIntelligence(false);
      setTimeout(() => setUpdateMessage(null), 4000);
    }
  };

  const handleOpenHistory = async () => {
    try {
      const history: ThreatItem[] = await invoke('get_threat_history');
      setThreatHistory(history);
      setActiveModal('history');
    } catch (err) {
      console.error('Failed to load history:', err);
      setActiveModal('history');
    }
  };

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} seconds`;
    return `${mins} minutes ${secs} seconds`;
  };

  return (
    <div className="w-full h-full p-8 flex flex-col bg-[#000000] text-gray-200 overflow-y-auto select-none">
      <div className="max-w-[1150px] mx-auto w-full flex flex-col pb-16">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6 group w-fit cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:-translate-x-1 transition-transform"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Back To Security</span>
        </button>

        {/* Page Title Header matching Image 1 */}
        <div className="flex items-start gap-3.5 mb-8">
          <div className="text-white mt-1 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-normal text-white tracking-tight leading-tight">
              Virus & threat protection
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Protection for your device against threats.
            </p>
          </div>
        </div>

        {/* SECTION 1: Current threats */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="relative flex items-center justify-center">
              {/* Clock/History icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M12 8v4l3 3"></path>
                <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"></path>
              </svg>
              {/* Green checkmark badge */}
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-3.5 h-3.5 flex items-center justify-center shadow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Current threats
            </h2>
          </div>

          {/* ACTIVE SCANNING STATE */}
          {isScanning && scanProgress ? (
            <div className="mt-4 p-5 rounded-lg bg-[#111111] border border-gray-800 max-w-[650px] shadow-lg animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
                  <span className="text-sm font-semibold text-white">
                    Quick scan in progress...
                  </span>
                </div>
                <span className="text-xs text-cyan-400 font-mono">
                  {Math.round(scanProgress.percent)}%
                </span>
              </div>

              {/* Glowing animated progress bar */}
              <div className="w-full bg-[#222222] h-2 rounded-full overflow-hidden mb-3.5">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-150 ease-out rounded-full shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                  style={{ width: `${Math.max(4, scanProgress.percent)}%` }}
                ></div>
              </div>

              {/* Live scanned path */}
              <p className="text-xs text-gray-400 font-mono truncate mb-3" title={scanProgress.current_file}>
                Scanning: {scanProgress.current_file}
              </p>

              {/* Scanned metrics */}
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-300 py-2 border-t border-gray-800/80 mb-4">
                <div>
                  <span className="text-gray-500 block">Files scanned:</span>
                  <span className="font-semibold text-white text-sm">
                    {scanProgress.files_scanned.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Time elapsed:</span>
                  <span className="font-semibold text-white text-sm">
                    {formatElapsed(scanProgress.elapsed_seconds)}
                  </span>
                </div>
              </div>

              {/* Cancel button */}
              <button
                onClick={handleCancelScan}
                className="bg-[#2b2b2b] hover:bg-[#383838] active:bg-[#202020] border border-gray-700/60 text-white text-xs px-5 py-2 rounded font-normal transition-colors cursor-pointer"
              >
                Cancel scan
              </button>
            </div>
          ) : (
            /* IDLE STATE MATCHING IMAGE 1 */
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-gray-200">
                {status.threats_found === 0 ? 'No current threats.' : `${status.threats_found} active threat(s) detected.`}
              </p>
              <p className="text-gray-400">
                Last scan: {status.last_scan_time} ({status.last_scan_type})
              </p>
              <p className="text-gray-400">
                {status.threats_found} threats found.
              </p>
              <p className="text-gray-400">
                Scan lasted {status.scan_duration}
              </p>
              <p className="text-gray-400">
                {status.files_scanned.toLocaleString()} files scanned.
              </p>

              {/* Quick Scan Button */}
              <div className="pt-3 pb-3">
                <button
                  onClick={() => handleStartScan('quick scan')}
                  className="bg-[#2b2b2b] hover:bg-[#383838] active:bg-[#202020] border border-gray-700/60 text-white text-sm px-6 py-2 rounded font-normal transition-colors cursor-pointer shadow-sm hover:border-gray-500"
                >
                  Quick scan
                </button>
              </div>

              {/* Cyan Links */}
              <div className="space-y-2 pt-1">
                <div>
                  <button
                    onClick={() => setActiveModal('scan_options')}
                    className="text-[#00c0f0] hover:text-[#38d4ff] hover:underline text-sm font-normal cursor-pointer text-left"
                  >
                    Scan options
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => setActiveModal('allowed')}
                    className="text-[#00c0f0] hover:text-[#38d4ff] hover:underline text-sm font-normal cursor-pointer text-left"
                  >
                    Allowed threats
                  </button>
                </div>
                <div>
                  <button
                    onClick={handleOpenHistory}
                    className="text-[#00c0f0] hover:text-[#38d4ff] hover:underline text-sm font-normal cursor-pointer text-left"
                  >
                    Protection history
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Virus & threat protection settings */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="relative flex items-center justify-center">
              {/* Gear icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              {/* Green checkmark badge */}
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-3.5 h-3.5 flex items-center justify-center shadow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Virus & threat protection settings
            </h2>
          </div>

          <div className="mt-2 space-y-2 text-sm">
            <p className="text-gray-200">No action needed.</p>
            <div>
              <button
                onClick={() => setActiveModal('settings')}
                className="text-[#00c0f0] hover:text-[#38d4ff] hover:underline text-sm font-normal cursor-pointer text-left"
              >
                Manage settings
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: Virus & threat protection updates */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="relative flex items-center justify-center">
              {/* Circular refresh/sync icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-white ${updatingIntelligence ? 'animate-spin' : ''}`}
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              {/* Green checkmark badge */}
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-3.5 h-3.5 flex items-center justify-center shadow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Virus & threat protection updates
            </h2>
          </div>

          <div className="mt-2 space-y-1 text-sm">
            <p className="text-gray-200">
              Security intelligence is up to date.
            </p>
            <p className="text-gray-400">
              Last update: {status.last_update_time}
            </p>
            {updateMessage && (
              <p className="text-xs text-green-400 pt-1 font-medium">{updateMessage}</p>
            )}
            <div className="pt-2">
              <button
                onClick={handleCheckUpdates}
                disabled={updatingIntelligence}
                className="text-[#00c0f0] hover:text-[#38d4ff] hover:underline text-sm font-normal cursor-pointer text-left disabled:opacity-50"
              >
                {updatingIntelligence ? 'Checking for updates...' : 'Protection updates'}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: Ransomware protection */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="relative flex items-center justify-center">
              {/* Document / folder safe icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M7 8h10M7 12h10M7 16h6" />
              </svg>
              {/* Green checkmark badge */}
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-3.5 h-3.5 flex items-center justify-center shadow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Ransomware protection
            </h2>
          </div>

          <div className="mt-2 text-sm">
            <button
              onClick={() => setActiveModal('ransomware')}
              className="text-[#00c0f0] hover:text-[#38d4ff] hover:underline text-sm font-normal cursor-pointer text-left"
            >
              Manage ransomware protection
            </button>
          </div>
        </div>

      </div>

      {/* SCAN OPTIONS MODAL */}
      {activeModal === 'scan_options' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] border border-gray-800 rounded-lg max-w-[550px] w-full p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-2">Scan options</h3>
            <p className="text-sm text-gray-400 mb-5">
              Choose the type of scan you want to perform.
            </p>

            <div className="space-y-4 mb-6">
              <label
                onClick={() => setSelectedScanType('quick')}
                className={`flex items-start gap-3 p-3.5 rounded border cursor-pointer transition-colors ${
                  selectedScanType === 'quick'
                    ? 'border-cyan-500 bg-cyan-950/20'
                    : 'border-gray-800 hover:border-gray-700 bg-[#161616]'
                }`}
              >
                <input
                  type="radio"
                  name="scanType"
                  checked={selectedScanType === 'quick'}
                  onChange={() => setSelectedScanType('quick')}
                  className="mt-1 accent-cyan-500"
                />
                <div>
                  <h4 className="text-sm font-medium text-white">Quick scan</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Checks folders in your system where threats are commonly found.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setSelectedScanType('full')}
                className={`flex items-start gap-3 p-3.5 rounded border cursor-pointer transition-colors ${
                  selectedScanType === 'full'
                    ? 'border-cyan-500 bg-cyan-950/20'
                    : 'border-gray-800 hover:border-gray-700 bg-[#161616]'
                }`}
              >
                <input
                  type="radio"
                  name="scanType"
                  checked={selectedScanType === 'full'}
                  onChange={() => setSelectedScanType('full')}
                  className="mt-1 accent-cyan-500"
                />
                <div>
                  <h4 className="text-sm font-medium text-white">Full scan</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Checks all files and running programs on your hard disk. This scan could take longer.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setSelectedScanType('custom')}
                className={`flex items-start gap-3 p-3.5 rounded border cursor-pointer transition-colors ${
                  selectedScanType === 'custom'
                    ? 'border-cyan-500 bg-cyan-950/20'
                    : 'border-gray-800 hover:border-gray-700 bg-[#161616]'
                }`}
              >
                <input
                  type="radio"
                  name="scanType"
                  checked={selectedScanType === 'custom'}
                  onChange={() => setSelectedScanType('custom')}
                  className="mt-1 accent-cyan-500"
                />
                <div>
                  <h4 className="text-sm font-medium text-white">Custom scan</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Choose which files and locations you want to check.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  handleStartScan(selectedScanType === 'full' ? 'full scan' : 'quick scan');
                }}
                className="px-5 py-2 rounded text-sm bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
              >
                Scan now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE SETTINGS MODAL */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] border border-gray-800 rounded-lg max-w-[600px] w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                Virus & threat protection settings
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-white p-1 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 mb-6">
              {/* Real-time protection */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-800">
                <div>
                  <h4 className="text-sm font-semibold text-white">Real-time protection</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Locates and stops malware from installing or running on your device. You can turn this off for a short time, but it will automatically turn back on.
                  </p>
                </div>
                <button
                  onClick={() => handleToggleSetting('real_time_protection', status.real_time_protection)}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    status.real_time_protection ? 'bg-cyan-500' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                      status.real_time_protection ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Cloud-delivered protection */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-800">
                <div>
                  <h4 className="text-sm font-semibold text-white">Cloud-delivered protection</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Provides increased and faster protection with access to the latest Microsoft Defender cloud data.
                  </p>
                </div>
                <button
                  onClick={() => handleToggleSetting('cloud_protection', status.cloud_protection)}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    status.cloud_protection ? 'bg-cyan-500' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                      status.cloud_protection ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Automatic sample submission */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-800">
                <div>
                  <h4 className="text-sm font-semibold text-white">Automatic sample submission</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Sends sample files to Microsoft to help protect you and others from potential threats.
                  </p>
                </div>
                <button
                  onClick={() => handleToggleSetting('sample_submission', status.sample_submission)}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    status.sample_submission ? 'bg-cyan-500' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                      status.sample_submission ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Tamper Protection */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Tamper Protection</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Prevents others from tampering with important security features.
                  </p>
                </div>
                <button
                  onClick={() => handleToggleSetting('tamper_protection', status.tamper_protection)}
                  className={`w-12 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    status.tamper_protection ? 'bg-cyan-500' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                      status.tamper_protection ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded text-sm bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROTECTION HISTORY MODAL */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] border border-gray-800 rounded-lg max-w-[650px] w-full p-6 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Protection history</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-white p-1 text-lg"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              View latest protection actions and recommendations from Windows Defender.
            </p>

            <div className="overflow-y-auto flex-1 space-y-3 pr-2">
              {threatHistory.length === 0 ? (
                <div className="p-8 text-center bg-[#171717] rounded border border-gray-800 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto mb-2 opacity-80"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <p className="text-sm text-white font-medium">No recent actions</p>
                  <p className="text-xs text-gray-500 mt-1">
                    No threats have been detected or quarantined recently.
                  </p>
                </div>
              ) : (
                threatHistory.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-[#181818] rounded border border-gray-800 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-red-400">{item.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-medium">
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">Detected: {item.date}</p>
                    <p className="text-xs text-gray-500 font-mono truncate">Path: {item.file_path}</p>
                    <p className="text-xs text-cyan-400 mt-1">Status: {item.status}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-800 mt-4">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded text-sm bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALLOWED THREATS MODAL */}
      {activeModal === 'allowed' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] border border-gray-800 rounded-lg max-w-[500px] w-full p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-2">Allowed threats</h3>
            <p className="text-sm text-gray-400 mb-6">
              Items you identified as not a threat and allowed to run on your device.
            </p>

            <div className="p-6 text-center bg-[#171717] rounded border border-gray-800 text-gray-400 mb-6">
              <p className="text-sm text-gray-300 font-medium">No allowed threats</p>
              <p className="text-xs text-gray-500 mt-1">
                You do not currently have any threats on your allowed list.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded text-sm bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RANSOMWARE PROTECTION MODAL */}
      {activeModal === 'ransomware' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] border border-gray-800 rounded-lg max-w-[550px] w-full p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-2">Ransomware protection</h3>
            <p className="text-sm text-gray-400 mb-6">
              Controlled folder access protects files, folders, and memory areas on your device from unauthorized changes by unfriendly applications.
            </p>

            <div className="p-4 bg-[#181818] rounded border border-gray-800 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Controlled folder access</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Protect files and folders from ransomware encryption.</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-cyan-500 relative shrink-0">
                  <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 right-0.5" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded text-sm bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
