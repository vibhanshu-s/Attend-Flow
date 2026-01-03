import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { StatsCard } from "@/components/stats-card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertTeacherSchema, insertBatchSchema, insertStudentSchema } from "@shared/schema";
import type { Teacher, Batch, Student, BatchWithDetails, InsertTeacher, InsertBatch, InsertStudent } from "@shared/schema";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  CalendarCheck,
  LogOut,
  Plus,
  Loader2,
  UserPlus,
  FolderPlus,
  UserCheck,
} from "lucide-react";
import { z } from "zod";

type AdminView = "overview" | "teachers" | "batches" | "students";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { admin, logout } = useAuth();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<AdminView>("overview");
  const [showTeacherDialog, setShowTeacherDialog] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [showStudentDialog, setShowStudentDialog] = useState(false);

  const { data: stats, isLoading: isLoadingStats } = useQuery<{
    totalTeachers: number;
    totalBatches: number;
    totalStudents: number;
    totalSessions: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: teachers, isLoading: isLoadingTeachers } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const { data: batches, isLoading: isLoadingBatches } = useQuery<BatchWithDetails[]>({
    queryKey: ["/api/batches"],
  });

  const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  useEffect(() => {
    if (!admin) {
      setLocation("/admin/login");
    }
  }, [admin, setLocation]);

  if (!admin) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const menuItems = [
    { id: "overview" as AdminView, label: "Overview", icon: LayoutDashboard },
    { id: "teachers" as AdminView, label: "Teachers", icon: GraduationCap },
    { id: "batches" as AdminView, label: "Batches", icon: BookOpen },
    { id: "students" as AdminView, label: "Students", icon: Users },
  ];

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-6 w-6 text-primary" />
              <span className="font-bold">TuitionTrack</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setCurrentView(item.id)}
                        isActive={currentView === item.id}
                        data-testid={`nav-${item.id}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-4 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:block">{admin.name}</span>
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-8">
            {currentView === "overview" && (
              <OverviewSection
                stats={stats}
                isLoading={isLoadingStats}
                onCreateTeacher={() => setShowTeacherDialog(true)}
                onCreateBatch={() => setShowBatchDialog(true)}
                onCreateStudent={() => setShowStudentDialog(true)}
              />
            )}
            {currentView === "teachers" && (
              <TeachersSection
                teachers={teachers}
                isLoading={isLoadingTeachers}
                onCreateTeacher={() => setShowTeacherDialog(true)}
              />
            )}
            {currentView === "batches" && (
              <BatchesSection
                batches={batches}
                teachers={teachers}
                isLoading={isLoadingBatches}
                onCreateBatch={() => setShowBatchDialog(true)}
              />
            )}
            {currentView === "students" && (
              <StudentsSection
                students={students}
                batches={batches}
                isLoading={isLoadingStudents}
                onCreateStudent={() => setShowStudentDialog(true)}
              />
            )}
          </main>
        </div>
      </div>

      <CreateTeacherDialog open={showTeacherDialog} onOpenChange={setShowTeacherDialog} />
      <CreateBatchDialog open={showBatchDialog} onOpenChange={setShowBatchDialog} teachers={teachers || []} />
      <CreateStudentDialog open={showStudentDialog} onOpenChange={setShowStudentDialog} batches={batches || []} />
    </SidebarProvider>
  );
}

function OverviewSection({
  stats,
  isLoading,
  onCreateTeacher,
  onCreateBatch,
  onCreateStudent,
}: {
  stats?: { totalTeachers: number; totalBatches: number; totalStudents: number; totalSessions: number };
  isLoading: boolean;
  onCreateTeacher: () => void;
  onCreateBatch: () => void;
  onCreateStudent: () => void;
}) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <StatsCard title="Teachers" value={stats?.totalTeachers || 0} icon={GraduationCap} />
              <StatsCard title="Batches" value={stats?.totalBatches || 0} icon={BookOpen} />
              <StatsCard title="Students" value={stats?.totalStudents || 0} icon={Users} />
              <StatsCard title="Sessions" value={stats?.totalSessions || 0} icon={CalendarCheck} />
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover-elevate cursor-pointer" onClick={onCreateTeacher}>
            <CardHeader>
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-2">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Create Teacher</CardTitle>
              <CardDescription>Add a new teacher to the system</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover-elevate cursor-pointer" onClick={onCreateBatch}>
            <CardHeader>
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-2">
                <FolderPlus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Create Batch</CardTitle>
              <CardDescription>Create a new class batch</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover-elevate cursor-pointer" onClick={onCreateStudent}>
            <CardHeader>
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-2">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Add Student</CardTitle>
              <CardDescription>Enroll a new student</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}

function TeachersSection({
  teachers,
  isLoading,
  onCreateTeacher,
}: {
  teachers?: Teacher[];
  isLoading: boolean;
  onCreateTeacher: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-lg font-semibold">Teachers</h2>
        <Button onClick={onCreateTeacher} data-testid="button-create-teacher">
          <Plus className="h-4 w-4 mr-2" />
          Add Teacher
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : teachers && teachers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <Card key={teacher.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{teacher.name}</CardTitle>
                    <CardDescription className="font-mono text-xs">{teacher.teacherId}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No teachers yet. Click "Add Teacher" to create one.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BatchesSection({
  batches,
  teachers,
  isLoading,
  onCreateBatch,
}: {
  batches?: BatchWithDetails[];
  teachers?: Teacher[];
  isLoading: boolean;
  onCreateBatch: () => void;
}) {
  const getTeacherName = (teacherId: string) => {
    return teachers?.find((t) => t.id === teacherId)?.name || "Unknown";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-lg font-semibold">Batches</h2>
        <Button onClick={onCreateBatch} data-testid="button-create-batch">
          <Plus className="h-4 w-4 mr-2" />
          Create Batch
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : batches && batches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <Card key={batch.id}>
              <CardHeader>
                <CardTitle className="text-lg">{batch.name}</CardTitle>
                {batch.description && (
                  <CardDescription>{batch.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {getTeacherName(batch.teacherId)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {batch.studentCount} students
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No batches yet. Click "Create Batch" to add one.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StudentsSection({
  students,
  batches,
  isLoading,
  onCreateStudent,
}: {
  students?: Student[];
  batches?: BatchWithDetails[];
  isLoading: boolean;
  onCreateStudent: () => void;
}) {
  const getBatchName = (batchId: string) => {
    return batches?.find((b) => b.id === batchId)?.name || "Unknown";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-lg font-semibold">Students</h2>
        <Button onClick={onCreateStudent} data-testid="button-create-student">
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : students && students.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <Card key={student.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{student.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {getBatchName(student.batchId)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground font-mono">{student.guardianMobile}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No students yet. Click "Add Student" to enroll one.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CreateTeacherDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  
  const teacherFormSchema = insertTeacherSchema.extend({
    name: z.string().min(1, "Name is required"),
    teacherId: z.string().min(1, "Teacher ID is required"),
  });

  const form = useForm<InsertTeacher>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: "",
      teacherId: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertTeacher) => {
      return await apiRequest("POST", "/api/teachers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Teacher created successfully" });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create teacher", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Teacher</DialogTitle>
          <DialogDescription>Add a new teacher to the system. Teachers can log in by selecting their name from a list.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" data-testid="input-teacher-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher ID</FormLabel>
                  <FormControl>
                    <Input placeholder="TCH001" data-testid="input-teacher-id" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-teacher">
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Teacher
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CreateBatchDialog({
  open,
  onOpenChange,
  teachers,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teachers: Teacher[];
}) {
  const { toast } = useToast();

  const batchFormSchema = insertBatchSchema.extend({
    name: z.string().min(1, "Batch name is required"),
    teacherId: z.string().min(1, "Please select a teacher"),
  });

  const form = useForm<InsertBatch>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      name: "",
      teacherId: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertBatch) => {
      return await apiRequest("POST", "/api/batches", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Batch created successfully" });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create batch", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Batch</DialogTitle>
          <DialogDescription>Create a new class batch</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Class 10 - Mathematics" data-testid="input-batch-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Teacher</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-teacher">
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.teacherId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Class description..." data-testid="input-batch-description" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={mutation.isPending || teachers.length === 0} data-testid="button-submit-batch">
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Batch
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CreateStudentDialog({
  open,
  onOpenChange,
  batches,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batches: BatchWithDetails[];
}) {
  const { toast } = useToast();

  const studentFormSchema = insertStudentSchema.extend({
    name: z.string().min(1, "Student name is required"),
    batchId: z.string().min(1, "Please select a batch"),
    guardianMobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  });

  const form = useForm<InsertStudent>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      batchId: "",
      guardianMobile: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertStudent) => {
      return await apiRequest("POST", "/api/students", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Student added successfully" });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add student", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
          <DialogDescription>Enroll a new student in a batch</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" data-testid="input-student-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="batchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to Batch</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-batch">
                        <SelectValue placeholder="Select a batch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="guardianMobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guardian Mobile</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="9876543210" data-testid="input-guardian-mobile" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={mutation.isPending || batches.length === 0} data-testid="button-submit-student">
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Student
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
