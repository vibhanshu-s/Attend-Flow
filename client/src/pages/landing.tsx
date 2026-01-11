import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import logoUrl from "@assets/image_1768149327948.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-end">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-10">
          <img src={logoUrl} alt="Agarwal Tutorial" className="h-24 w-auto mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold">
            Agarwal Tutorial
          </h1>
        </div>
        
        <div className="w-full max-w-xs space-y-3">
          <Link href="/admin/login">
            <Button className="w-full" size="lg" data-testid="link-admin-login">
              Admin Login
            </Button>
          </Link>
          <Link href="/teacher/login">
            <Button className="w-full" size="lg" variant="secondary" data-testid="link-teacher-login">
              Teacher Login
            </Button>
          </Link>
          <Link href="/guardian/login">
            <Button className="w-full" size="lg" variant="outline" data-testid="link-guardian-login">
              Guardian Login
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t py-4">
        <div className="text-center text-sm text-muted-foreground">
          Agarwal Tutorial
        </div>
      </footer>
    </div>
  );
}
