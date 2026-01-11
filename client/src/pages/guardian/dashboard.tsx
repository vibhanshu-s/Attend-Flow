import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Heatmap } from "@/components/heatmap";
import { AttendancePercentage } from "@/components/attendance-percentage";
import type { HeatmapData, StudentWithAttendance } from "@shared/schema";
import { User, LogOut, Calendar, BarChart3, Users } from "lucide-react";
import logoUrl from "@assets/image_1768149327948.png";

export default function GuardianDashboard() {
  const [, setLocation] = useLocation();
  const { selectedStudent, logout, guardianMobile } = useAuth();

  const { data: studentData, isLoading: isLoadingStudent } = useQuery<StudentWithAttendance>({
    queryKey: [`/api/students/${selectedStudent?.id}/attendance`],
    enabled: !!selectedStudent?.id,
  });

  const { data: heatmapData, isLoading: isLoadingHeatmap } = useQuery<HeatmapData[]>({
    queryKey: [`/api/students/${selectedStudent?.id}/heatmap`],
    enabled: !!selectedStudent?.id,
  });

  if (!guardianMobile || !selectedStudent) {
    setLocation("/guardian/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleSwitchStudent = () => {
    setLocation("/guardian/select-student");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Agarwal Tutorial" className="h-8 w-auto" />
            <div>
              <p className="font-semibold" data-testid="text-student-name">{selectedStudent.name}</p>
              <p className="text-sm text-muted-foreground">Agarwal Tutorial</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSwitchStudent} data-testid="button-switch-student">
              <Users className="h-4 w-4 mr-2" />
              Switch
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              Overall Attendance
            </CardTitle>
            <CardDescription>
              Based on finalized sessions only
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingStudent ? (
              <div className="flex justify-center">
                <Skeleton className="h-40 w-40 rounded-full" />
              </div>
            ) : studentData ? (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <AttendancePercentage percentage={studentData.attendancePercentage} size="lg" />
                <div className="text-center md:text-left space-y-2">
                  <div>
                    <p className="text-3xl font-bold" data-testid="text-present-sessions">
                      {studentData.presentSessions}
                    </p>
                    <p className="text-sm text-muted-foreground">Sessions Present</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold" data-testid="text-total-sessions">
                      {studentData.totalSessions}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No attendance data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Attendance History
            </CardTitle>
            <CardDescription>
              Last 50 sessions shown below
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingHeatmap ? (
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 50 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square w-8 h-8 md:w-10 md:h-10" />
                ))}
              </div>
            ) : (
              <Heatmap data={heatmapData || []} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
