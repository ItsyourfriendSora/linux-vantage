import "./App.css";
import Layout from "./main/Layout";

import HeaderBanner from "./components/dashboard/HeaderBanner";
import DashboardCard from "./components/dashboard/DashboardCard";
import SystemTools from "./components/dashboard/SystemTools";
import LegionEdgeCard from "./components/dashboard/LegionEdgeCard";
import QuickSettingsCard from "./components/dashboard/QuickSettingsCard";

function App() {
  return (
    <Layout>
      <HeaderBanner />
      
      {/* Dashboard Content Grid */}
      <div className="p-8 flex gap-8">
        
        {/* Left Column */}
        <div className="flex-1 flex flex-col">
          <DashboardCard />
          <SystemTools />
        </div>
        
        {/* Right Column */}
        <div className="w-80 flex flex-col">
          <LegionEdgeCard />
          <QuickSettingsCard />
        </div>
        
      </div>
    </Layout>
  );
}

export default App;
