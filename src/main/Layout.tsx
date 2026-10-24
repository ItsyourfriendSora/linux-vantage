import { ReactNode, useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      // Base design width is 1600px for Dashboard grid.
      const currentWidth = window.innerWidth;
      let newScale = currentWidth / 1600;
      
      // Limit scaling
      if (newScale < 0.7) newScale = 0.7;
      if (newScale > 1.5) newScale = 1.5;
      
      setScale(newScale);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Init on mount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDashboard = activeTab === 'Dashboard';

  return (
    <div className="flex fixed inset-0 h-full w-full bg-black text-white font-sans overflow-hidden select-none overscroll-none">
      {/* Sidebar on the Left */}
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />

      {/* Main Content Area (Right Side) */}
      <div className="flex flex-col flex-1 h-full min-h-0 relative overflow-hidden bg-[#0A0A0A] overscroll-none">
        <TopBar />
        
        {isDashboard ? (
          <main className="flex-grow flex flex-col overflow-y-auto overflow-x-hidden overscroll-none min-h-0">
            <div style={{ zoom: scale } as React.CSSProperties} className="flex flex-col w-full h-full min-h-max overscroll-none">
              {children}
            </div>
          </main>
        ) : (
          <main className="flex-grow flex flex-col overflow-hidden h-full min-h-0 overscroll-none">
            <div className="flex flex-col w-full h-full min-h-0 overflow-hidden overscroll-none">
              {children}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
