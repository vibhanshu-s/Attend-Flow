import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Student } from "@shared/schema";
import { Users, ArrowLeft, User, ChevronRight } from "lucide-react";
import logoUrl from "@assets/image_1768149327948.png";

export default function SelectStudent() {
  const [, setLocation] = useLocation();
  const { guardianMobile, selectStudent, logout } = useAuth();

  const { data: students, isLoading } = useQuery<Student[]>({
    queryKey: [`/api/guardian/students?mobile=${guardianMobile}`],
    enabled: !!guardianMobile,
  });

  if (!guardianMobile) {
    setLocation("/guardian/login");
    return null;
  }

  const handleSelectStudent = (student: Student) => {
    selectStudent(student);
    setLocation("/guardian/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" className="gap-2" onClick={logout}>
            <ArrowLeft className="h-4 w-4" />
            Logout
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-fit mb-4">
              <img src={logoUrl} alt="Agarwal Tutorial" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl">Select Student</CardTitle>
            <CardDescription>
              Choose which student to view
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : students && students.length > 0 ? (
              students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  className="w-full p-4 rounded-lg border flex items-center gap-4 hover-elevate active-elevate-2 text-left"
                  data-testid={`button-select-student-${student.id}`}
                >
                  <div className="p-2 rounded-full bg-muted">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{student.name}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No students found</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
