import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage({ mode = "login" }: { mode?: "login" | "signup" }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(mode === "login");
  
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  
  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { username: "", password: "" }
  });

  const onSubmit = async (data: InsertUser) => {
    try {
      if (isLogin) {
        await loginMutation.mutateAsync(data);
      } else {
        await registerMutation.mutateAsync(data);
      }
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <Star className="w-6 h-6 text-white fill-current" />
          </div>
          <h2 className="text-3xl font-bold font-display text-gray-900">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-2 text-gray-600">
            {isLogin ? "Enter your details to access your dashboard." : "Start getting better reviews today."}
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{isLogin ? "Sign In" : "Sign Up"}</CardTitle>
            <CardDescription>
              {isLogin ? "New here? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-primary font-semibold hover:underline"
              >
                {isLogin ? "Create an account" : "Log in"}
              </button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Email</Label>
                <Input 
                  id="username" 
                  type="email" 
                  placeholder="you@company.com" 
                  className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  {...form.register("username")} 
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  {...form.register("password")} 
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
