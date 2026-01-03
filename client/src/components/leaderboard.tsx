import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import type { StudentWithAttendance } from "@shared/schema";

interface LeaderboardProps {
  students: StudentWithAttendance[];
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-amber-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-slate-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-700" />;
    default:
      return <span className="text-sm font-medium text-muted-foreground w-5 text-center">{rank}</span>;
  }
}

function getPercentageColor(percentage: number) {
  if (percentage >= 90) return "bg-emerald-500";
  if (percentage >= 75) return "bg-emerald-400";
  if (percentage >= 50) return "bg-amber-500";
  return "bg-red-500";
}

export function Leaderboard({ students }: LeaderboardProps) {
  const rankedStudents = [...students]
    .sort((a, b) => {
      if (b.attendancePercentage !== a.attendancePercentage) {
        return b.attendancePercentage - a.attendancePercentage;
      }
      return b.presentSessions - a.presentSessions;
    })
    .slice(0, 10);

  if (rankedStudents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Add students to see the leaderboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rankedStudents.map((student, index) => (
          <div
            key={student.id}
            className="flex items-center gap-3 p-2 rounded-lg hover-elevate"
            data-testid={`leaderboard-row-${index}`}
          >
            <div className="flex items-center justify-center w-8">
              {getRankIcon(index + 1)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{student.name}</p>
              <p className="text-xs text-muted-foreground">
                {student.presentSessions}/{student.totalSessions} sessions
              </p>
            </div>
            <Badge className={`${getPercentageColor(student.attendancePercentage)} text-white`}>
              {Math.round(student.attendancePercentage)}%
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
