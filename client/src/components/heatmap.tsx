import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, X } from "lucide-react";
import type { HeatmapData, AttendanceStatus } from "@shared/schema";

interface HeatmapProps {
  data: HeatmapData[];
  maxSessions?: number;
}

function getStatusColor(status: AttendanceStatus): string {
  switch (status) {
    case "PRESENT":
      return "bg-emerald-500 dark:bg-emerald-600";
    case "ABSENT":
      return "bg-red-500 dark:bg-red-600";
    case "NOT_MARKED":
      return "bg-muted border-2 border-dashed border-muted-foreground/30";
  }
}

function getStatusIcon(status: AttendanceStatus) {
  switch (status) {
    case "PRESENT":
      return <Check className="h-3 w-3 text-white" />;
    case "ABSENT":
      return <X className="h-3 w-3 text-white" />;
    case "NOT_MARKED":
      return null;
  }
}

function getStatusLabel(status: AttendanceStatus): string {
  switch (status) {
    case "PRESENT":
      return "Present";
    case "ABSENT":
      return "Absent";
    case "NOT_MARKED":
      return "Not Marked";
  }
}

export function Heatmap({ data, maxSessions = 100 }: HeatmapProps) {
  const displayData = data.slice(0, maxSessions);

  if (displayData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <div className="text-lg font-medium">No sessions yet</div>
        <div className="text-sm">Attendance data will appear here</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-10 gap-1 md:gap-2">
        {displayData.map((session, index) => (
          <Tooltip key={session.sessionId || index}>
            <TooltipTrigger asChild>
              <div
                className={`aspect-square w-8 h-8 md:w-10 md:h-10 rounded-md flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${getStatusColor(session.status)}`}
                data-testid={`heatmap-cell-${index}`}
              >
                {getStatusIcon(session.status)}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-sm">
              <div className="font-medium">{getStatusLabel(session.status)}</div>
              <div className="text-muted-foreground">{session.date}</div>
              <div className="text-muted-foreground">{session.time}</div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center">
            <Check className="h-2.5 w-2.5 text-white" />
          </div>
          <span>Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500 flex items-center justify-center">
            <X className="h-2.5 w-2.5 text-white" />
          </div>
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted border-2 border-dashed border-muted-foreground/30" />
          <span>Not Marked</span>
        </div>
      </div>
    </div>
  );
}
