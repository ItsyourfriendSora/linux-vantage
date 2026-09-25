import { useState } from "react";
import "./App.css";
import Layout from "./main/Layout";

import DonutCard from "./components/dashboard/DonutCard";
import LineChartCard from "./components/dashboard/LineChartCard";
import VennCard from "./components/dashboard/VennCard";
import BarChartCard from "./components/dashboard/BarChartCard";
import ListCard from "./components/dashboard/ListCard";

import Processes from "./Processes/Processes";
import Performance from "./Performance/Performance";

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard'); // Default to Dashboard now

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      
      {activeTab === 'Dashboard' && (
        <div className="p-8 w-full max-w-[1600px] mx-auto h-full flex flex-col">
          <div className="grid grid-cols-3 gap-6 flex-1">
            <div className="col-span-2 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-6">
                <DonutCard title="CPU Usage" value={70} color="#3b82f6" label="Core i7" />
                <DonutCard title="GPU Load" value={8} color="#eab308" label="RTX 4060" />
              </div>
              <LineChartCard />
              <div className="grid grid-cols-2 gap-6">
                <VennCard />
                <BarChartCard />
              </div>
            </div>
            <div className="col-span-1">
               <ListCard />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Processes' && (
        <Processes />
      )}

      {activeTab === 'Performance' && (
        <Performance />
      )}

      {/* Placeholder for other tabs */}
      {activeTab !== 'Dashboard' && activeTab !== 'Processes' && activeTab !== 'Performance' && (
        <div className="p-8 w-full h-full flex items-center justify-center text-gray-500">
           {activeTab} content goes here...
        </div>
      )}
      
    </Layout>
  );
}

export default App;
