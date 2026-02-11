import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AppShell } from "@/components/app/AppShell";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

const inputClass = "rounded-xl border-slate-200 bg-white";
const labelClass = "text-sm font-medium text-slate-700";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useUser();
  const { toast } = useToast();

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [resetLinkSending, setResetLinkSending] = useState(false);
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const accountEmail = (user?.email?.trim() || (user?.username && /@/.test(user.username) ? user.username?.trim() : "") || "") as string;
  const hasEmail = accountEmail.length > 0;

  const onSendResetLink = async () => {
    if (!hasEmail || !accountEmail) {
      toast({ variant: "destructive", title: "No email", description: "Your account has no email on file." });
      return;
    }
    setResetLinkSending(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: accountEmail.toLowerCase() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Request failed");
      setResetLinkSent(true);
      toast({
        title: "Reset link sent",
        description: "If an account exists for that email, you'll receive a link shortly. Check your inbox and spam folder.",
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Something went wrong." });
    } finally {
      setResetLinkSending(false);
    }
  };

  const onUpdatePassword = async (data: PasswordForm) => {
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update password");
      }
      passwordForm.reset();
      setPasswordOpen(false);
      toast({ title: "Password updated", description: "You can use your new password to sign in." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setPasswordSaving(false);
    }
  };

  useEffect(() => {
    if (!userLoading && !user) setLocation("/login");
  }, [user, userLoading, setLocation]);

  if (userLoading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!user) return null;

  return (
    <AppShell>
      <div className="py-8 px-4">
        <div className="w-full max-w-md mx-auto">
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div>
                <h1 className="text-2xl font-display font-bold text-slate-900">
                  Account settings
                </h1>
                <p className="text-slate-600 mt-1 text-sm">
                  Your sign-up info and password.
                </p>
              </div>

              <Separator />

              {/* Sign-up info: read-only, only what they signed up with */}
              <div>
                <h2 className="text-sm font-semibold text-slate-800 mb-3">Account info</h2>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Username</Label>
                    <p className="text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                      {user.username}
                    </p>
                  </div>
                  {user.email != null && user.email !== "" && (
                    <div className="space-y-1.5">
                      <Label className={labelClass}>Email</Label>
                      <p className="text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                        {user.email}
                      </p>
                    </div>
                  )}
                  {user.firstName != null && user.firstName !== "" && (
                    <div className="space-y-1.5">
                      <Label className={labelClass}>First name</Label>
                      <p className="text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                        {user.firstName}
                      </p>
                    </div>
                  )}
                  {user.lastName != null && user.lastName !== "" && (
                    <div className="space-y-1.5">
                      <Label className={labelClass}>Last name</Label>
                      <p className="text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                        {user.lastName}
                      </p>
                    </div>
                  )}
                  {user.phoneNumber != null && user.phoneNumber !== "" && (
                    <div className="space-y-1.5">
                      <Label className={labelClass}>Phone</Label>
                      <p className="text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                        {user.phoneNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Update password */}
              <div>
                <h2 className="text-sm font-semibold text-slate-800 mb-3">Password</h2>
                <Collapsible open={passwordOpen} onOpenChange={setPasswordOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between rounded-xl h-11"
                    >
                      Update password
                      <ChevronDown className={`w-4 h-4 transition-transform ${passwordOpen ? "rotate-180" : ""}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <form
                      onSubmit={passwordForm.handleSubmit(onUpdatePassword)}
                      className="mt-4 space-y-4 pt-4 border-t border-slate-200"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className={labelClass}>Current password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          placeholder="••••••••"
                          className={inputClass}
                          {...passwordForm.register("currentPassword")}
                        />
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className={labelClass}>New password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="At least 6 characters"
                          className={inputClass}
                          {...passwordForm.register("newPassword")}
                        />
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className={labelClass}>Confirm new password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className={inputClass}
                          {...passwordForm.register("confirmPassword")}
                        />
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={passwordSaving}
                        className="w-full rounded-xl"
                      >
                        {passwordSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating…</> : "Update password"}
                      </Button>
                    </form>
                  </CollapsibleContent>
                </Collapsible>
                {hasEmail && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600 mb-2">
                      Forgot your password? We’ll send a reset link to <strong>{accountEmail}</strong>.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-xl"
                      disabled={resetLinkSending || resetLinkSent}
                      onClick={onSendResetLink}
                    >
                      {resetLinkSending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>
                      ) : resetLinkSent ? (
                        "Reset link sent — check your email"
                      ) : (
                        "Send password reset link"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
