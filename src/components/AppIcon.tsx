import React, { useState } from 'react';

// Genuine extracted system desktop icons
import antigravityIdeIcon from '../assets/antigravity_ide.png';
import antigravityIcon from '../assets/antigravity.png';
import chromeIcon from '../assets/chrome.png';
import vscodeIcon from '../assets/vscode.png';
import edgeIcon from '../assets/edge.png';
import firefoxIcon from '../assets/firefox.png';
import adobeIcon from '../assets/adobe.png';
import spotifyIcon from '../assets/spotify.png';
import steamIcon from '../assets/steam.png';
import powershellIcon from '../assets/powershell.png';
import cmdIcon from '../assets/cmd.png';
import explorerIcon from '../assets/explorer.png';
import taskmgrIcon from '../assets/taskmgr.png';
import appFrameHostIcon from '../assets/applicationframehost.png';
import bgTaskHostIcon from '../assets/backgroundtaskhost.png';
import svchostIcon from '../assets/svchost.png';
import runtimeBrokerIcon from '../assets/runtimebroker.png';
import bashIcon from '../assets/bash.png';
import cargoIcon from '../assets/cargo.png';
import servicesIcon from '../assets/services.png';
import dllhostIcon from '../assets/dllhost.png';
import securityIcon from '../assets/security.png';
import registryIcon from '../assets/registry.png';

interface AppIconProps {
  name: string;
  className?: string;
  size?: number;
  kind?: string; // e.g. 'DesktopApp' | 'Package' | 'Flatpak'
}

