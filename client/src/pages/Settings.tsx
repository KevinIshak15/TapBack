import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@/hooks/use-auth";
import { useBusinesses, useUpdateBusiness } from "@/hooks/use-businesses";
import {
  useGoogleIntegrationStatus,
  useDisconnectGoogle,
} from "@/hooks/use-google-integration";
import { api } from "@shared/routes";
import { useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AppShell } from "@/components/app/AppShell";
import {
  SettingsSection,
  SaveButtonRow,
  LogoUploader,
  ColorPickerField,
  IntegrationStatusRow,
  inputClass,
  labelClass,
} from "@/components/settings";
import { CATEGORIES } from "@/lib/categoriesAndTags";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronDown, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// --- Validation (match signup) ---
const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Enter a valid email address"),
  phoneNumber: z.string().optional(),
});
const businessSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().optional(),
  timezone: z.string().optional(),
});
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

type ProfileForm = z.infer<typeof profileSchema>;
type BusinessForm = z.infer<typeof businessSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

// TODO: Backend — implement email change verification flow.
// Stub endpoints: POST /api/account/request-email-change, POST resend, DELETE cancel.
const REQUEST_EMAIL_CHANGE = "/api/account/request-email-change";
const RESEND_EMAIL_CHANGE = "/api/account/resend-email-change";
const CANCEL_EMAIL_CHANGE = "/api/account/cancel-email-change";

function getDefaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    return "";
  }
}

