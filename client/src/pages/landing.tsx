import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Shield, GraduationCap, Users, BarChart3, ClipboardCheck } from "lucide-react";
import logoUrl from "@assets/image_1768149327948.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Agarwal Tutorial" className="h-10 w-auto" />
            <span className="text-xl font-bold hidden sm:block">Agarwal Tutorial</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <section className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img src={logoUrl} alt="Agarwal Tutorial" className="h-24 w-auto" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Agarwal Tutorial
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Attendance Management System
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <div className="mx-auto p-3 rounded-lg bg-primary/10 w-fit mb-2">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Admin</CardTitle>
                <CardDescription>Manage teachers, batches, and students</CardDescription>
              </CardHeader>
              <CardContent className="pt-2 space-y-2">
                <Link href="/admin/login">
                  <Button className="w-full" data-testid="link-admin-login">
                    Admin Login
                  </Button>
                </Link>
                <Link href="/admin/signup">
                  <Button variant="outline" className="w-full" data-testid="link-admin-signup">
                    Create Account
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
                <CardDescription>Mark attendance and view analytics</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Link href="/teacher/login">
                  <Button className="w-full" data-testid="link-teacher-login">
                    Teacher Login
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
                <CardDescription>View attendance records</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Link href="/guardian/login">
                  <Button className="w-full" data-testid="link-guardian-login">
                    Guardian Login
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="mx-auto p-3 rounded-lg bg-emerald-500/10 w-fit mb-4">
              <ClipboardCheck className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="font-semibold mb-2">Session-Based Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Track attendance per session with 12-hour edit window.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto p-3 rounded-lg bg-amber-500/10 w-fit mb-4">
              <BarChart3 className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="font-semibold mb-2">Visual Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Color-coded heatmaps for easy attendance insights.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto p-3 rounded-lg bg-primary/10 w-fit mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Role-Based Access</h3>
            <p className="text-sm text-muted-foreground">
              Separate views for admins, teachers, and guardians.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          Agarwal Tutorial - Attendance Management System
        </div>
      </footer>
    </div>
  );
}
