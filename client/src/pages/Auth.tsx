import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { z } from "zod";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
        };
      };
    };
  }
}

export default function AuthPage({ mode = "login" }: { mode?: "login" | "signup" }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+1");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  // Login: require both so we never send empty values to the server
  const loginSchema = z.object({
    emailOrUsername: z.string().min(1, "Email or username is required"),
    password: z.string().min(1, "Password is required"),
  });

  // Signup: all fields mandatory; username generated from email in onSubmit.
  const signupSchema = z.object({
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .refine((v) => (v || "").replace(/\D/g, "").length >= 7, "Enter a valid phone number (at least 7 digits)"),
  });

  const form = useForm<InsertUser & { emailOrUsername?: string }>({
    resolver: zodResolver(isLogin ? loginSchema : signupSchema),
    defaultValues: { 
      username: "", 
      password: "", 
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      emailOrUsername: "",
    },
  });

  // Sync state with route when mode prop changes
  useEffect(() => {
    setIsLogin(mode === "login");
  }, [mode]);

  // Reset form when switching between login/signup and update route
  const toggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    setLoginError(null);
    setSignupError(null);
    form.reset();
    setLocation(newMode ? "/login" : "/signup");
  };

  // Handle Google Sign-In callback
  const handleGoogleSignIn = async (response: any) => {
    try {
      const res = await fetch("/api/auth/google/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Google sign-in failed");
      }

      const user = await res.json();
      
      // Update the user query cache and invalidate businesses
      queryClient.setQueryData([api.auth.me.path], user);
      queryClient.invalidateQueries({ queryKey: [api.businesses.list.path] });
      
      // Redirect to dashboard on success
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign in with Google",
      });
    }
  };

  // Initialize Google Identity Services
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return;
    }

    // Wait for Google Identity Services script to load
    const initGoogleSignIn = () => {
      if (!window.google?.accounts?.id) {
        // Script not loaded yet, try again in 100ms
        setTimeout(initGoogleSignIn, 100);
        return;
      }

      if (!googleButtonRef.current) return;

      // Clear any existing button
      googleButtonRef.current.innerHTML = "";

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleSignIn,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          width: 300,
          text: isLogin ? "signin_with" : "signup_with", // Different text for login vs signup
        });
      } catch (error) {
        console.warn(
          "Google Sign-In: Add your current origin to Google Cloud Console → Credentials → OAuth 2.0 Client → Authorized JavaScript origins. " +
          "For local dev, add http://localhost:5000 and http://localhost:5173 (and http://127.0.0.1:* if you use that)."
        );
      }
    };

    // Start initialization
    if (window.google?.accounts?.id) {
      initGoogleSignIn();
    } else {
      // Wait for script to load
      const checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          initGoogleSignIn();
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => clearInterval(checkInterval), 10000);
    }

    // Cleanup function
    return () => {
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin, handleGoogleSignIn]);

  const onSubmit = async (data: InsertUser & { emailOrUsername?: string }) => {
    setLoginError(null);
    setSignupError(null);
    try {
      if (isLogin) {
        const username = (data.emailOrUsername || data.email || data.username || "").trim();
        const password = (data.password ?? "").trim();
        if (!username || !password) {
          setLoginError("Email/username and password are required.");
          return;
        }
        await loginMutation.mutateAsync({ username, password });
        setLocation("/dashboard");
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
        const localPart = (data.email || "").split("@")[0] || "";
        const baseUsername = data.username || localPart || `user_${Date.now()}`;
        const username =
          baseUsername.length >= 3 ? baseUsername : `${baseUsername}${Date.now().toString().slice(-4)}`.slice(0, 50);
        const signupData: InsertUser = {
          username,
          password: data.password,
          email: data.email,
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          phoneNumber: (data.phoneNumber ?? "").trim(),
        };
        const user = await registerMutation.mutateAsync(signupData);
        // Wait a moment to ensure session is established
        await new Promise(resolve => setTimeout(resolve, 100));
        setLocation("/dashboard");
      }
    } catch (error: any) {
      const message = error?.message || "Something went wrong.";
      if (isLogin) setLoginError(message);
      else setSignupError(message);
      toast({
        variant: "destructive",
        title: isLogin ? "Sign-in failed" : "Registration failed",
        description: message,
      });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-[hsl(var(--app-surface))] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-300/20 rounded-full blur-3xl" />
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
          <Link href="/" className="block mb-6">
            <img 
src="/revsboost-logo.png" 
            alt="RevsBoost Logo"
              className="h-20 w-auto object-contain"
            />
          </Link>
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
              {/* Google Sign In Button - Google Identity Services */}
              {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                <div className="mb-6">
                  <div ref={googleButtonRef} className="w-full flex justify-center"></div>
                </div>
              )}

              {/* Divider */}
              <div className="relative mb-6">
                <Separator className="bg-slate-200" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white px-4 text-sm text-slate-500">or</span>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {isLogin ? (
                  /* Login Form */
                  <>
                    {loginError && (
                      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
                        {loginError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="emailOrUsername" className="text-sm font-semibold">
                        Email address or Username
                      </Label>
                      <Input
                        id="emailOrUsername"
                        placeholder="Enter your email address or username"
                        className="h-12 rounded-xl border-slate-200 bg-white focus:border-[hsl(var(--ring))] focus:ring-[hsl(var(--ring))]/20 transition-all"
                        {...form.register("emailOrUsername", {
                          onChange: (e) => {
                            setLoginError(null);
                            const value = e.target.value;
                            if (value.includes("@")) {
                              form.setValue("email", value);
                              form.setValue("username", "");
                            } else {
                              form.setValue("username", value);
                              form.setValue("email", "");
                            }
                          },
                        })}
                      />
                      {form.formState.errors.emailOrUsername && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.emailOrUsername.message}
                        </p>
                      )}
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
                          className="h-12 rounded-xl border-slate-200 bg-white focus:border-[hsl(var(--ring))] focus:ring-[hsl(var(--ring))]/20 transition-all pr-12"
                          {...form.register("password", {
                            onChange: () => setLoginError(null),
                          })}
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
                      <div className="flex justify-end">
                        <Link href="/forgot-password" className="text-sm text-primary font-medium hover:underline transition-colors">
                          Forgot password?
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Signup Form */
                  <>
                    {signupError && (
                      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
                        {signupError}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-semibold">
                          First name
                        </Label>
                        <Input
                          id="firstName"
                          placeholder="First name"
                          className="h-12 rounded-xl border-slate-200 bg-white focus:border-[hsl(var(--ring))] focus:ring-[hsl(var(--ring))]/20 transition-all"
                          {...form.register("firstName")}
                        />
                        {form.formState.errors.firstName && (
                          <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-semibold">
                          Last name
                        </Label>
                        <Input
                          id="lastName"
                          placeholder="Last name"
                          className="h-12 rounded-xl border-slate-200 bg-white focus:border-[hsl(var(--ring))] focus:ring-[hsl(var(--ring))]/20 transition-all"
                          {...form.register("lastName")}
                        />
                        {form.formState.errors.lastName && (
                          <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
                        )}
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
                        className="h-12 rounded-xl border-slate-200 bg-white focus:border-[hsl(var(--ring))] focus:ring-[hsl(var(--ring))]/20 transition-all"
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
                        Phone number
                      </Label>
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => {
                            const newCode = e.target.value;
                            setCountryCode(newCode);
                            const digits = (form.getValues("phoneNumber") || "").replace(/\D/g, "");
                            form.setValue("phoneNumber", `${newCode} ${digits}`.trim(), { shouldValidate: true });
                          }}
                          className="h-12 px-3 rounded-xl border border-slate-200 bg-white focus:border-[hsl(var(--ring))] focus:ring-[hsl(var(--ring))]/20 transition-all text-sm font-medium"
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
                          className="h-12 rounded-xl border-slate-200 bg-white focus:border-[hsl(var(--ring))] focus:ring-[hsl(var(--ring))]/20 transition-all flex-1"
                          {...form.register("phoneNumber", {
                            onChange: (e) => {
                              const digits = (e.target.value || "").replace(/\D/g, "");
                              form.setValue("phoneNumber", `${countryCode} ${digits}`.trim(), { shouldValidate: true });
                            },
                          })}
                        />
                      </div>
                      {form.formState.errors.phoneNumber && (
                        <p className="text-sm text-red-500">{form.formState.errors.phoneNumber.message}</p>
                      )}
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
                          className="h-12 rounded-xl border-slate-200 bg-white focus:border-[hsl(var(--ring))] focus:ring-[hsl(var(--ring))]/20 transition-all pr-12"
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
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
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
                      className="text-slate-700 font-semibold hover:text-slate-900 hover:underline transition-colors"
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={toggleMode}
                      className="text-slate-700 font-semibold hover:text-slate-900 hover:underline transition-colors"
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