export default function Settings() {
  const [, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useUser();
  const { data: businesses, isLoading: businessesLoading } = useBusinesses();
  const updateBusiness = useUpdateBusiness();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const statusQuery = useGoogleIntegrationStatus();
  const disconnectMutation = useDisconnectGoogle();
  const status = statusQuery.data?.status ?? "disconnected";
  const connectedEmail = statusQuery.data?.connectedEmail;

  const firstBusiness = businesses?.[0];

  // Email change verification state (TODO: backend)
  const [pendingNewEmail, setPendingNewEmail] = useState<string | null>(null);
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);

  // Profile
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
  });
  const profileDirty = Object.keys(profileForm.formState.dirtyFields).length > 0;

  // Business
  const businessForm = useForm<BusinessForm>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      timezone: getDefaultTimezone(),
    },
  });
  const businessDirty = Object.keys(businessForm.formState.dirtyFields).length > 0;

  // Branding (first business logo + local state for colors until we have schema)
  const [brandLogo, setBrandLogo] = useState<string>("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [accentColor, setAccentColor] = useState("#7c3aed");
  const [brandingDirty, setBrandingDirty] = useState(false);
  const [brandingSaving, setBrandingSaving] = useState(false);

  // Notifications
  const [notifNewReview, setNotifNewReview] = useState(true);
  const [notifNegativeReview, setNotifNegativeReview] = useState(true);
  const [notifWeeklySummary, setNotifWeeklySummary] = useState(false);
  const [notifDirty, setNotifDirty] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);

  // Password
  const [passwordOpen, setPasswordOpen] = useState(false);
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Sync form defaults from user + business
  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      phoneNumber: user.phoneNumber ?? "",
    });
  }, [user, profileForm]);

  useEffect(() => {
    businessForm.reset({
      companyName: firstBusiness?.name ?? "",
      industry: firstBusiness?.category ?? "",
      timezone: getDefaultTimezone(),
    });
  }, [firstBusiness, businessForm]);

  useEffect(() => {
    setBrandLogo(firstBusiness?.logo ?? "");
  }, [firstBusiness?.logo]);

  // Save Profile (TODO: PATCH /api/user; email change goes through verification flow)
  const onSaveProfile = async (data: ProfileForm) => {
    const newEmail = (data.email ?? "").trim();
    const currentEmail = (user?.email ?? "").trim();
    if (newEmail && newEmail !== currentEmail) {
      setEmailChangeLoading(true);
      try {
        const res = await fetch(REQUEST_EMAIL_CHANGE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ newEmail }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to request email change");
        }
        setPendingNewEmail(newEmail);
        toast({ title: "Verification sent", description: "Check your new email to confirm the change." });
      } catch (e: any) {
        toast({ variant: "destructive", title: "Error", description: e.message });
      } finally {
        setEmailChangeLoading(false);
      }
      return;
    }
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
        }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const updated = await res.json();
      queryClient.setQueryData([api.auth.me.path], updated);
      profileForm.reset(updated);
      toast({ title: "Profile updated", description: "Your profile has been saved." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to update profile." });
    }
  };

  const onResendEmailVerification = async () => {
    if (!pendingNewEmail) return;
    setEmailChangeLoading(true);
    try {
      const res = await fetch(RESEND_EMAIL_CHANGE, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed to resend");
      toast({ title: "Sent", description: "Verification email sent again." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to resend." });
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const onCancelEmailChange = async () => {
    setEmailChangeLoading(true);
    try {
      await fetch(CANCEL_EMAIL_CHANGE, { method: "DELETE", credentials: "include" });
      setPendingNewEmail(null);
      toast({ title: "Cancelled", description: "Email change cancelled." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to cancel." });
    } finally {
      setEmailChangeLoading(false);
    }
  };

  // Save Business (update first business)
  const onSaveBusiness = async (data: BusinessForm) => {
    if (!firstBusiness) {
      toast({ variant: "destructive", title: "No business", description: "Add a business first." });
      return;
    }
    try {
      await updateBusiness.mutateAsync({
        id: firstBusiness.id,
        name: data.companyName,
        category: data.industry || firstBusiness.category,
      });
      businessForm.reset(data);
      toast({ title: "Business updated", description: "Company details saved." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to update business." });
    }
  };

  // Save Branding (logo to first business; colors TODO: backend)
  const onSaveBranding = async () => {
    if (!firstBusiness) {
      toast({ variant: "destructive", title: "No business", description: "Add a business first." });
      return;
    }
    setBrandingSaving(true);
    try {
      await updateBusiness.mutateAsync({
        id: firstBusiness.id,
        logo: brandLogo || undefined,
      });
      setBrandingDirty(false);
      toast({ title: "Branding saved", description: "Logo and colors updated." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to save branding." });
    } finally {
      setBrandingSaving(false);
    }
  };

  const handleBrandLogoChange = (v: string) => {
    setBrandLogo(v);
    setBrandingDirty(true);
  };
  const handlePrimaryColorChange = (v: string) => {
    setPrimaryColor(v);
    setBrandingDirty(true);
  };
  const handleAccentColorChange = (v: string) => {
    setAccentColor(v);
    setBrandingDirty(true);
  };

  // Save Notifications (stub)
  const onSaveNotifications = async () => {
    setNotifSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setNotifDirty(false);
    setNotifSaving(false);
    toast({ title: "Notifications saved", description: "Preferences updated." });
  };


  // Update Password (TODO: backend)
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
      toast({ title: "Password updated successfully", description: "You can use your new password to sign in." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleConnectGoogle = () => {
    window.location.href = "/api/integrations/google/start";
  };

  const handleDisconnectGoogle = async () => {
    try {
      await disconnectMutation.mutateAsync();
      toast({ title: "Disconnected", description: "Google Business Profile disconnected." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to disconnect." });
    }
  };

  useEffect(() => {
    if (!userLoading && !user) setLocation("/login");
  }, [user, userLoading, setLocation]);

  const isLoading = userLoading || businessesLoading;

  if (isLoading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] bg-gradient-to-br from-slate-50 via-white to-blue-50/50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!user) return null;

  return (
    <AppShell>
      <div className="min-h-[60vh] bg-gradient-to-br from-slate-50 via-white to-blue-50/50 py-8 px-4">
        <div className="w-full max-w-2xl mx-auto">
          <Card className="glass-strong border-slate-200/60 shadow-2xl overflow-hidden">
            <CardContent className="p-6 md:p-8 space-y-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900">
                  Account Settings
                </h1>
                <p className="text-slate-600 mt-1">Update your profile and business details.</p>
              </div>

              <Separator className="bg-slate-200" />

              {/* 1) Profile */}
              <SettingsSection title="Profile (Personal)" description="Your name and contact info.">
                <form
                  onSubmit={profileForm.handleSubmit(onSaveProfile)}
                  className="space-y-4"
                >
                  {pendingNewEmail ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                      <p className="text-sm font-medium text-amber-900">
                        Pending email change to {pendingNewEmail}
                      </p>
                      <p className="text-xs text-amber-800">
                        Check that inbox and click the verification link. Your login email will not change until verified.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={onResendEmailVerification}
                          disabled={emailChangeLoading}
                        >
                          {emailChangeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Resend verification"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-amber-800"
                          onClick={onCancelEmailChange}
                          disabled={emailChangeLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className={labelClass}>Full name</Label>
                          <Input
                            id="firstName"
                            placeholder="First name"
                            className={inputClass}
                            {...profileForm.register("firstName")}
                          />
                          {profileForm.formState.errors.firstName && (
                            <p className="text-sm text-red-500">{profileForm.formState.errors.firstName.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className={labelClass + " opacity-0 pointer-events-none"}>Last</Label>
                          <Input
                            id="lastName"
                            placeholder="Last name"
                            className={inputClass}
                            {...profileForm.register("lastName")}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className={labelClass}>Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className={inputClass}
                          {...profileForm.register("email")}
                        />
                        {profileForm.formState.errors.email && (
                          <p className="text-sm text-red-500">{profileForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className={labelClass}>
                          Phone <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                        </Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="+1 234 567 8900"
                          className={inputClass}
                          {...profileForm.register("phoneNumber")}
                        />
                      </div>
                    </>
                  )}
                  <SaveButtonRow
                    label="Save Profile"
                    disabled={!profileDirty && !pendingNewEmail}
                    loading={profileForm.formState.isSubmitting || emailChangeLoading}
                    type="submit"
                  />
                </form>
              </SettingsSection>

              <Separator className="bg-slate-200" />

              {/* 2) Business */}
              <SettingsSection title="Business (Company)" description="Company name and industry.">
                <form onSubmit={businessForm.handleSubmit(onSaveBusiness)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className={labelClass}>Company name</Label>
                    <Input
                      id="companyName"
                      placeholder="Your company name"
                      className={inputClass}
                      {...businessForm.register("companyName")}
                    />
                    {businessForm.formState.errors.companyName && (
                      <p className="text-sm text-red-500">{businessForm.formState.errors.companyName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>
                      Industry <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                    </Label>
                    <Select
                      value={businessForm.watch("industry") || ""}
                      onValueChange={(v) => businessForm.setValue("industry", v, { shouldDirty: true })}
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className={labelClass}>
                      Timezone <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                    </Label>
                    <Input
                      id="timezone"
                      placeholder={getDefaultTimezone() || "e.g. America/Toronto"}
                      className={inputClass}
                      {...businessForm.register("timezone")}
                    />
                  </div>
                  <SaveButtonRow
                    label="Save Business"
                    disabled={!businessDirty || !firstBusiness}
                    loading={updateBusiness.isPending}
                    type="submit"
                  />
                </form>
              </SettingsSection>

              <Separator className="bg-slate-200" />

              {/* 3) Branding */}
              <SettingsSection title="Branding" description="Logo and colors for your QR and review flow.">
                <div className="space-y-4">
                  <LogoUploader value={brandLogo} onChange={handleBrandLogoChange} />
                  <ColorPickerField
                    label="Primary brand color"
                    value={primaryColor}
                    onChange={handlePrimaryColorChange}
                  />
                  <ColorPickerField
                    label="Accent color"
                    value={accentColor}
                    onChange={handleAccentColorChange}
                    optional
                  />
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Preview</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {brandLogo ? (
                        <img src={brandLogo} alt="" className="h-10 w-10 object-contain rounded-lg" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-200" />
                      )}
                      <span className="font-semibold text-slate-900">
                        {businessForm.watch("companyName") || "Company name"}
                      </span>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg text-white text-sm font-medium"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Sample button
                      </button>
                    </div>
                  </div>
                  <SaveButtonRow
                    label="Save Branding"
                    disabled={!brandingDirty}
                    loading={brandingSaving}
                    onClick={onSaveBranding}
                  />
                </div>
              </SettingsSection>

              <Separator className="bg-slate-200" />

              {/* 4) Google Business Profile */}
              <SettingsSection
                title="Google Business Profile (Integration)"
                description="Connect your Google Business Profile to manage locations and reviews."
              >
                <IntegrationStatusRow
                  status={status}
                  connectedEmail={connectedEmail}
                  loading={statusQuery.isLoading}
                  onConnect={handleConnectGoogle}
                  onReconnect={handleConnectGoogle}
                  onDisconnect={handleDisconnectGoogle}
                  disconnectLoading={disconnectMutation.isPending}
                />
              </SettingsSection>

              <Separator className="bg-slate-200" />

              {/* 5) Security */}
              <SettingsSection title="Security" description="Change your password.">
                <Collapsible open={passwordOpen} onOpenChange={setPasswordOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between rounded-xl h-12"
                    >
                      Change Password
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
                      <SaveButtonRow
                        label="Update Password"
                        loading={passwordSaving}
                        type="submit"
                      />
                    </form>
                  </CollapsibleContent>
                </Collapsible>
              </SettingsSection>

              <Separator className="bg-slate-200" />

              {/* 6) Notifications */}
              <SettingsSection title="Notifications" description="Email preferences.">
                <div className="space-y-4">
                  <label className="flex items-center justify-between gap-4 cursor-pointer">
                    <span className="text-sm font-medium text-slate-900">Email me when a new review is received</span>
                    <Switch checked={notifNewReview} onCheckedChange={(v) => { setNotifNewReview(v); setNotifDirty(true); }} />
                  </label>
                  <label className="flex items-center justify-between gap-4 cursor-pointer">
                    <span className="text-sm font-medium text-slate-900">Email me when a negative review is received</span>
                    <Switch checked={notifNegativeReview} onCheckedChange={(v) => { setNotifNegativeReview(v); setNotifDirty(true); }} />
                  </label>
                  <label className="flex items-center justify-between gap-4 cursor-pointer">
                    <span className="text-sm font-medium text-slate-900">Weekly summary email</span>
                    <Switch checked={notifWeeklySummary} onCheckedChange={(v) => { setNotifWeeklySummary(v); setNotifDirty(true); }} />
                  </label>
                  <SaveButtonRow
                    label="Save Notifications"
                    disabled={!notifDirty}
                    loading={notifSaving}
                    onClick={onSaveNotifications}
                  />
                </div>
              </SettingsSection>

              <Separator className="bg-slate-200" />

              {/* 7) Billing placeholder */}
              <SettingsSection title="Billing" description="Plan and payment.">
                <p className="text-sm text-slate-600">
                  You&apos;re currently on the Free plan. Billing and upgrades are coming soon.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl mt-2 gap-2"
                  asChild
                >
                  <a href="https://ai.revues.ca" target="_blank" rel="noopener noreferrer">
                    Contact us to upgrade
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </SettingsSection>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
