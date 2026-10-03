interface DonutCardProps {
  title: string;
  value: number;
  color: string;
  label: string;
}

export default function DonutCard({ title, value, color, label }: DonutCardProps) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="bg-[#121212] rounded-3xl p-6 shadow-sm border border-gray-900 flex flex-col h-72">
      <div className="w-full text-left">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <p className="text-xs text-gray-500 font-medium mt-1 truncate" title={label}>{label}</p>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="14"
              fill="transparent"
              className="text-gray-800"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={color}
              strokeWidth="14"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{value}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
