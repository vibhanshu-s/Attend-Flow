import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Shield, GraduationCap, Users, CalendarCheck, BarChart3, ClipboardCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">TuitionTrack</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple Attendance Management
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            A scalable tuition attendance system with session-based tracking, visual analytics, and separate experiences for teachers and guardians.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <div className="mx-auto p-3 rounded-lg bg-primary/10 w-fit mb-2">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Admin</CardTitle>
                <CardDescription>Manage teachers, batches & students</CardDescription>
              </CardHeader>
              <CardContent className="pt-2 space-y-2">
                <Link href="/admin/login">
                  <Button className="w-full" data-testid="link-admin-login">
                    Login as Admin
                  </Button>
                </Link>
                <Link href="/admin/signup">
                  <Button variant="outline" className="w-full" data-testid="link-admin-signup">
                    Create Admin Account
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <div className="mx-auto p-3 rounded-lg bg-primary/10 w-fit mb-2">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Teacher</CardTitle>
                <CardDescription>Mark attendance & view analytics</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Link href="/teacher/login">
                  <Button className="w-full" data-testid="link-teacher-login">
                    Login as Teacher
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <div className="mx-auto p-3 rounded-lg bg-primary/10 w-fit mb-2">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Guardian</CardTitle>
                <CardDescription>View child's attendance</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Link href="/guardian/login">
                  <Button className="w-full" data-testid="link-guardian-login">
                    Login as Guardian
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="mx-auto p-3 rounded-lg bg-emerald-500/10 w-fit mb-4">
              <ClipboardCheck className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="font-semibold mb-2">Session-Based Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Track attendance per session with automatic locking after midnight.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto p-3 rounded-lg bg-amber-500/10 w-fit mb-4">
              <BarChart3 className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="font-semibold mb-2">Visual Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Color-coded heatmaps and percentage tracking for easy insights.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto p-3 rounded-lg bg-primary/10 w-fit mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Role-Based Access</h3>
            <p className="text-sm text-muted-foreground">
              Separate experiences for admins, teachers, and guardians.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          TuitionTrack - Simple, Scalable Attendance Management
        </div>
      </footer>
    </div>
  );
}
