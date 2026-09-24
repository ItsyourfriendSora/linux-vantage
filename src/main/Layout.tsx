import { ReactNode } from "react";
import Navbar from "../components/Navbar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen w-full bg-[#111827] text-white flex flex-col font-sans overflow-hidden">
      {/* Navbar UI Component */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

