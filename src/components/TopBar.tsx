import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function TopBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Check initial maximized state
    const checkMaximized = async () => {
      try {
        const max: boolean = await invoke("is_window_maximized");
        setIsMaximized(max);
      } catch {
        try {
          const { getCurrentWindow } = await import("@tauri-apps/api/window");
          const max = await getCurrentWindow().isMaximized();
          setIsMaximized(max);
        } catch (err) {
          console.debug("Failed to get window state:", err);
        }
      }
    };

    checkMaximized();

    const handleResize = () => {
      checkMaximized();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMinimize = async () => {
    try {
      await invoke("minimize_window");
    } catch {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().minimize();
      } catch (err) {
        console.error("Failed to minimize window:", err);
      }
    }
  };

  const handleToggleMaximize = async () => {
    try {
      const newMax: boolean = await invoke("toggle_maximize_window");
      setIsMaximized(newMax);
    } catch {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().toggleMaximize();
        const max = await getCurrentWindow().isMaximized();
        setIsMaximized(max);
      } catch (err) {
        console.error("Failed to toggle maximize window:", err);
      }
    }
  };

  const handleClose = async () => {
    try {
      await invoke("close_window");
    } catch {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        await getCurrentWindow().close();
      } catch (err) {
        console.error("Failed to close window:", err);
      }
    }
  };

  return (
    <div
      data-tauri-drag-region
      onDoubleClick={handleToggleMaximize}
      className="w-full h-9 flex items-center justify-between bg-[#0A0A0A] select-none z-50 shrink-0 border-b border-gray-900/50"
    >
      {/* Draggable spacer area */}
      <div data-tauri-drag-region className="flex-1 h-full cursor-default" />

      {/* Window Controls (Minimize, Maximize/Restore, Close) */}
      <div className="flex items-center h-full">
        {/* Minimize Button */}
        <button
          type="button"
          onClick={handleMinimize}
          title="Minimize"
          className="w-11 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors duration-150 cursor-pointer focus:outline-none"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="10" height="1" fill="currentColor" />
          </svg>
        </button>

        {/* Maximize / Restore Button */}
        <button
          type="button"
          onClick={handleToggleMaximize}
          title={isMaximized ? "Restore Down" : "Maximize"}
          className="w-11 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors duration-150 cursor-pointer focus:outline-none"
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 2.5V0.5H9.5V7.5H7.5" stroke="currentColor" strokeWidth="1" />
              <rect x="0.5" y="2.5" width="7" height="7" stroke="currentColor" strokeWidth="1" fill="#0A0A0A" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          )}
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          title="Close"
          className="w-11 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#e81123] active:bg-[#c4101e] transition-colors duration-150 cursor-pointer focus:outline-none"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
