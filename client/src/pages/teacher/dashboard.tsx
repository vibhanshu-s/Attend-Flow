import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { StatsCard } from "@/components/stats-card";
import { SessionStatusBadge } from "@/components/session-status-badge";
import { AttendanceToggle } from "@/components/attendance-toggle";
import { Leaderboard } from "@/components/leaderboard";
import { AttendancePercentage } from "@/components/attendance-percentage";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Batch, Session, Student, StudentWithAttendance, Attendance, AttendanceStatus, SessionStatus } from "@shared/schema";
import {
  CalendarCheck,
  LogOut,
  Plus,
  Loader2,
  Users,
  Calendar,
  BarChart3,
  CheckCircle,
  Clock,
  BookOpen,
  User,
} from "lucide-react";
import { z } from "zod";
import logoUrl from "@assets/image_1768149327948.png";

export default function TeacherDashboard() {
  const [, setLocation] = useLocation();
  const { teacher, logout } = useAuth();
  const { toast } = useToast();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [showCreateSessionDialog, setShowCreateSessionDialog] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("sessions");

  const { data: batches, isLoading: isLoadingBatches } = useQuery<Batch[]>({
    queryKey: [`/api/teacher/${teacher?.id}/batches`],
    enabled: !!teacher?.id,
  });

  const { data: sessions, isLoading: isLoadingSessions } = useQuery<Session[]>({
    queryKey: [`/api/batches/${selectedBatchId}/sessions`],
    enabled: !!selectedBatchId,
  });

  const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: [`/api/batches/${selectedBatchId}/students`],
    enabled: !!selectedBatchId,
  });

  const { data: studentsWithAttendance, isLoading: isLoadingAnalytics } = useQuery<StudentWithAttendance[]>({
    queryKey: [`/api/batches/${selectedBatchId}/analytics`],
    enabled: !!selectedBatchId,
  });

  const { data: sessionAttendance, isLoading: isLoadingAttendance } = useQuery<Attendance[]>({
    queryKey: [`/api/sessions/${selectedSessionId}/attendance`],
    enabled: !!selectedSessionId,
  });

  if (!teacher) {
    setLocation("/teacher/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const selectedBatch = batches?.find((b) => b.id === selectedBatchId);
  const selectedSession = sessions?.find((s) => s.id === selectedSessionId);

  const averageAttendance = studentsWithAttendance
    ? studentsWithAttendance.reduce((sum, s) => sum + s.attendancePercentage, 0) / (studentsWithAttendance.length || 1)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Agarwal Tutorial" className="h-8 w-auto" />
            <span className="font-bold hidden sm:block">Agarwal Tutorial</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:block">{teacher.name}</span>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Select Batch</label>
          <Select value={selectedBatchId || ""} onValueChange={(value) => { setSelectedBatchId(value); setSelectedSessionId(null); setActiveTab("sessions"); }}>
            <SelectTrigger className="w-full max-w-xs" data-testid="select-batch">
              <SelectValue placeholder="Choose a batch" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingBatches ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : batches && batches.length > 0 ? (
                batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No batches available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {!selectedBatchId ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Select a batch to get started</p>
              <p className="text-muted-foreground">Choose a batch from the dropdown above to manage sessions and attendance</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="sessions" data-testid="tab-sessions">
                <Calendar className="h-4 w-4 mr-2" />
                Sessions
              </TabsTrigger>
              <TabsTrigger value="attendance" data-testid="tab-attendance">
                <CheckCircle className="h-4 w-4 mr-2" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sessions" className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-lg font-semibold">Sessions for {selectedBatch?.name}</h2>
                <Button onClick={() => setShowCreateSessionDialog(true)} data-testid="button-create-session">
                  <Plus className="h-4 w-4 mr-2" />
                  New Session
                </Button>
              </div>

              {isLoadingSessions ? (
                <div className="space-y-4">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              ) : sessions && sessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.time.localeCompare(a.time)).map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      isSelected={selectedSessionId === session.id}
                      onSelect={() => {
                      setSelectedSessionId(session.id);
                      setActiveTab("attendance");
                    }}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No sessions yet. Click "New Session" to create one.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4">
              {selectedSessionId && selectedSession ? (
                <AttendanceMarkingSection
                  session={selectedSession}
                  students={students || []}
                  attendance={sessionAttendance || []}
                  isLoading={isLoadingStudents || isLoadingAttendance}
                />
              ) : selectedSessionId ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Select a session first</p>
                    <p className="text-muted-foreground">Go to the Sessions tab and select a session to mark attendance</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {isLoadingAnalytics ? (
                <div className="space-y-4">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-64" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatsCard
                      title="Average Attendance"
                      value={`${Math.round(averageAttendance)}%`}
                      icon={BarChart3}
                    />
                    <StatsCard
                      title="Total Students"
                      value={studentsWithAttendance?.length || 0}
                      icon={Users}
                    />
                    <StatsCard
                      title="Total Sessions"
                      value={sessions?.filter(s => s.status !== "DRAFT").length || 0}
                      icon={Calendar}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Leaderboard students={studentsWithAttendance || []} />
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          All Students
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                        {studentsWithAttendance?.map((student) => (
                          <div key={student.id} className="flex items-center gap-3 p-2 rounded-lg border">
                            <div className="p-2 rounded-full bg-muted">
                              <User className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{student.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {student.presentSessions}/{student.totalSessions} sessions
                              </p>
                            </div>
                            <AttendancePercentage percentage={student.attendancePercentage} size="sm" showLabel={false} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <CreateSessionDialog
        open={showCreateSessionDialog}
        onOpenChange={setShowCreateSessionDialog}
        batchId={selectedBatchId || ""}
        teacherId={teacher.id}
        onSessionCreated={(sessionId) => {
          setSelectedSessionId(sessionId);
          setActiveTab("attendance");
        }}
      />
    </div>
  );
}

function SessionCard({
  session,
  isSelected,
  onSelect,
}: {
  session: Session;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-150 active:scale-[0.98] ${isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"}`}
      onClick={onSelect}
      data-testid={`session-card-${session.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{session.date}</CardTitle>
          <SessionStatusBadge status={session.status} />
        </div>
        <CardDescription>{session.time}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function AttendanceMarkingSection({
  session,
  students,
  attendance,
  isLoading,
}: {
  session: Session;
  students: Student[];
  attendance: Attendance[];
  isLoading: boolean;
}) {
  const { toast } = useToast();
  
  const canEdit = true;

  const getStudentAttendance = (studentId: string): AttendanceStatus => {
    const record = attendance.find((a) => a.studentId === studentId);
    return record?.status || "NOT_MARKED";
  };

  const markAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: AttendanceStatus }) => {
      return await apiRequest("POST", `/api/sessions/${session.id}/attendance`, { studentId, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${session.id}/attendance`] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to mark attendance", description: error.message, variant: "destructive" });
    },
  });

  const finalizeSessionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/sessions/${session.id}/finalize`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/batches/${session.batchId}/sessions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/batches/${session.batchId}/analytics`] });
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${session.id}/attendance`] });
      toast({ title: "Session finalized successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to finalize session", description: error.message, variant: "destructive" });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: async (status: AttendanceStatus) => {
      return await apiRequest("POST", `/api/sessions/${session.id}/attendance/bulk`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${session.id}/attendance`] });
      toast({ title: "All students marked" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to mark all", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Mark Attendance</h2>
          <p className="text-sm text-muted-foreground">
            {session.date} at {session.time}
          </p>
        </div>
        <SessionStatusBadge status={session.status} />
      </div>

      {canEdit && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllMutation.mutate("PRESENT")}
            disabled={markAllMutation.isPending}
            data-testid="button-mark-all-present"
          >
            {markAllMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mark All Present
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllMutation.mutate("ABSENT")}
            disabled={markAllMutation.isPending}
            data-testid="button-mark-all-absent"
          >
            Mark All Absent
          </Button>
          {session.status === "DRAFT" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  disabled={finalizeSessionMutation.isPending}
                  data-testid="button-finalize-session"
                >
                  {finalizeSessionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Finalize Session
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Finalize this session?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will publish the session. You can still edit attendance anytime after finalizing.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => finalizeSessionMutation.mutate()} data-testid="button-confirm-finalize">
                    Finalize
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50 transition-colors"
                data-testid={`student-row-${student.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{student.name}</span>
                </div>
                <AttendanceToggle
                  studentId={student.id}
                  status={getStudentAttendance(student.id)}
                  onStatusChange={(status) => markAttendanceMutation.mutate({ studentId: student.id, status })}
                  disabled={markAttendanceMutation.isPending}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateSessionDialog({
  open,
  onOpenChange,
  batchId,
  teacherId,
  onSessionCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  teacherId: string;
  onSessionCreated: (sessionId: string) => void;
}) {
  const { toast } = useToast();

  const sessionFormSchema = z.object({
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
  });

  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const form = useForm({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      date: now.toISOString().split("T")[0],
      time: currentTime,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: { date: string; time: string }) => {
      return await apiRequest("POST", "/api/sessions", {
        ...data,
        batchId,
        teacherId,
      }) as { id: string };
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: [`/api/batches/${batchId}/sessions`] });
      toast({ title: "Session created successfully" });
      form.reset();
      onOpenChange(false);
      onSessionCreated(newSession.id);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create session", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Session</DialogTitle>
          <DialogDescription>Schedule a new class session</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" data-testid="input-session-date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" data-testid="input-session-time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-session">
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Session
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
