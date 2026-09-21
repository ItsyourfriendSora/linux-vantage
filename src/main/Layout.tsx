import { ReactNode } from "react";
import Navbar from "../components/Navbar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navbar UI Component */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow p-8 flex flex-col items-center justify-center">
        {children}
      </main>

      {/* Footer (Optional) */}
      <footer className="text-center p-4 text-gray-500 text-sm border-t border-gray-800">
        &copy; {new Date().getFullYear()} Dont Fear Them
      </footer>
    </div>
  );
}

