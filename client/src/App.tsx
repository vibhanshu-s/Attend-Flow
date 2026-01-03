import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AdminLogin from "@/pages/admin/login";
import AdminSignup from "@/pages/admin/signup";
import AdminDashboard from "@/pages/admin/dashboard";
import TeacherLogin from "@/pages/teacher/login";
import TeacherDashboard from "@/pages/teacher/dashboard";
import GuardianLogin from "@/pages/guardian/login";
import GuardianSelectStudent from "@/pages/guardian/select-student";
import GuardianDashboard from "@/pages/guardian/dashboard";

function getStoredRole(): string | null {
  try {
    const stored = localStorage.getItem("tuition_auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.role;
    }
  } catch {
    // ignore
  }
  return null;
}

function ProtectedAdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { role } = useAuth();
  const storedRole = getStoredRole();
  if (role !== "admin" && storedRole !== "admin") {
    return <Redirect to="/admin/login" />;
  }
  return <Component />;
}

function ProtectedTeacherRoute({ component: Component }: { component: React.ComponentType }) {
  const { role } = useAuth();
  const storedRole = getStoredRole();
  if (role !== "teacher" && storedRole !== "teacher") {
    return <Redirect to="/teacher/login" />;
  }
  return <Component />;
}

function ProtectedGuardianRoute({ component: Component }: { component: React.ComponentType }) {
  const { role } = useAuth();
  const storedRole = getStoredRole();
  if (role !== "guardian" && storedRole !== "guardian") {
    return <Redirect to="/guardian/login" />;
  }
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/signup" component={AdminSignup} />
      <Route path="/admin/dashboard">
        {() => <ProtectedAdminRoute component={AdminDashboard} />}
      </Route>
      
      <Route path="/teacher/login" component={TeacherLogin} />
      <Route path="/teacher/dashboard">
        {() => <ProtectedTeacherRoute component={TeacherDashboard} />}
      </Route>
      
      <Route path="/guardian/login" component={GuardianLogin} />
      <Route path="/guardian/select-student">
        {() => <ProtectedGuardianRoute component={GuardianSelectStudent} />}
      </Route>
      <Route path="/guardian/dashboard">
        {() => <ProtectedGuardianRoute component={GuardianDashboard} />}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
