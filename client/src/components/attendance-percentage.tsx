interface AttendancePercentageProps {
  percentage: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function AttendancePercentage({ percentage, size = "md", showLabel = true }: AttendancePercentageProps) {
  const sizeClasses = {
    sm: { container: "w-16 h-16", text: "text-lg", stroke: 4 },
    md: { container: "w-28 h-28", text: "text-2xl", stroke: 6 },
    lg: { container: "w-40 h-40", text: "text-4xl", stroke: 8 },
  };

  const { container, text, stroke } = sizeClasses[size];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 75) return "text-emerald-500";
    if (percentage >= 50) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${container}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className={`transition-all duration-500 ${getColor()}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${text}`} data-testid="attendance-percentage-value">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="text-sm text-muted-foreground font-medium">Attendance</span>
      )}
    </div>
  );
}
