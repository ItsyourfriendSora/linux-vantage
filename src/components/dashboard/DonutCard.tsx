interface DonutCardProps {
  title: string;
  value: number;
  color: string;
  label: string;
}

export default function DonutCard({ title, value, color, label }: DonutCardProps) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="bg-[#121212] rounded-3xl p-6 shadow-sm border border-gray-900 flex flex-col items-center justify-center h-72">
      <h3 className="text-white font-semibold text-lg mb-6 w-full text-left">{title}</h3>
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="transform -rotate-90 w-40 h-40">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="16"
            fill="transparent"
            className="text-gray-800"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={color}
            strokeWidth="16"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{value}%</span>
          <span className="text-xs text-gray-500 font-medium">{label}</span>
        </div>
      </div>
    </div>
  );
}
