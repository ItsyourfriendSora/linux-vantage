import { useState, useEffect } from "react";
import { invoke } from '@tauri-apps/api/core';
import "./App.css";
import Layout from "./main/Layout";

import DonutCard from "./components/dashboard/DonutCard";
import LineChartCard from "./components/dashboard/LineChartCard";
import VennCard from "./components/dashboard/VennCard";
import BarChartCard from "./components/dashboard/BarChartCard";
import ListCard from "./components/dashboard/ListCard";

import Processes from "./Processes/Processes";
import Performance from "./Performance/Performance";
import { startHistoryPolling } from "./store/historyStore";
import AppHistory from "./AppHistory/AppHistory";
import AntiVirus from "./AntiVirus/AntiVirus";

// Start polling history when the app initializes
startHistoryPolling();

interface SystemPerformance {
  cpu_usage: number;
  cpu_name: string;
  temperature: number;
}

interface GpuInfo {
  name: string;
  usage: number;
}

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard'); // Default to Dashboard now
  
  const [cpuUsage, setCpuUsage] = useState(0);
  const [cpuName, setCpuName] = useState('CPU');
  const [gpuUsage, setGpuUsage] = useState(0);
  const [gpuName, setGpuName] = useState('GPU');
  const [temperatureHistory, setTemperatureHistory] = useState<number[]>(Array(20).fill(0));

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeTab === 'Dashboard') {
      const fetchData = async () => {
        try {
          const sysPerf: SystemPerformance = await invoke('get_system_performance');
          setCpuUsage(Math.round(sysPerf.cpu_usage));
          setCpuName(sysPerf.cpu_name || 'CPU');

          setTemperatureHistory(prev => {
            const next = [...prev, sysPerf.temperature];
            if (next.length > 20) {
              next.shift();
            }
            return next;
          });

          const gpuInfo: GpuInfo = await invoke('get_gpu_info');
          setGpuUsage(Math.round(gpuInfo.usage));
          setGpuName(gpuInfo.name || 'GPU');
        } catch (e) {
          console.error(e);
        }
      };

      fetchData();
      interval = setInterval(fetchData, 1500);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      
      {activeTab === 'Dashboard' && (
        <div className="p-8 w-full max-w-[1600px] mx-auto h-full flex flex-col">
          <div className="grid grid-cols-3 gap-6 flex-1">
            <div className="col-span-2 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-6">
                <DonutCard title="CPU Usage" value={cpuUsage} color="#3b82f6" label={cpuName} />
                <DonutCard title="GPU Load" value={gpuUsage} color="#eab308" label={gpuName} />
              </div>
              <LineChartCard data={temperatureHistory} />
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

      {activeTab === 'App History' && (
        <AppHistory />
      )}

      {activeTab === 'Anti Virus' && (
        <AntiVirus />
      )}

      {/* Placeholder for other tabs */}
      {activeTab !== 'Dashboard' && activeTab !== 'Processes' && activeTab !== 'Performance' && activeTab !== 'App History' && activeTab !== 'Anti Virus' && (
        <div className="p-8 w-full h-full flex items-center justify-center text-gray-500">
           {activeTab} content goes here...
        </div>
      )}
      
    </Layout>
  );
}

export default App;
