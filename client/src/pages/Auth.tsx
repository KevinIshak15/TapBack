import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { z } from "zod";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function AuthPage({ mode = "login" }: { mode?: "login" | "signup" }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+1");

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  // Create a custom schema for login
  const loginSchema = z.object({
    emailOrUsername: z.string().min(1, "Email or username is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const form = useForm<InsertUser & { adminCode?: string; emailOrUsername?: string }>({
    resolver: zodResolver(isLogin ? loginSchema : insertUserSchema),
    defaultValues: { 
      username: "", 
      password: "", 
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      adminCode: "",
      emailOrUsername: "",
    },
  });

  // Reset form when switching between login/signup
  const toggleMode = () => {
    setIsLogin(!isLogin);
    form.reset();
  };

  const onSubmit = async (data: InsertUser & { emailOrUsername?: string }) => {
    try {
      if (isLogin) {
        // For login, use emailOrUsername as username (backend uses username for auth)
        const loginData = {
          username: data.emailOrUsername || data.email || data.username || "",
          password: data.password,
        };
        await loginMutation.mutateAsync(loginData);
      } else {
        // For signup, generate username from email if not provided
        if (!data.email) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Email address is required",
          });
          return;
        }
        const signupData: InsertUser = {
          username: data.username || data.email.split("@")[0] || `user_${Date.now()}`,
          password: data.password,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          adminCode: data.adminCode,
        };
        await registerMutation.mutateAsync(signupData);
      }
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        {/* Logo and Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <img 
            src="/tapback-logo.png" 
            alt="TapBack Logo" 
            className="h-20 w-auto object-contain mb-6"
          />
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-slate-600 text-center">
            {isLogin
              ? "Sign in to continue to your dashboard"
              : "Welcome! Please fill in the details to get started."}
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-strong border-slate-200/60 shadow-2xl">
            <CardContent className="p-6 md:p-8">
              {/* Google Sign In Button */}
              {!isLogin && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 rounded-xl border-slate-200 bg-white hover:bg-slate-50 mb-6"
                  onClick={async () => {
                    try {
                      // Check if Google OAuth is configured by making a test request
                      const response = await fetch("/api/auth/google", { 
                        method: "GET",
                        redirect: "manual" // Don't follow redirects automatically
                      });
                      
                      if (response.status === 503) {
                        toast({
                          variant: "destructive",
                          title: "Google Sign-In Not Configured",
                          description: "Google OAuth credentials are not set up. Please contact the administrator.",
                        });
                        return;
                      }
                      
                      // If we get a redirect (302/303), follow it manually
                      if (response.status === 302 || response.status === 303) {
                        const location = response.headers.get("Location");
                        if (location) {
                          window.location.href = location;
                        } else {
                          window.location.href = "/api/auth/google";
                        }
                      } else {
                        // Otherwise, just redirect normally
                        window.location.href = "/api/auth/google";
                      }
                    } catch (error) {
                      console.error("Google sign-in error:", error);
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to initiate Google sign-in. Please try again.",
                      });
                    }
                  }}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              )}

              {/* Divider */}
              {!isLogin && (
                <div className="relative mb-6">
                  <Separator className="bg-slate-200" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white px-4 text-sm text-slate-500">or</span>
                  </div>
                </div>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {isLogin ? (
                  /* Login Form */
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="emailOrUsername" className="text-sm font-semibold">
                        Email address or Username
                      </Label>
                      <Input
                        id="emailOrUsername"
                        placeholder="Enter your email address or username"
                        className="h-12 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                        {...form.register("emailOrUsername")}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Auto-detect if it's an email or username
                          if (value.includes("@")) {
                            form.setValue("email", value);
                            form.setValue("username", "");
                          } else {
                            form.setValue("username", value);
                            form.setValue("email", "");
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="h-12 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all pr-12"
                          {...form.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {form.formState.errors.password && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  /* Signup Form */
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-semibold">
                          First name <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                        </Label>
                        <Input
                          id="firstName"
                          placeholder="First name"
                          className="h-12 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                          {...form.register("firstName")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-semibold">
                          Last name <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                        </Label>
                        <Input
                          id="lastName"
                          placeholder="Last name"
                          className="h-12 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                          {...form.register("lastName")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold">
                        Email address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        className="h-12 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                        {...form.register("email")}
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-sm font-semibold">
                        Phone number <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                      </Label>
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="h-12 px-3 rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all text-sm font-medium"
                        >
                          <option value="+1">CA</option>
                          <option value="+1">US</option>
                          <option value="+44">UK</option>
                          <option value="+61">AU</option>
                        </select>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="Enter your phone number"
                          className="h-12 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all flex-1"
                          {...form.register("phoneNumber")}
                          onChange={(e) => {
                            form.setValue("phoneNumber", `${countryCode} ${e.target.value}`);
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="h-12 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all pr-12"
                          {...form.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {form.formState.errors.password && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminCode" className="text-sm font-semibold">
                        Admin Code <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                      </Label>
                      <Input
                        id="adminCode"
                        type="password"
                        placeholder="Enter admin code if applicable"
                        className="h-12 rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                        {...form.register("adminCode")}
                      />
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </>
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Continue"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              {/* Bottom Link */}
              <div className="mt-6 text-center text-sm text-slate-600">
                {isLogin ? (
                  <>
                    New here?{" "}
                    <button
                      onClick={toggleMode}
                      className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={toggleMode}
                      className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
