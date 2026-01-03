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
import { loginTeacherSchema, type LoginTeacher, type Teacher } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";

export default function TeacherLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { loginAsTeacher } = useAuth();

  const form = useForm<LoginTeacher>({
    resolver: zodResolver(loginTeacherSchema),
    defaultValues: {
      teacherId: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginTeacher) => {
      const response = await apiRequest("POST", "/api/teacher/login", data);
      return response as Teacher;
    },
    onSuccess: (teacher) => {
      loginAsTeacher(teacher);
      toast({
        title: "Login successful",
        description: `Welcome back, ${teacher.name}!`,
      });
      setTimeout(() => {
        setLocation("/teacher/dashboard");
      }, 50);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid teacher ID or password",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginTeacher) => {
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
            <div className="mx-auto p-3 rounded-lg bg-primary/10 w-fit mb-4">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Teacher Login</CardTitle>
            <CardDescription>
              Sign in with your teacher ID to manage attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="teacherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teacher ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="TCH001"
                          data-testid="input-teacher-id"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          data-testid="input-password"
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
                  Sign In
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
