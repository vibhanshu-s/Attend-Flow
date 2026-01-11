import { useLocation, Link } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Teacher } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";
import logoUrl from "@assets/image_1768149327948.png";

export default function TeacherLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { loginAsTeacher } = useAuth();
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

  const { data: teachers = [], isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const loginMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      const response = await apiRequest("POST", "/api/teacher/login", { teacherId });
      return response as Teacher;
    },
    onSuccess: (teacher) => {
      loginAsTeacher(teacher);
      toast({
        title: "Login successful",
        description: `Welcome, ${teacher.name}!`,
      });
      setTimeout(() => {
        setLocation("/teacher/dashboard");
      }, 50);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Teacher not found",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId) {
      toast({
        title: "Select a teacher",
        description: "Please select your name from the list",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(selectedTeacherId);
  };

  const selectedTeacher = teachers.find(t => t.teacherId === selectedTeacherId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-fit mb-4">
              <img src={logoUrl} alt="Agarwal Tutorial" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl">Teacher Login</CardTitle>
            <CardDescription>
              Select your name to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-select">Select Teacher</Label>
                <Select
                  value={selectedTeacherId}
                  onValueChange={setSelectedTeacherId}
                  disabled={teachersLoading}
                >
                  <SelectTrigger data-testid="select-teacher">
                    <SelectValue placeholder={teachersLoading ? "Loading teachers..." : "Choose your name"} />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.teacherId}>
                        {teacher.name} ({teacher.teacherId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {teachers.length === 0 && !teachersLoading && (
                  <p className="text-sm text-muted-foreground">
                    No teachers available. Ask your admin to create your account.
                  </p>
                )}
              </div>

              {selectedTeacher && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{selectedTeacher.name}</p>
                  <p className="text-xs text-muted-foreground">ID: {selectedTeacher.teacherId}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending || !selectedTeacherId}
                data-testid="button-submit"
              >
                {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
