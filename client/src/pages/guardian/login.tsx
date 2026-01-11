import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { loginGuardianSchema, type LoginGuardian, type Student } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Users, ArrowLeft, Loader2 } from "lucide-react";
import logoUrl from "@assets/image_1768149327948.png";

export default function GuardianLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { loginAsGuardian, selectStudent } = useAuth();

  const form = useForm<LoginGuardian>({
    resolver: zodResolver(loginGuardianSchema),
    defaultValues: {
      mobile: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginGuardian) => {
      const response = await apiRequest("POST", "/api/guardian/login", data);
      return response as { students: Student[] };
    },
    onSuccess: (data) => {
      const mobile = form.getValues("mobile");
      loginAsGuardian(mobile);
      
      if (data.students.length === 1) {
        selectStudent(data.students[0]);
        toast({
          title: "Login successful",
          description: `Viewing attendance for ${data.students[0].name}`,
        });
        setTimeout(() => {
          setLocation("/guardian/dashboard");
        }, 50);
      } else if (data.students.length > 1) {
        setTimeout(() => {
          setLocation("/guardian/select-student");
        }, 50);
      } else {
        toast({
          title: "No students found",
          description: "No students are linked to this mobile number",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Mobile number not found",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginGuardian) => {
    loginMutation.mutate(data);
  };

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
            <CardTitle className="text-2xl">Guardian Login</CardTitle>
            <CardDescription>
              Enter your registered mobile number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="9876543210"
                          data-testid="input-mobile"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                  data-testid="button-submit"
                >
                  {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  View Attendance
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