export const AppIcon: React.FC<AppIconProps> = ({ 
  name, 
  className = "w-5 h-5 flex-shrink-0", 
  size = 20,
  kind 
}) => {
  const [imgError, setImgError] = useState(false);
  const n = (name || '').toLowerCase().trim();

  // 1. High-fidelity Desktop PNG Icons from OS executables
  let assetSrc: string | null = null;
  let altText = name;

  if (n.includes('antigravity ide') || n.includes('antigravity-ide')) {
    assetSrc = antigravityIdeIcon;
    altText = 'Antigravity IDE';
  } else if (n.includes('antigravity') || n.includes('agy')) {
    assetSrc = antigravityIcon;
    altText = 'Antigravity';
  } else if (n.includes('chrome') || n.includes('google-chrome') || n.includes('chromium')) {
    assetSrc = chromeIcon;
    altText = 'Google Chrome';
  } else if (n.includes('code') || n.includes('vscode') || n.includes('vscodium') || n.includes('cursor')) {
    assetSrc = vscodeIcon;
    altText = 'Visual Studio Code';
  } else if (n.includes('edge') || n.includes('msedge')) {
    assetSrc = edgeIcon;
    altText = 'Microsoft Edge';
  } else if (n.includes('firefox')) {
    assetSrc = firefoxIcon;
    altText = 'Mozilla Firefox';
  } else if (
    n.includes('adobe') || 
    n.includes('acrobat') || 
    n.includes('photoshop') || 
    n.includes('illustrator') || 
    n.includes('premiere') ||
    n.includes('creative cloud')
  ) {
    assetSrc = adobeIcon;
    altText = 'Adobe';
  } else if (n.includes('spotify')) {
    assetSrc = spotifyIcon;
    altText = 'Spotify';
  } else if (n.includes('steam')) {
    assetSrc = steamIcon;
    altText = 'Steam';
  } else if (n.includes('powershell') || n.includes('pwsh')) {
    assetSrc = powershellIcon;
    altText = 'PowerShell';
  } else if (n === 'cmd' || n === 'cmd.exe' || n.includes('conhost')) {
    assetSrc = cmdIcon;
    altText = 'Command Prompt';
  } else if (n.includes('explorer')) {
    assetSrc = explorerIcon;
    altText = 'Windows Explorer';
  } else if (n.includes('taskmgr') || n.includes('task manager')) {
    assetSrc = taskmgrIcon;
    altText = 'Task Manager';
  } else if (
    n.includes('applicationframehost') || 
    n.includes('appactions') || 
    n.includes('appprovisioningplugin')
  ) {
    assetSrc = appFrameHostIcon;
    altText = 'Windows Application Host';
  } else if (n.includes('backgroundtaskhost')) {
    assetSrc = bgTaskHostIcon;
    altText = 'Background Task Host';
  } else if (n.includes('runtimebroker')) {
    assetSrc = runtimeBrokerIcon;
    altText = 'Runtime Broker';
  } else if (n.includes('svchost')) {
    assetSrc = svchostIcon;
    altText = 'Service Host';
  } else if (n.includes('dllhost')) {
    assetSrc = dllhostIcon;
    altText = 'COM Surrogate';
  } else if (n.includes('bash') || n.includes('git-bash')) {
    assetSrc = bashIcon;
    altText = 'Git Bash';
  } else if (n.includes('cargo')) {
    assetSrc = cargoIcon;
    altText = 'Rust Cargo';
  } else if (
    n.includes('[system process]') || 
    n === 'system' || 
    n.includes('system idle') || 
    n.includes('services.exe') || 
    n.includes('smss') || 
    n.includes('csrss') || 
    n.includes('wininit') || 
    n.includes('lsass') ||
    n.includes('sihost') ||
    n.includes('dwm')
  ) {
    assetSrc = servicesIcon;
    altText = 'System Process';
  } else if (
    n.includes('security') || 
    n.includes('defender') || 
    n.includes('antivirus') || 
    n.includes('anticheat') || 
    n.includes('anticheatexpert') || 
    n.includes('easyanticheat') || 
    n.includes('vanguard')
  ) {
    assetSrc = securityIcon;
    altText = 'Security Service';
  } else if (n.includes('registry') || n.includes('regedit')) {
    assetSrc = registryIcon;
    altText = 'Registry';
  }

  // Consistent strict sizing style
  const sizeStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    maxWidth: `${size}px`,
    maxHeight: `${size}px`,
    boxSizing: 'border-box',
  };

  if (assetSrc && !imgError) {
    return (
      <img
        src={assetSrc}
        alt={altText}
        style={sizeStyle}
        className={`${className} object-contain rounded-sm select-none flex-shrink-0`}
        onError={() => setImgError(true)}
        draggable={false}
      />
    );
  }

  // Padding for SVG containers (2px padding for small 20px icons, 4px for 32px icons)
  const padClass = size >= 28 ? 'p-1' : 'p-0.5';

  // 2. Authentic Brand Vector SVGs for other apps
  if (n.includes('discord')) {
    return (
      <div 
        style={sizeStyle} 
        className={`${className} ${padClass} flex items-center justify-center rounded-md bg-[#5865F2] shadow-sm flex-shrink-0 overflow-hidden`}
      >
        <svg viewBox="0 0 127.14 96.36" fill="white" className="w-full h-full">
          <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,0,105.89,105.89,0,0,0,22.75,8.09C2.79,37.8-.82,66.77.25,95.34a105.9,105.9,0,0,0,32.22,16.27,77.7,77.7,0,0,0,6.89-11.11,68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.27-16.28C128.48,63,124.7,34.15,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
        </svg>
      </div>
    );
  }

  if (n.includes('slack')) {
    return (
      <div 
        style={sizeStyle} 
        className={`${className} ${padClass} flex items-center justify-center rounded-md bg-[#4A154B] shadow-sm flex-shrink-0 overflow-hidden`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#E01E5A"/>
          <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#2EB67D"/>
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#36C5F0"/>
          <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#ECB22E"/>
        </svg>
      </div>
    );
  }

  if (n.includes('telegram')) {
    return (
      <div 
        style={sizeStyle} 
        className={`${className} ${padClass} flex items-center justify-center rounded-full bg-[#24A1DE] shadow-sm flex-shrink-0 overflow-hidden`}
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-full h-full -ml-[3%] mt-[2%]">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
        </svg>
      </div>
    );
  }

  if (n.includes('brave')) {
    return (
      <div 
        style={sizeStyle} 
        className={`${className} ${padClass} flex items-center justify-center rounded-md bg-[#FB542B] shadow-sm flex-shrink-0 overflow-hidden`}
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-full h-full">
          <path d="M12 0L5 4v6c0 6.63 7 14 7 14s7-7.37 7-14V4L12 0zm0 4.15l4.5 2.57v3.58c0 3.76-3.19 7.95-4.5 9.38-1.31-1.43-4.5-5.62-4.5-9.38V6.72L12 4.15z"/>
        </svg>
      </div>
    );
  }

  if (n.includes('git')) {
    return (
      <div 
        style={sizeStyle} 
        className={`${className} ${padClass} flex items-center justify-center rounded-md bg-[#F05032] shadow-sm flex-shrink-0 overflow-hidden`}
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-full h-full">
          <path d="M2.6 10.59L10.59 2.6a2 2 0 0 1 2.83 0l7.98 7.99a2 2 0 0 1 0 2.82l-7.99 8a2 2 0 0 1-2.82 0l-7.99-8a2 2 0 0 1 0-2.82zm10.74 3.75v-1.68a2 2 0 0 0-1.02-1.74l-2.01-1.01a2 2 0 1 0-.89 1.79l2.01 1a.5.5 0 0 1 .25.44v1.2a2 2 0 1 0 1.66 0z"/>
        </svg>
      </div>
    );
  }

  if (n.includes('docker')) {
    return (
      <div 
        style={sizeStyle} 
        className={`${className} ${padClass} flex items-center justify-center rounded-md bg-[#2496ED] shadow-sm flex-shrink-0 overflow-hidden`}
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-full h-full">
          <path d="M13.98 11.08h1.68V9.4h-1.68v1.68zm-2.02 0h1.68V9.4h-1.68v1.68zm-2.01 0h1.68V9.4H9.95v1.68zm-2.02 0h1.68V9.4H7.93v1.68zm-2.01 0h1.68V9.4H5.92v1.68zm6.04-2.02h1.68V7.38h-1.68v1.68zm-2.01 0h1.68V7.38H9.95v1.68zm-2.02 0h1.68V7.38H7.93v1.68zm4.03-2.02h1.68V5.36h-1.68v1.68zm10.02 5.04c-.39-.27-1.42-.37-2.19-.13-.18-.87-.8-1.57-1.57-1.89l-.51-.21-.3.45c-.47.69-.74 1.57-.74 2.53 0 .28.02.55.07.82-.44.23-1.32.32-1.78.32H1.6c-.34 0-.6.28-.6.62 0 3.86 3.14 7.02 7.02 7.02 4.96 0 9.17-3.41 10.36-8.24.89-.04 1.78-.36 2.38-.89l.48-.42-.6-.47z"/>
        </svg>
      </div>
    );
  }

  if (n.includes('python')) {
    return (
      <div 
        style={sizeStyle} 
        className={`${className} ${padClass} flex items-center justify-center rounded-md bg-zinc-900 border border-zinc-800 shadow-sm flex-shrink-0 overflow-hidden`}
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M11.92 2c-4.43 0-4.15 1.92-4.15 1.92l.01 2h4.22v.6H6.18S2 6.04 2 10.49c0 4.45 3.65 4.3 3.65 4.3h2.18v-1.72s-.12-2.18 2.15-2.18h4.22s2.07.03 2.07-2.07V4.74S16.63 2 11.92 2zm-1.82 1.34a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6z" fill="#3776AB"/>
          <path d="M12.08 22c4.43 0 4.15-1.92 4.15-1.92l-.01-2H12v-.6h5.82s4.18.48 4.18-3.97c0-4.45-3.65-4.3-3.65-4.3h-2.18v1.72s.12 2.18-2.15 2.18H9.8s-2.07-.03-2.07 2.07v4.08S7.37 22 12.08 22zm1.82-1.34a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6z" fill="#FFD43B"/>
        </svg>
      </div>
    );
  }

  if (n.includes('node') || n.includes('npm') || n.includes('bun')) {
    return (
      <div 
        style={sizeStyle} 
        className={`${className} ${padClass} flex items-center justify-center rounded-md bg-[#339933]/15 border border-[#339933]/40 flex-shrink-0 overflow-hidden`}
      >
        <svg viewBox="0 0 24 24" fill="#339933" className="w-full h-full">
          <path d="M12 2l9 5.2v10.4L12 23l-9-5.4V7.2L12 2zm0 2.3L5 8.4v7.3l7 4.1 7-4.1V8.4l-7-4.1z"/>
        </svg>
      </div>
    );
  }

  if (kind === 'Package') {
    return (
      <div 
        style={sizeStyle} 
        className={`${className} ${padClass} flex items-center justify-center rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0 overflow-hidden`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="m7.5 4.27 9 5.15"/>
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          <path d="m3.3 7 8.7 5 8.7-5"/>
          <path d="M12 22V12"/>
        </svg>
      </div>
    );
  }

  if (kind === 'Flatpak') {
    return (
      <div 
        style={sizeStyle} 
        className={`${className} ${padClass} flex items-center justify-center rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400 flex-shrink-0 overflow-hidden`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <rect width="18" height="18" x="3" y="3" rx="2"/>
          <path d="m9 8 6 4-6 4Z"/>
        </svg>
      </div>
    );
  }

  // 3. Default sleek desktop app icon with identical fixed size
  return (
    <div 
      style={sizeStyle} 
      className={`${className} ${padClass} flex items-center justify-center rounded-md bg-[#18181b] border border-gray-700/60 text-gray-300 shadow-sm flex-shrink-0 overflow-hidden`}
      title={name}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18" />
        <circle cx="7" cy="6" r="1" fill="currentColor" />
        <circle cx="11" cy="6" r="1" fill="currentColor" />
      </svg>
    </div>
  );
};

export default AppIcon;
