import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface SystemPerformance {
  cpu_usage: number;
  cpu_name: string;
  cpu_frequency: number;
  cpu_cores: number;
  total_memory: number;
  used_memory: number;
  uptime: number;
  temperature: number;
}

interface DiskInfo {
  name: string;
  disk_type: string;
  mount_point: string;
  total_space: number;
  available_space: number;
  file_system: string;
  is_removable: boolean;
}

interface BatteryInfo {
  has_battery: boolean;
  percentage: number;
  is_charging: boolean;
  power_line_status: string;
}

interface MetricItem {
  id: string;
  label: string;
  shortLabel: string;
  value: number;
  displayValue: string;
  subtext: string;
  color: string;
  hoverColor: string;
  glowColor: string;
  icon: string;
}

export default function VennCard() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // System states
  const [metrics, setMetrics] = useState<MetricItem[]>([
    {
      id: "perf",
      label: "Performance",
      shortLabel: "Perf",
      value: 24,
      displayValue: "24%",
      subtext: "CPU Active Load",
      color: "#F43F5E",
      hoverColor: "#FB7185",
      glowColor: "rgba(244, 63, 94, 0.4)",
      icon: "⚡",
    },
    {
      id: "ram",
      label: "RAM",
      shortLabel: "RAM",
      value: 58,
      displayValue: "58%",
      subtext: "9.2 / 16.0 GB",
      color: "#A855F7",
      hoverColor: "#C084FC",
      glowColor: "rgba(168, 85, 247, 0.4)",
      icon: "💾",
    },
    {
      id: "storage",
      label: "Memory (C: + D:)",
      shortLabel: "C: + D:",
      value: 51,
      displayValue: "51%",
      subtext: "1.2 TB / 2.3 TB",
      color: "#38BDF8",
      hoverColor: "#7DD3FC",
      glowColor: "rgba(56, 189, 248, 0.4)",
      icon: "💿",
    },
    {
      id: "battery",
      label: "Baterai",
      shortLabel: "BAT",
      value: 95,
      displayValue: "95%",
      subtext: "Charging",
      color: "#2DD4BF",
      hoverColor: "#5EEAD4",
      glowColor: "rgba(45, 212, 191, 0.4)",
      icon: "🔋",
    },
  ]);

  // Fetch real telemetry data
  useEffect(() => {
    let isMounted = true;

    const fetchSystemMetrics = async () => {
      try {
        // 1. CPU & RAM
        const sysPerf = await invoke<SystemPerformance>("get_system_performance").catch(() => null);
        // 2. Disks (Storage)
        const disks = await invoke<DiskInfo[]>("get_disks").catch(() => null);
        // 3. Battery
        const battery = await invoke<BatteryInfo>("get_battery_info").catch(() => null);

        if (!isMounted) return;

        // Calculate Performance (CPU)
        const cpuUsage = sysPerf ? Math.min(100, Math.max(1, Math.round(sysPerf.cpu_usage))) : 24;
        const cpuCores = sysPerf?.cpu_cores || 8;

        // Calculate RAM
        let ramPercent = 50;
        let ramUsedFormatted = "8.0 GB";
        let ramTotalFormatted = "16.0 GB";
        if (sysPerf && sysPerf.total_memory > 0) {
          const usedGB = sysPerf.used_memory / (1024 * 1024 * 1024);
          const totalGB = sysPerf.total_memory / (1024 * 1024 * 1024);
          ramPercent = Math.min(100, Math.max(1, Math.round((sysPerf.used_memory / sysPerf.total_memory) * 100)));
          ramUsedFormatted = `${usedGB.toFixed(1)} GB`;
          ramTotalFormatted = `${totalGB.toFixed(1)} GB`;
        }

        // Calculate Storage (Disk Memory C: + D: total)
        let storagePercent = 51;
        let storageUsedFormatted = "1.2 TB";
        let storageTotalFormatted = "2.3 TB";
        let diskLabel = "Memory (C: + D:)";
        let diskShortLabel = "C: + D:";

        if (disks && disks.length > 0) {
          // Identify fixed/local drives (e.g. C:, D:)
          const fixedDisks = disks.filter(
            (d) => !d.is_removable || d.mount_point.toUpperCase().includes("C:") || d.mount_point.toUpperCase().includes("D:")
          );
          const targetList = fixedDisks.length > 0 ? fixedDisks : disks;

          const totalBytes = targetList.reduce((acc, d) => acc + d.total_space, 0);
          const availBytes = targetList.reduce((acc, d) => acc + d.available_space, 0);
          const usedBytes = Math.max(0, totalBytes - availBytes);

          // Get drive letters like "C: + D:"
          const letters = targetList
            .map((d) => d.mount_point.replace(/[\\/]/g, "").trim().toUpperCase())
            .filter(Boolean);
          const uniqueLetters = Array.from(new Set(letters));
          const driveHeader = uniqueLetters.length > 0 ? uniqueLetters.join(" + ") : "C: + D:";
          diskLabel = `Memory (${driveHeader})`;
          diskShortLabel = driveHeader;

          if (totalBytes > 0) {
            storagePercent = Math.min(100, Math.max(1, Math.round((usedBytes / totalBytes) * 100)));
            const usedGB = usedBytes / (1024 * 1024 * 1024);
            const totalGB = totalBytes / (1024 * 1024 * 1024);
            storageUsedFormatted = usedGB >= 1000 ? `${(usedGB / 1024).toFixed(1)} TB` : `${Math.round(usedGB)} GB`;
            storageTotalFormatted = totalGB >= 1000 ? `${(totalGB / 1024).toFixed(1)} TB` : `${Math.round(totalGB)} GB`;
          }
        }

        // Calculate Battery
        let batteryPercent = 95;
        let batterySubtext = "Charging";
        if (battery) {
          batteryPercent = Math.min(100, Math.max(0, battery.percentage));
          if (!battery.has_battery) {
            batterySubtext = "AC Power (Plugged In)";
          } else if (battery.is_charging) {
            batterySubtext = "Charging (AC)";
          } else {
            batterySubtext = `${batteryPercent}% • On Battery`;
          }
        }

        setMetrics([
          {
            id: "perf",
            label: "Performance",
            shortLabel: "Perf",
            value: cpuUsage,
            displayValue: `${cpuUsage}%`,
            subtext: `${cpuCores} Cores Active`,
            color: "#F43F5E",
            hoverColor: "#FB7185",
            glowColor: "rgba(244, 63, 94, 0.45)",
            icon: "⚡",
          },
          {
            id: "ram",
            label: "RAM",
            shortLabel: "RAM",
            value: ramPercent,
            displayValue: `${ramPercent}%`,
            subtext: `${ramUsedFormatted} / ${ramTotalFormatted}`,
            color: "#A855F7",
            hoverColor: "#C084FC",
            glowColor: "rgba(168, 85, 247, 0.45)",
            icon: "💾",
          },
          {
            id: "storage",
            label: diskLabel,
            shortLabel: diskShortLabel,
            value: storagePercent,
            displayValue: `${storagePercent}%`,
            subtext: `${storageUsedFormatted} / ${storageTotalFormatted}`,
            color: "#38BDF8",
            hoverColor: "#7DD3FC",
            glowColor: "rgba(56, 189, 248, 0.45)",
            icon: "💿",
          },
          {
            id: "battery",
            label: "Baterai",
            shortLabel: "BAT",
            value: batteryPercent,
            displayValue: `${batteryPercent}%`,
            subtext: batterySubtext,
            color: "#2DD4BF",
            hoverColor: "#5EEAD4",
            glowColor: "rgba(45, 212, 191, 0.45)",
            icon: "🔋",
          },
        ]);
      } catch (err) {
        console.warn("Failed to fetch system metrics for VennCard:", err);
      }
    };

    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Compute donut geometry
  // Weights ensure all 4 slices remain distinct and visually prominent
  const weights = metrics.map((m) => Math.max(16, m.value));
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);

  // Extra Large SVG Dimensions: Shifted slightly to the right and enlarged
  const svgWidth = 410;
  const svgHeight = 290;
  const cx = 200;
  const cy = 145;
  const outerR = 120;
  const innerR = 70;
  const gapRad = 0.045; // Gap between slices (radians)

  let currentAngle = -Math.PI / 2; // Start from top (12 o'clock)

  const slices = metrics.map((metric, index) => {
    const sliceAngle = (weights[index] / totalWeight) * (2 * Math.PI);
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    const midAngle = (startAngle + endAngle) / 2;
    currentAngle = endAngle;

    // Apply gap
    const arcStart = startAngle + gapRad / 2;
    const arcEnd = endAngle - gapRad / 2;

    const isHovered = hoveredId === metric.id;
    const rOuter = isHovered ? outerR + 7 : outerR;
    const rInner = isHovered ? innerR - 2 : innerR;

    // Outer & inner arc points
    const x1 = cx + rOuter * Math.cos(arcStart);
    const y1 = cy + rOuter * Math.sin(arcStart);
    const x2 = cx + rOuter * Math.cos(arcEnd);
    const y2 = cy + rOuter * Math.sin(arcEnd);
    const x3 = cx + rInner * Math.cos(arcEnd);
    const y3 = cy + rInner * Math.sin(arcEnd);
    const x4 = cx + rInner * Math.cos(arcStart);
    const y4 = cy + rInner * Math.sin(arcStart);

    const largeArcFlag = arcEnd - arcStart > Math.PI ? 1 : 0;
    const pathD = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;

    // Leader / label positions around the enlarged donut ring
    const labelR = outerR + 25;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    const cosMid = Math.cos(midAngle);
    const sinMid = Math.sin(midAngle);

    let textAnchor: "start" | "end" | "middle" = "middle";
    if (cosMid > 0.35) {
      textAnchor = "start";
    } else if (cosMid < -0.35) {
      textAnchor = "end";
    }

    let yOffset1 = -5; // Label name
    let yOffset2 = 16; // Percentage
    if (sinMid < -0.7) {
      yOffset1 = -12;
      yOffset2 = 8;
    } else if (sinMid > 0.7) {
      yOffset1 = 4;
      yOffset2 = 24;
    }

    return {
      metric,
      pathD,
      isHovered,
      labelPos: { x: lx, y: ly, textAnchor, yOffset1, yOffset2 },
      midAngle,
    };
  });

  const activeMetric = metrics.find((m) => m.id === hoveredId);

  return (
    <div className="bg-[#121212] rounded-lg px-4 py-3 shadow-sm border border-gray-900 flex flex-col h-72 relative select-none">
      {/* Header */}
      <div className="mt-1.5 ml-2 mb-1">
        <h3 className="text-white font-semibold text-lg">System Health</h3>
      </div>

      {/* Main Body: Metric List & Large Donut Chart */}
      <div className="flex-1 flex items-center justify-between gap-2 overflow-visible">
        {/* Left Column: Metric Item List */}
        <div className="flex flex-col gap-1.5 shrink-0 z-10 w-[152px] p-0.5">
          {metrics.map((item) => {
            const isHovered = hoveredId === item.id;
            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-colors duration-150 border ${
                  isHovered
                    ? "bg-white/10 border-white/20 shadow-sm"
                    : "bg-transparent border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2 overflow-visible">
                  <span
                    className="w-2.5 h-2.5 rounded-full transition-transform duration-150 shrink-0"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: isHovered ? `0 0 10px ${item.color}` : "none",
                      transform: isHovered ? "scale(1.15)" : "scale(1)",
                    }}
                  ></span>
                  <div className="flex flex-col text-left overflow-visible">
                    <span className="text-[11px] font-semibold text-gray-200 leading-tight whitespace-nowrap">
                      {item.label}
                    </span>
                    <span className="text-[9px] text-gray-400 leading-tight truncate max-w-[85px]">
                      {item.subtext}
                    </span>
                  </div>
                </div>
                <span
                  className="text-[11px] font-extrabold ml-1 shrink-0 transition-colors duration-150"
                  style={{ color: isHovered ? item.color : "#FFFFFF" }}
                >
                  {item.displayValue}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Column: Maximum Size Interactive SVG Donut / Pie Chart */}
        <div className="relative flex-1 flex items-center justify-center h-full w-full overflow-visible">
          <svg
            className="w-full h-full max-h-[265px] overflow-visible"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Glow filters for each slice */}
              {metrics.map((m) => (
                <filter key={m.id} id={`glow-${m.id}`} x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4.5" floodColor={m.color} floodOpacity="0.8" />
                </filter>
              ))}
            </defs>

            {/* Background ambient ring */}
            <circle
              cx={cx}
              cy={cy}
              r={(outerR + innerR) / 2}
              stroke="#1f242d"
              strokeWidth={outerR - innerR}
              fill="none"
            />

            {/* Slices */}
            {slices.map(({ metric, pathD, isHovered }) => (
              <path
                key={metric.id}
                d={pathD}
                fill={isHovered ? metric.hoverColor : metric.color}
                filter={isHovered ? `url(#glow-${metric.id})` : undefined}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredId(metric.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            ))}

            {/* Callout Labels around Donut */}
            {slices.map(({ metric, labelPos, isHovered }) => (
              <g
                key={`label-${metric.id}`}
                className="pointer-events-none transition-all duration-200"
                style={{ opacity: hoveredId && !isHovered ? 0.35 : 1 }}
              >
                {/* Metric Name */}
                <text
                  x={labelPos.x}
                  y={labelPos.y + labelPos.yOffset1}
                  textAnchor={labelPos.textAnchor}
                  className="text-[12px] font-bold fill-gray-300"
                  style={{
                    fill: isHovered ? metric.color : "#d1d5db",
                    fontWeight: isHovered ? "bold" : "600",
                  }}
                >
                  {metric.shortLabel}
                </text>
                {/* Percentage Value */}
                <text
                  x={labelPos.x}
                  y={labelPos.y + labelPos.yOffset2}
                  textAnchor={labelPos.textAnchor}
                  className="text-[15px] font-black"
                  style={{
                    fill: metric.color,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {metric.displayValue}
                </text>
              </g>
            ))}

            {/* Center Hole Content: Appears cleanly on hover */}
            {activeMetric && (
              <g className="transition-all duration-200">
                <text
                  x={cx}
                  y={cy - 9}
                  textAnchor="middle"
                  className="text-[12px] font-bold fill-gray-400 uppercase tracking-widest"
                >
                  {activeMetric.shortLabel}
                </text>
                <text
                  x={cx}
                  y={cy + 19}
                  textAnchor="middle"
                  className="text-[28px] font-black"
                  style={{ fill: activeMetric.color }}
                >
                  {activeMetric.displayValue}
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
