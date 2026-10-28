import { useState, useEffect, useMemo } from 'react';
import { AppIcon } from '../components/AppIcon';
import { invoke } from '@tauri-apps/api/core';

export interface DiskInfo {
  name: string;
  disk_type: string;
  mount_point: string;
  total_space: number;
  available_space: number;
  file_system: string;
  is_removable: boolean;
}

export interface InstalledSoftware {
  id: string;
  name: string;
  version: string;
  publisher: string;
  size_bytes: number;
  install_date: string;
  kind: string; // "DesktopApp" | "Package" | "Flatpak"
  uninstall_cmd: string;
  icon: string;
  description: string;
}

export default function Storage() {
  const [disks, setDisks] = useState<DiskInfo[]>([]);
  const [softwareList, setSoftwareList] = useState<InstalledSoftware[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'size'>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // State for Mandatory Warning Modal
  const [deleteTarget, setDeleteTarget] = useState<InstalledSoftware | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [confirmChecked, setConfirmChecked] = useState<boolean>(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const fetchDisks = async () => {
    try {
      const data = await invoke<DiskInfo[]>('get_disks');
      setDisks(data);
    } catch (err) {
      console.error('Failed to get disks:', err);
    }
  };

  const fetchSoftware = async () => {
    setLoading(true);
    try {
      const data = await invoke<InstalledSoftware[]>('get_installed_software');
      setSoftwareList(data);
    } catch (err) {
      console.error('Failed to get installed software:', err);
      showToast('Gagal memuat daftar aplikasi terinstal.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisks();
    fetchSoftware();
  }, []);

  const handleRefresh = () => {
    fetchDisks();
    fetchSoftware();
  };

  // Helper formatting
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = bytes / Math.pow(k, i);
    return `${val.toFixed(val >= 100 || i === 0 ? 0 : 1)} ${sizes[i]}`;
  };

  // Filter & Sort
  const filteredSoftware = useMemo(() => {
    let result = softwareList;

    if (filterType === 'desktop') {
      result = result.filter(s => s.kind === 'DesktopApp');
    } else if (filterType === 'package') {
      result = result.filter(s => s.kind === 'Package');
    } else if (filterType === 'flatpak') {
      result = result.filter(s => s.kind === 'Flatpak');
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query) ||
        s.publisher.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      );
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'name') {
        const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        return sortAsc ? cmp : -cmp;
      } else {
        const diff = a.size_bytes - b.size_bytes;
        return sortAsc ? diff : -diff;
      }
    });
  }, [softwareList, filterType, search, sortBy, sortAsc]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: softwareList.length,
      desktop: softwareList.filter(s => s.kind === 'DesktopApp').length,
      package: softwareList.filter(s => s.kind === 'Package').length,
      flatpak: softwareList.filter(s => s.kind === 'Flatpak').length,
    };
  }, [softwareList]);

  // Execute uninstallation after confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const msg = await invoke<string>('uninstall_software', {
        id: deleteTarget.id,
        kind: deleteTarget.kind,
        uninstallCmd: deleteTarget.uninstall_cmd,
      });

      showToast(msg || `Succes Remove ${deleteTarget.name}`, 'success');
      setSoftwareList(prev => prev.filter(s => s.id !== deleteTarget.id));
      setDeleteTarget(null);
      setConfirmChecked(false);
    } catch (err: any) {
      console.error('Uninstall failed:', err);
      showToast(String(err) || 'Failed to Remove Application.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };


  const getBadgeStyle = (kind: string) => {
    switch (kind) {
      case 'DesktopApp':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Package':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Flatpak':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  return (
    <div className="w-full h-full p-8 flex flex-col bg-[#000000] text-gray-300 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-8">

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border animate-in fade-in slide-in-from-top-4 duration-200 ${toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-600/40 text-emerald-200'
              : 'bg-red-950/90 border-red-600/40 text-red-200'
            }`}>
            <span className="text-lg">{toast.type === 'success' ? '✓' : '⚠️'}</span>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1">Storage & Installed Applications</h1>
        </div>

        {/* Drives Overview Section */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Drive</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {disks.map((disk, idx) => {
              const usedSpace = disk.total_space - disk.available_space;
              const usedPercent = disk.total_space > 0
                ? Math.min(100, Math.round((usedSpace / disk.total_space) * 100))
                : 0;

              let barColor = 'bg-blue-500';
              if (usedPercent > 90) barColor = 'bg-red-500';
              else if (usedPercent > 75) barColor = 'bg-amber-500';

              return (
                <div
                  key={idx}
                  className="bg-[#121212] rounded-lg p-5 border border-gray-900 flex flex-col justify-between shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-gray-800 flex items-center justify-center text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="12" x2="2" y2="12"></line>
                          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                          <line x1="6" y1="16" x2="6.01" y2="16"></line>
                          <line x1="10" y1="16" x2="10.01" y2="16"></line>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">{disk.name}</h3>
                        <p className="text-xs text-gray-500">{disk.mount_point} • {disk.disk_type} ({disk.file_system})</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-800/80 text-gray-300">
                      {usedPercent}%
                    </span>
                  </div>

                  <div>
                    {/* Capacity Progress Bar */}
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                        style={{ width: `${usedPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{formatBytes(disk.available_space)} Free</span>
                      <span className="text-gray-500">Total {formatBytes(disk.total_space)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Software Management Section */}
        {/* Software Management Section */}
        <div className="flex flex-col gap-4">

          {/* Controls Bar (Berada di atas tabel) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-sm border border-gray-800 w-fit text-xs font-medium">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-sm transition-colors ${filterType === 'all' ? 'bg-[#262626] text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
              >
                All ({counts.all})
              </button>
              <button
                onClick={() => setFilterType('desktop')}
                className={`px-3 py-1.5 rounded-sm transition-colors ${filterType === 'desktop' ? 'bg-[#262626] text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
              >
                Aplication Desktop ({counts.desktop})
              </button>
              {counts.package > 0 && (
                <button
                  onClick={() => setFilterType('package')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${filterType === 'package' ? 'bg-[#262626] text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Paket Sistem ({counts.package})
                </button>
              )}
              {counts.flatpak > 0 && (
                <button
                  onClick={() => setFilterType('flatpak')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${filterType === 'flatpak' ? 'bg-[#262626] text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Flatpak ({counts.flatpak})
                </button>
              )}
            </div>

            {/* Search, Sort and Refresh */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 bg-[#121212] hover:bg-[#1e1e1e] border border-gray-800 text-gray-200 px-3 py-2 rounded-sm text-xs font-medium transition-colors disabled:opacity-50"
                title="Synchronization"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={loading ? 'animate-spin text-blue-400' : ''}
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
                <span>{loading ? 'Scanning...' : 'Synchronization'}</span>
              </button>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Find Aplication Or Packcage Here..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-[#121212] border border-gray-800 text-white text-xs rounded-sm pl-8 pr-8 py-2 w-64 focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-500"
                />
                <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort Toggle */}
              <div className="flex items-center bg-[#121212] border border-gray-800 rounded-sm p-0.5 text-xs text-gray-400">
                <button
                  onClick={() => {
                    if (sortBy === 'name') setSortAsc(!sortAsc);
                    else { setSortBy('name'); setSortAsc(true); }
                  }}
                  className={`px-2.5 py-1.5 rounded-sm transition-colors ${sortBy === 'name' ? 'bg-[#262626] text-white font-medium' : 'hover:text-white'}`}
                >
                  Name {sortBy === 'name' ? (sortAsc ? '↑' : '↓') : ''}
                </button>
                <button
                  onClick={() => {
                    if (sortBy === 'size') setSortAsc(!sortAsc);
                    else { setSortBy('size'); setSortAsc(false); }
                  }}
                  className={`px-2.5 py-1.5 rounded-sm transition-colors ${sortBy === 'size' ? 'bg-[#262626] text-white font-medium' : 'hover:text-white'}`}
                >
                  Size {sortBy === 'size' ? (sortAsc ? '↑' : '↓') : ''}
                </button>
              </div>
            </div>
          </div>

          {/* Table Container (Header menempel tepat di atas tabel dengan border rapi) */}
          <div className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#181818] text-gray-400 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-800">
                    <th className="py-3 px-4 border-r border-gray-800">Aplication & Component</th>
                    <th className="py-3 px-4 border-r border-gray-800">Type</th>
                    <th className="py-3 px-4 border-r border-gray-800">Size</th>
                    <th className="py-3 px-4 border-r border-gray-800">Version</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span>Syncronization Data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredSoftware.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        Data Not Found
                      </td>
                    </tr>
                  ) : (
                    filteredSoftware.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-800/80 last:border-b-0 hover:bg-[#181818] transition-colors group"
                      >
                        {/* Name & Icon */}
                        <td className="py-3 px-4 border-r border-gray-800/80">
                          <div className="flex items-center gap-3">
                            <AppIcon name={item.name} kind={item.kind} size={32} className="w-8 h-8 flex-shrink-0" />
                            <div className="flex flex-col max-w-[320px]">
                              <span className="text-white font-medium text-sm truncate">{item.name}</span>
                              <span className="text-gray-500 text-[11px] truncate">{item.description || item.publisher}</span>
                            </div>
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td className="py-3 px-4 border-r border-gray-800/80">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getBadgeStyle(item.kind)}`}>
                            {item.kind === 'DesktopApp' ? 'Desktop App' : item.kind === 'Package' ? 'Package' : item.kind}
                          </span>
                        </td>

                        {/* Size */}
                        <td className="py-3 px-4 border-r border-gray-800/80 font-mono text-gray-300">
                          {item.size_bytes > 0 ? formatBytes(item.size_bytes) : '-'}
                        </td>

                        {/* Version */}
                        <td className="py-3 px-4 border-r border-gray-800/80 text-gray-400 font-mono">
                          {item.version || '-'}
                        </td>

                        {/* Action (Uninstall) */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setDeleteTarget(item);
                              setConfirmChecked(false);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all inline-flex items-center gap-1.5"
                            title={`Delete ${item.name}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MANDATORY WARNING MODAL FOR DELETION */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-red-500/30 rounded-xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-5 text-gray-300">

            {/* Modal Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">
                  Warning Confirmation
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Are you sure you want to delete this application or package from your computer?
                </p>
              </div>
            </div>

            {/* Target Details Box */}
            <div className="bg-[#1c1c1c] rounded-lg p-4 border border-gray-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Nama:</span>
                <span className="text-white font-semibold text-sm">{deleteTarget.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Tipe:</span>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-200">
                  {deleteTarget.kind === 'DesktopApp' ? 'Aplikasi Desktop' : deleteTarget.kind === 'Package' ? 'Paket Sistem' : deleteTarget.kind}
                </span>
              </div>
              {deleteTarget.version && deleteTarget.version !== '-' && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Versi:</span>
                  <span className="text-xs font-mono text-gray-300">{deleteTarget.version}</span>
                </div>
              )}
              {deleteTarget.size_bytes > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Ukuran:</span>
                  <span className="text-xs font-mono text-gray-300">{formatBytes(deleteTarget.size_bytes)}</span>
                </div>
              )}
            </div>

            {/* Warning Message Notice */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3.5 text-xs text-red-300/90 leading-relaxed">
              <strong>Serious Warning:</strong> This action will permanently delete the software from the disk. Data files, preferences, or other applications that depend on this package may be affected.
            </div>

            {/* Required Confirmation Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer select-none text-xs text-gray-300 bg-[#181818] p-3 rounded-lg border border-gray-800">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
              />
              <span>I understand the risks and agree to uninstall this software.</span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => {
                  setDeleteTarget(null);
                  setConfirmChecked(false);
                }}
                className="px-4 py-2 rounded-lg text-xs font-medium text-gray-300 hover:bg-[#262626] transition-colors"
              >
                Batal
              </button>
              <button
                disabled={!confirmChecked || isDeleting}
                onClick={handleConfirmDelete}
                className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${confirmChecked && !isDeleting
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
                    : 'bg-red-950/40 text-red-400/40 cursor-not-allowed border border-red-900/30'
                  }`}
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uninstalling...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>Yes, Remove It</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}