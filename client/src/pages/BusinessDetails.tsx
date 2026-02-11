import { Link, useRoute, useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBusinessSchema, type InsertBusiness } from "@shared/schema";
import { useUser } from "@/hooks/use-auth";
import { useBusinessBySlug, useUpdateBusiness } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { QrCode, BarChart, Settings, Store, Loader2, MessageSquare, AlertTriangle, Download, Printer, ExternalLink, CheckCircle2, X, Plus, ZoomIn, ZoomOut, Eye, Palette, ChevronDown } from "lucide-react";
import {
  CATEGORIES,
  getDefaultTagsForCategory,
  OPTIONAL_TAG_BANK,
  isOptionalBankTag,
} from "@/lib/categoriesAndTags";
import { makeLogoTransparent } from "@/lib/logoToTransparent";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";
import { BusinessLayout } from "@/components/BusinessLayout";
import { REVIEW_THEMES, getReviewTheme, type ReviewThemeId } from "@/lib/reviewThemes";

type TabType = "settings" | "qr" | "insights" | "reviews" | "complaints";

function getTabFromUrl(): TabType {
  if (typeof window === "undefined") return "settings";
  const tab = new URLSearchParams(window.location.search).get("tab");
  const valid: TabType[] = ["settings", "insights", "reviews", "complaints"];
  return valid.includes(tab as TabType) ? (tab as TabType) : "settings";
}

export default function BusinessDetails() {
  const [, params] = useRoute("/business/:slug");
  const [location, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useUser();
  const slug = params?.slug || "";
  const { data: business, isLoading: businessLoading } = useBusinessBySlug(slug);
  const activeTab = getTabFromUrl();

  const setTab = (tab: TabType) => {
    if (tab === "qr") {
      setLocation(`/business/${slug}/qr`);
      return;
    }
    const url = tab === "settings" ? `/business/${slug}` : `/business/${slug}?tab=${tab}`;
    setLocation(url, { replace: true });
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  // Redirect to dashboard if business not found
  useEffect(() => {
    if (!businessLoading && !business && user) {
      setLocation("/dashboard");
    }
  }, [business, businessLoading, user, setLocation]);

  if (userLoading || businessLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-11 w-full max-w-2xl rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (!user || !business) {
    return null;
  }

  return (
    <BusinessLayout business={business} slug={slug}>
      <Tabs value={activeTab} onValueChange={(v) => setTab(v as TabType)} className="w-full">
          <TabsContent value="settings" className="mt-6">
            <BusinessSettingsView business={business} />
          </TabsContent>
          <TabsContent value="qr" className="mt-6">
            <QRView business={business} />
          </TabsContent>
          <TabsContent value="insights" className="mt-6">
            <InsightsView business={business} />
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <ReviewsView business={business} />
          </TabsContent>
          <TabsContent value="complaints" className="mt-6">
            <ComplaintsView business={business} />
          </TabsContent>
        </Tabs>
    </BusinessLayout>
  );
}

// Business Settings View Component
function BusinessSettingsView({ business }: { business: any }) {
  const { toast } = useToast();
  const updateMutation = useUpdateBusiness();
  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    business.reviewTheme || "classic"
  );
  // Custom tags stored in database (max 2 additional)
  const [customTags, setCustomTags] = useState<string[]>(
    business.focusAreas && business.focusAreas.length > 0 
      ? business.focusAreas.filter((tag: string) => !getDefaultTagsForCategory(business.category || "Other").includes(tag))
      : []
  );
  const [newTag, setNewTag] = useState("");

  const form = useForm<Partial<InsertBusiness>>({
    resolver: zodResolver(insertBusinessSchema.partial()),
    defaultValues: {
      name: business.name,
      category: business.category,
      googleReviewUrl: business.googleReviewUrl,
      logo: business.logo ?? "",
    },
  });

  // Use form's current category so tags update immediately when user selects a category
  const displayCategory = form.watch("category") || business.category || "Other";
  const defaultTags = getDefaultTagsForCategory(displayCategory);
  const allTags = [...defaultTags, ...customTags];

  // Sync custom tags when business data changes
  useEffect(() => {
    const currentDefaultTags = getDefaultTagsForCategory(business.category || "Other");
    setCustomTags(
      business.focusAreas && business.focusAreas.length > 0 
        ? business.focusAreas.filter((tag: string) => !currentDefaultTags.includes(tag))
        : []
    );
  }, [business.focusAreas, business.category]);

  // Sync theme when business data changes
  useEffect(() => {
    setSelectedThemeId(business.reviewTheme || "classic");
  }, [business.reviewTheme]);

  // Reset form when business data changes
  useEffect(() => {
    form.reset({
      name: business.name,
      category: business.category,
      googleReviewUrl: business.googleReviewUrl,
      logo: business.logo ?? "",
    });
  }, [business, form]);

  const handleSaveBusinessInfo = async (data: Partial<InsertBusiness>) => {
    try {
      await updateMutation.mutateAsync({
        id: business.id,
        ...data,
      });
      toast({
        title: "Success!",
        description: "Business information updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update business information",
      });
    }
  };

  const handleSaveTags = async () => {
    try {
      // Only save custom tags (defaults are always included)
      await updateMutation.mutateAsync({
        id: business.id,
        focusAreas: customTags, // Only save custom tags
      });
      toast({
        title: "Success!",
        description: "Tags updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update tags",
      });
    }
  };

  const customCount = customTags.filter((t) => !isOptionalBankTag(t)).length; // max 1 custom allowed
  const canAddFromBank = customTags.length < 2;
  const canAddCustom = customTags.length < 2 && customCount < 1;

  const handleAddCustomTag = () => {
    const tag = newTag.trim();
    if (!tag || !canAddCustom || allTags.includes(tag)) return;
    setCustomTags([...customTags, tag]);
    setNewTag("");
  };

  const handleAddFromBank = (tag: string) => {
    if (!canAddFromBank || customTags.includes(tag)) return;
    setCustomTags([...customTags, tag]);
  };

  const handleRemoveTag = (index: number) => {
    // Only allow removing custom tags (not defaults)
    // Index is relative to allTags, so we need to adjust for default tags
    const actualIndex = index - defaultTags.length;
    if (actualIndex >= 0) {
      setCustomTags(customTags.filter((_, i) => i !== actualIndex));
    }
  };

  const handleSaveTheme = async () => {
    try {
      await updateMutation.mutateAsync({
        id: business.id,
        reviewTheme: selectedThemeId as ReviewThemeId,
      });
      toast({
        title: "Theme saved",
        description: "Review page theme updated. Customers will see this look when leaving a review.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save theme",
      });
    }
  };

  const selectedTheme = getReviewTheme(selectedThemeId);

  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-bold">Business Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Single page: left = Business Info, right = Review Options (smaller) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,minmax(0,340px)] gap-8 items-start">
          {/* Left: Business Information */}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Business Information</h3>
            <form onSubmit={form.handleSubmit(handleSaveBusinessInfo)} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">Business Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  className="mt-1"
                  placeholder="Enter business name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-slate-700">Category *</Label>
                <p className="text-xs text-slate-500 mt-0.5 mb-1">Search to find your business type. Used for review tags and SEO.</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full mt-1 justify-between h-10 font-normal",
                        !form.watch("category") && "text-slate-500"
                      )}
                    >
                      {form.watch("category") || "Select category..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0 z-[100] bg-white border-slate-200 shadow-lg overflow-hidden"
                    align="start"
                    sideOffset={4}
                  >
                    <Command className="bg-white rounded-md border-0">
                      <CommandInput placeholder="Search category..." className="bg-white" />
                      <CommandList className="max-h-[280px] overflow-y-auto bg-white">
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup className="bg-white p-1">
                          {CATEGORIES.map((cat) => (
                            <CommandItem
                              key={cat}
                              value={cat}
                              onSelect={() => {
                                form.setValue("category", cat);
                              }}
                              className="cursor-pointer rounded-md"
                            >
                              {cat}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {form.formState.errors.category && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.category.message}</p>
                )}
              </div>
              <Separator />
              <div>
                <Label htmlFor="googleReviewUrl" className="text-sm font-medium text-slate-700">Google Review URL *</Label>
                <Input
                  id="googleReviewUrl"
                  {...form.register("googleReviewUrl")}
                  className="mt-1"
                  placeholder="https://www.google.com/..."
                />
                {form.formState.errors.googleReviewUrl && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.googleReviewUrl.message}</p>
                )}
              </div>
              <Separator />
              <div>
                <Label htmlFor="logo" className="text-sm font-medium text-slate-700">Logo (optional)</Label>
                <p className="text-xs text-slate-500 mt-0.5 mb-1">Any image format. We make the background transparent so it looks clean on your QR code and review flow.</p>
                {form.watch("logo") ? (
                  <div className="mt-2 flex items-center gap-3 flex-wrap">
                    <img
                      src={form.watch("logo")}
                      alt="Logo preview"
                      className="h-14 w-auto max-w-[140px] object-contain rounded border border-slate-200 bg-white"
                    />
                    <div className="flex gap-2">
                      <Label htmlFor="logo-file" className="cursor-pointer">
                        <span className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700">
                          Change
                        </span>
                        <input
                          id="logo-file"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onload = async () => {
                                const dataUrl = r.result as string;
                                try {
                                  const transparent = await makeLogoTransparent(dataUrl);
                                  form.setValue("logo", transparent);
                                } catch {
                                  form.setValue("logo", dataUrl);
                                }
                              };
                              r.readAsDataURL(file);
                            }
                          }}
                        />
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => form.setValue("logo", "")}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 flex gap-2">
                    <Input
                      id="logo"
                      {...form.register("logo")}
                      className="flex-1"
                      placeholder="Logo URL or upload below"
                    />
                    <Label htmlFor="logo-upload" className="cursor-pointer shrink-0">
                      <span className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 border border-input bg-background hover:bg-slate-50">
                        Upload
                      </span>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const r = new FileReader();
                            r.onload = async () => {
                              const dataUrl = r.result as string;
                              try {
                                const transparent = await makeLogoTransparent(dataUrl);
                                form.setValue("logo", transparent);
                              } catch {
                                form.setValue("logo", dataUrl);
                              }
                            };
                            r.readAsDataURL(file);
                          }
                        }}
                      />
                    </Label>
                  </div>
                )}
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={updateMutation.isPending} className="w-full sm:w-auto">
                  {updateMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4 ml-2" /> Save Changes</>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Right: Review Options — tags only (themes moved to full-width below) */}
          <div className="lg:max-w-[340px] space-y-6 text-sm w-full">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-600" />
              Review Options
            </h3>
            <div>
              <Label className="text-xs font-medium text-slate-600">Focus Areas (Tags)</Label>
              <p className="text-xs text-slate-500 mt-0.5 mb-2">5 tags are set by category (best for Google). Add up to 2 more from the options below or one of your own.</p>
              <div className="space-y-1.5 mb-3">
                {defaultTags.map((tag) => (
                  <div key={`default-${tag}`} className="flex items-center gap-2 py-2 px-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="flex-1 font-medium text-slate-900 text-xs">{tag}</span>
                    <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">Best for Google</span>
                  </div>
                ))}
                {customTags.map((tag, index) => {
                  const displayIndex = defaultTags.length + index;
                  return (
                    <div
                      key={`extra-${index}`}
                      className="flex items-center gap-2 py-2 px-2.5 bg-primary/5 rounded-lg border border-primary/20 text-xs"
                    >
                      <span className="flex-1 font-medium text-slate-900">{tag}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveTag(displayIndex)} className="h-6 w-6 p-0 text-slate-400 hover:text-red-600">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
              {customTags.length < 2 && (
                <>
                  <p className="text-[11px] text-slate-500 mb-1.5">Add from options (max 2 total) or your own (max 1 custom):</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {OPTIONAL_TAG_BANK.map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        disabled={!canAddFromBank || customTags.includes(tag)}
                        onClick={() => handleAddFromBank(tag)}
                      >
                        {tag}
                        <Plus className="w-3 h-3 ml-1 opacity-70" />
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomTag(); } }}
                      placeholder="Your own tag (max 1)"
                      className="flex-1 h-8 text-xs"
                      disabled={!canAddCustom}
                    />
                    <Button type="button" size="sm" onClick={handleAddCustomTag} disabled={!canAddCustom || !newTag.trim() || allTags.includes(newTag.trim())}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
              <Button type="button" size="sm" variant="outline" onClick={handleSaveTags} disabled={updateMutation.isPending} className="mt-2 w-full">
                {updateMutation.isPending ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1.5" />}
                Save Tags
              </Button>
            </div>
          </div>
        </div>

        {/* Theme selector — full width, improved design */}
        <div className="w-full">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
            <div>
              <Label className="text-sm font-semibold text-slate-800">Review page theme</Label>
              <p className="text-xs text-slate-500 mt-0.5">Used on the customer review flow (experience, tags, AI step).</p>
            </div>
            <Button type="button" size="sm" onClick={handleSaveTheme} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1.5" />}
              Save theme
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
            {Object.values(REVIEW_THEMES).map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedThemeId(theme.id)}
                className={`rounded-xl border-2 p-4 text-left transition-all w-full min-w-0 flex flex-col gap-3 ${
                  selectedThemeId === theme.id ? "border-primary ring-2 ring-primary/30 shadow-lg scale-[1.02]" : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div
                  className="h-14 rounded-lg overflow-hidden flex flex-col gap-1.5 p-2"
                  style={{ background: theme.pageBackground ?? theme.background }}
                >
                  <div
                    className="flex-1 min-h-0 rounded-md border"
                    style={{ background: theme.cardBg, borderColor: theme.backgroundAccent }}
                  />
                  <div
                    className="h-4 rounded text-[9px] font-medium flex items-center justify-center text-white truncate"
                    style={{ background: theme.primary }}
                  >
                    Button
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{theme.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{theme.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview: all review flow steps in one phone */}
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100 p-6">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-4">
            Live Preview — all steps on phone
          </p>
          <div className="flex justify-center">
            <div className="w-full max-w-[375px] rounded-[2rem] border-[10px] border-slate-800 bg-slate-800 shadow-2xl overflow-hidden">
              <div className="rounded-[1.25rem] overflow-hidden bg-white max-h-[640px] overflow-y-auto">
                <div
                  className="p-4 flex flex-col gap-6"
                  style={{
                    background: selectedTheme.pageBackground ?? selectedTheme.background,
                    color: selectedTheme.text,
                    fontFamily: selectedTheme.fontFamily,
                  }}
                >
                  {/* Step 1: How did you like your visit */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">1. How did you like your visit?</p>
                    <h4 className="text-base font-bold" style={{ color: selectedTheme.text }}>{business.name}</h4>
                    <p className="text-sm opacity-90">How was your experience at {business.name}?</p>
                    <p className="text-xs opacity-70">We value your honest feedback</p>
                  </div>

                  {/* Step 2: Great experience or it wasn't */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">2. Great or concerns?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        className="py-3 rounded-xl text-center text-xs font-semibold border-2"
                        style={{ background: selectedTheme.backgroundAccent, color: selectedTheme.primary, borderColor: selectedTheme.primary + "50" }}
                      >
                        It was Great!
                      </div>
                      <div
                        className="py-3 rounded-xl text-center text-xs font-semibold border-2 opacity-80"
                        style={{ background: selectedTheme.backgroundAccent, color: selectedTheme.secondary, borderColor: selectedTheme.secondary + "50" }}
                      >
                        I have concerns
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Tags you can choose from */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">3. Choose tags</p>
                    <p className="text-sm font-medium">What stood out about your visit?</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allTags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1.5 rounded-full text-[11px] font-medium border-2"
                          style={{
                            background: selectedTheme.backgroundAccent,
                            color: selectedTheme.primary,
                            borderColor: selectedTheme.primary + "40",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {allTags.length > 5 && (
                        <span className="px-2.5 py-1.5 rounded-full text-[11px] opacity-80" style={{ color: selectedTheme.text }}>+{allTags.length - 5}</span>
                      )}
                    </div>
                    <div className="rounded-lg border-2 border-dashed py-2 text-center text-[11px] opacity-50" style={{ borderColor: selectedTheme.primary + "40" }}>
                      Additional comments...
                    </div>
                  </div>

                  {/* Step 4: AI generation */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">4. AI-generated review</p>
                    <p className="text-sm font-semibold">Review Ready!</p>
                    <p className="text-[11px] opacity-80">Review generated based on your inputs</p>
                    <div className="rounded-lg p-2 text-[11px] italic opacity-90" style={{ background: selectedTheme.backgroundAccent }}>
                      &ldquo;Great experience! Professional service and clear communication. Highly recommend.&rdquo;
                    </div>
                    <div
                      className="py-2.5 rounded-xl text-center text-[11px] font-semibold text-white"
                      style={{ background: `linear-gradient(90deg, ${selectedTheme.primary}, ${selectedTheme.secondary})` }}
                    >
                      Copy & Post on Google
                    </div>
                  </div>

                  <p className="text-[10px] opacity-50 pt-2" style={{ color: selectedTheme.text }}>
                    Powered by TapBack
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Theme System
type Theme = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  background: string;
  text: string;
  cardRadius: number;
  fontFamily: string;
};

const themes: Record<string, Theme> = {
  classic: {
    id: "classic",
    name: "Classic",
    primary: "#1e40af",
    secondary: "#3b82f6",
    background: "#f8fafc",
    text: "#1e293b",
    cardRadius: 8,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  "modern-bold": {
    id: "modern-bold",
    name: "Modern Bold",
    primary: "#7c3aed",
    secondary: "#a855f7",
    background: "#ffffff",
    text: "#0f172a",
    cardRadius: 12,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  "clean-clinic": {
    id: "clean-clinic",
    name: "Clean Clinic",
    primary: "#059669",
    secondary: "#10b981",
    background: "#f0fdf4",
    text: "#064e3b",
    cardRadius: 6,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  "warm-friendly": {
    id: "warm-friendly",
    name: "Warm Friendly",
    primary: "#ea580c",
    secondary: "#fb923c",
    background: "#fff7ed",
    text: "#7c2d12",
    cardRadius: 16,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  "dark-luxe": {
    id: "dark-luxe",
    name: "Dark Luxe",
    primary: "#1e293b",
    secondary: "#334155",
    background: "#0f172a",
    text: "#f1f5f9",
    cardRadius: 8,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  "fresh-minimal": {
    id: "fresh-minimal",
    name: "Fresh Minimal",
    primary: "#06b6d4",
    secondary: "#22d3ee",
    background: "#ecfeff",
    text: "#164e63",
    cardRadius: 4,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
};

// Template dimensions (in pixels at 300 DPI)
const templateDimensions: Record<string, { width: number; height: number; dpi: number }> = {
  "counter-card": { width: 1200, height: 1800, dpi: 300 }, // 4x6 inches
  poster: { width: 2550, height: 3300, dpi: 300 }, // 8.5x11 inches
  "table-tent": { width: 1800, height: 1200, dpi: 300 }, // 6x4 inches (folded)
  "sticker-2x2": { width: 600, height: 600, dpi: 300 }, // 2x2 inches
  "sticker-3x3": { width: 900, height: 900, dpi: 300 }, // 3x3 inches
};

// Template Renderer Function
function renderTemplate(
  template: string,
  theme: Theme,
  business: any,
  headline: string,
  subheadline: string,
  note: string,
  reviewUrl: string,
  quietZone: number,
  showGuides: boolean
) {
  const dims = templateDimensions[template];
  const scale = 0.2; // Scale down for preview (actual export uses full size)
  const width = dims.width * scale;
  const height = dims.height * scale;

  switch (template) {
    case "counter-card":
      return renderCounterCard(theme, business, headline, subheadline, note, reviewUrl, quietZone, width, height, showGuides);
    case "poster":
      return renderPoster(theme, business, headline, subheadline, reviewUrl, quietZone, width, height, showGuides);
    case "table-tent":
      return renderTableTent(theme, business, headline, subheadline, reviewUrl, quietZone, width, height, showGuides);
    case "sticker-2x2":
    case "sticker-3x3":
      return renderSticker(theme, business, reviewUrl, quietZone, width, height, showGuides);
    default:
      return renderCounterCard(theme, business, headline, subheadline, note, reviewUrl, quietZone, width, height, showGuides);
  }
}

// Template A: Counter Card (4x6)
function renderCounterCard(
  theme: Theme,
  business: any,
  headline: string,
  subheadline: string,
  note: string,
  reviewUrl: string,
  quietZone: number,
  width: number,
  height: number,
  showGuides: boolean
) {
  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: theme.background,
        borderRadius: `${theme.cardRadius}px`,
        padding: "24px",
        fontFamily: theme.fontFamily,
        color: theme.text,
        position: "relative",
        border: showGuides ? "2px dashed rgba(0,0,0,0.2)" : "none",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "32px",
      }}
    >
      {/* Logo area (top-left) */}
      {business.logo && (
        <div style={{ position: "absolute", top: "24px", left: "24px" }}>
          <img src={business.logo} alt={business.name} style={{ maxHeight: "60px", maxWidth: "120px" }} />
        </div>
      )}

      {/* Left side - Text content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: business.logo ? "60px" : "0" }}>
        <h2 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "16px", lineHeight: "1.2", color: theme.text }}>
          {headline}
        </h2>
        <p style={{ fontSize: "20px", marginBottom: "12px", color: theme.text, opacity: 0.8 }}>
          {subheadline}
        </p>
        {note && (
          <p style={{ fontSize: "14px", color: theme.text, opacity: 0.6, marginTop: "8px" }}>
            {note}
          </p>
        )}
      </div>

      {/* Right side - QR Code (locked to white background) */}
      <div style={{ flexShrink: 0 }}>
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: `${quietZone}px`,
            borderRadius: `${theme.cardRadius}px`,
            border: `2px solid ${theme.primary}`,
          }}
        >
          <QRCodeSVG value={reviewUrl} size={280} level="H" includeMargin />
        </div>
      </div>
    </div>
  );
}

// Template B: Poster (8.5x11)
function renderPoster(
  theme: Theme,
  business: any,
  headline: string,
  subheadline: string,
  reviewUrl: string,
  quietZone: number,
  width: number,
  height: number,
  showGuides: boolean
) {
  const qrSize = Math.min(width * 0.25, height * 0.3);
  const headlineSize = Math.max(32, width * 0.025);
  const subheadlineSize = Math.max(16, width * 0.011);
  const stepSize = Math.max(14, width * 0.009);
  const footerSize = Math.max(12, width * 0.007);
  
  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: theme.background,
        borderRadius: `${theme.cardRadius}px`,
        padding: `${width * 0.02}px`, // Print-safe margins
        fontFamily: theme.fontFamily,
        color: theme.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        border: showGuides ? "2px dashed rgba(0,0,0,0.2)" : "none",
        boxSizing: "border-box",
      }}
    >
      {/* Hero Headline */}
      <div style={{ textAlign: "center", marginTop: `${height * 0.05}px`, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h1 style={{ fontSize: `${headlineSize}px`, fontWeight: "bold", marginBottom: `${height * 0.02}px`, color: theme.primary, lineHeight: "1.1" }}>
          {headline}
        </h1>
        <p style={{ fontSize: `${subheadlineSize}px`, color: theme.text, opacity: 0.8 }}>
          {subheadline}
        </p>
      </div>

      {/* Centered Large QR (always white background) */}
      <div
        style={{
          backgroundColor: "#ffffff", // Locked to white for scanability
          padding: `${quietZone}px`,
          borderRadius: `${theme.cardRadius}px`,
          border: `3px solid ${theme.primary}`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <QRCodeSVG value={reviewUrl} size={qrSize} level="H" includeMargin />
      </div>

      {/* 3-step line */}
      <div style={{ display: "flex", alignItems: "center", gap: `${width * 0.01}px`, fontSize: `${stepSize}px`, color: theme.text, marginBottom: `${height * 0.03}px` }}>
        <span style={{ fontWeight: "bold", color: theme.primary }}>Scan</span>
        <span>→</span>
        <span style={{ fontWeight: "bold", color: theme.primary }}>Tap</span>
        <span>→</span>
        <span style={{ fontWeight: "bold", color: theme.primary }}>Review</span>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: `${footerSize}px`, color: theme.text, opacity: 0.7, marginBottom: `${height * 0.02}px` }}>
        <p style={{ fontWeight: "bold" }}>{business.name}</p>
        {business.website && <p style={{ fontSize: `${footerSize * 0.8}px`, marginTop: "4px" }}>{business.website}</p>}
      </div>
    </div>
  );
}

// Template C: Table Tent (tri-fold)
function renderTableTent(
  theme: Theme,
  business: any,
  headline: string,
  subheadline: string,
  reviewUrl: string,
  quietZone: number,
  width: number,
  height: number,
  showGuides: boolean
) {
  const foldWidth = width / 3;
  const qrSize = Math.min(foldWidth * 0.5, height * 0.4);
  const headlineSize = Math.max(18, foldWidth * 0.04);
  const textSize = Math.max(12, foldWidth * 0.025);
  
  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: theme.background,
        borderRadius: `${theme.cardRadius}px`,
        fontFamily: theme.fontFamily,
        color: theme.text,
        display: "flex",
        border: showGuides ? "2px dashed rgba(0,0,0,0.2)" : "none",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Fold guides */}
      {showGuides && (
        <>
          <div style={{ position: "absolute", left: `${foldWidth}px`, top: 0, bottom: 0, width: "2px", backgroundColor: "rgba(255,0,0,0.5)", zIndex: 10 }} />
          <div style={{ position: "absolute", left: `${foldWidth * 2}px`, top: 0, bottom: 0, width: "2px", backgroundColor: "rgba(255,0,0,0.5)", zIndex: 10 }} />
        </>
      )}

      {/* Face 1 */}
      <div style={{ flex: 1, padding: `${width * 0.015}px`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", borderRight: showGuides ? "1px dashed rgba(0,0,0,0.2)" : "none", boxSizing: "border-box" }}>
        <h2 style={{ fontSize: `${headlineSize}px`, fontWeight: "bold", marginBottom: `${height * 0.02}px`, textAlign: "center", color: theme.primary }}>
          {headline}
        </h2>
        <div
          style={{
            backgroundColor: "#ffffff", // Always white for scanability
            padding: `${quietZone}px`,
            borderRadius: `${theme.cardRadius}px`,
            border: `2px solid ${theme.primary}`,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <QRCodeSVG value={reviewUrl} size={qrSize} level="H" includeMargin />
        </div>
      </div>

      {/* Face 2 (mirrored) */}
      <div style={{ flex: 1, padding: `${width * 0.015}px`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", borderRight: showGuides ? "1px dashed rgba(0,0,0,0.2)" : "none", boxSizing: "border-box" }}>
        <h2 style={{ fontSize: `${headlineSize}px`, fontWeight: "bold", marginBottom: `${height * 0.02}px`, textAlign: "center", color: theme.primary }}>
          {headline}
        </h2>
        <div
          style={{
            backgroundColor: "#ffffff", // Always white for scanability
            padding: `${quietZone}px`,
            borderRadius: `${theme.cardRadius}px`,
            border: `2px solid ${theme.primary}`,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <QRCodeSVG value={reviewUrl} size={qrSize} level="H" includeMargin />
        </div>
      </div>

      {/* Face 3 (back) */}
      <div style={{ flex: 1, padding: `${width * 0.015}px`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", boxSizing: "border-box" }}>
        <p style={{ fontSize: `${textSize}px`, textAlign: "center", color: theme.text, opacity: 0.8, marginBottom: `${height * 0.02}px` }}>
          {subheadline}
        </p>
        <p style={{ fontSize: `${textSize * 0.9}px`, textAlign: "center", color: theme.text, opacity: 0.6 }}>
          {business.name}
        </p>
      </div>
    </div>
  );
}

// Template D: Sticker Label (2x2 and 3x3)
function renderSticker(
  theme: Theme,
  business: any,
  reviewUrl: string,
  quietZone: number,
  width: number,
  height: number,
  showGuides: boolean
) {
  const qrSize = width * 0.65;
  const textSize = Math.max(8, width * 0.02);
  
  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: theme.background,
        borderRadius: `${theme.cardRadius}px`,
        padding: `${width * 0.03}px`,
        fontFamily: theme.fontFamily,
        color: theme.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: showGuides ? "2px dashed rgba(0,0,0,0.2)" : "none",
        boxSizing: "border-box",
      }}
    >
      {/* Minimal QR (always white background) */}
      <div
        style={{
          backgroundColor: "#ffffff", // Locked to white for scanability
          padding: `${quietZone}px`,
          borderRadius: `${theme.cardRadius}px`,
          marginBottom: `${height * 0.02}px`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        }}
      >
        <QRCodeSVG value={reviewUrl} size={qrSize} level="H" includeMargin />
      </div>
      {/* Tiny text */}
      <p style={{ fontSize: `${textSize}px`, color: theme.text, opacity: 0.7, textAlign: "center", margin: 0 }}>
        Scan to review
      </p>
    </div>
  );
}

// Theme Customization View Component
function ThemeCustomizationView({ business }: { business: any }) {
  const [template, setTemplate] = useState("counter-card");
  const [themeId, setThemeId] = useState("classic");
  const [headline, setHeadline] = useState("Love your experience?");
  const [subheadline, setSubheadline] = useState("Scan to leave a quick Google review");
  const [note, setNote] = useState("It takes less than a minute");
  const [zoom, setZoom] = useState(75); // Start zoomed out to fit preview without scrolling
  const [showGuides, setShowGuides] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const reviewUrl = `${window.location.origin}/r/${business.slug}`;
  const theme = themes[themeId];

  // QR quiet zone: minimum 4 modules padding (ensures scanability)
  const QR_QUIET_ZONE = 16; // pixels of white space around QR

  const handleDownloadPNG = async () => {
    if (!previewRef.current) return;
    
    try {
      const { toPng } = await import("html-to-image");
      const dims = templateDimensions[template];
      
      // Export at full resolution (300 DPI equivalent)
      const dataUrl = await toPng(previewRef.current, {
        quality: 1.0,
        pixelRatio: 3, // 3x for 300 DPI equivalent
        backgroundColor: "#ffffff",
        width: dims.width,
        height: dims.height,
      });
      
      const link = document.createElement("a");
      link.download = `${business.slug}-${template}-${themeId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to export PNG:", error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    
    try {
      const { toPng } = await import("html-to-image");
      const jsPDF = (await import("jspdf")).default;
      
      const dims = templateDimensions[template];
      const dataUrl = await toPng(previewRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
      });
      
      const pdf = new jsPDF({
        orientation: dims.width > dims.height ? "landscape" : "portrait",
        unit: "in",
        format: [dims.width / 300, dims.height / 300],
      });
      
      const imgWidth = dims.width / 300;
      const imgHeight = dims.height / 300;
      
      pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${business.slug}-${template}-${themeId}.pdf`);
    } catch (error) {
      console.error("Failed to export PDF:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-display font-bold">QR Marketing Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customization Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template" className="text-sm font-medium text-slate-700">
                  Template
                </Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger id="template" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 shadow-lg">
                    <SelectItem value="counter-card">Counter Card (4x6)</SelectItem>
                    <SelectItem value="poster">Poster (8.5x11)</SelectItem>
                    <SelectItem value="table-tent">Table Tent (Tri-fold)</SelectItem>
                    <SelectItem value="sticker-2x2">Sticker Label (2x2)</SelectItem>
                    <SelectItem value="sticker-3x3">Sticker Label (3x3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme" className="text-sm font-medium text-slate-700">
                  Theme
                </Label>
                <Select value={themeId} onValueChange={setThemeId}>
                  <SelectTrigger id="theme" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 shadow-lg">
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="modern-bold">Modern Bold</SelectItem>
                    <SelectItem value="clean-clinic">Clean Clinic</SelectItem>
                    <SelectItem value="warm-friendly">Warm Friendly</SelectItem>
                    <SelectItem value="dark-luxe">Dark Luxe</SelectItem>
                    <SelectItem value="fresh-minimal">Fresh Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline" className="text-sm font-medium text-slate-700">
                  Headline (max 50 chars)
                </Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value.slice(0, 50))}
                  className="h-10"
                  maxLength={50}
                />
                <p className="text-xs text-slate-500">{headline.length}/50</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subheadline" className="text-sm font-medium text-slate-700">
                  Subheadline (max 80 chars)
                </Label>
                <Input
                  id="subheadline"
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value.slice(0, 80))}
                  className="h-10"
                  maxLength={80}
                />
                <p className="text-xs text-slate-500">{subheadline.length}/80</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note" className="text-sm font-medium text-slate-700">
                  Note (optional)
                </Label>
                <Input
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            {/* Preview Controls */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium text-slate-700 min-w-[50px] text-center">
                  {zoom}%
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setShowGuides(!showGuides)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Show Guides
              </Button>
            </div>

            {/* Download Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleDownloadPNG}
                className="flex-1 h-12 font-semibold"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="flex-1 h-12 font-semibold"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-display font-bold">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8 bg-slate-100 rounded-xl min-h-[500px] overflow-auto">
            <div
              ref={previewRef}
              className="relative"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "center",
                border: showGuides ? "2px dashed #cbd5e1" : "none",
              }}
            >
              {renderTemplate(template, theme, business, headline, subheadline, note, reviewUrl, QR_QUIET_ZONE, showGuides)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Insights View Component
function InsightsView({ business }: { business: any }) {
  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-bold">Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <BarChart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Insights view coming soon...</p>
          <Link href={`/business/${business.slug}/insights`}>
            <Button className="mt-4" variant="outline">
              View Full Insights Page
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Reviews View Component
function ReviewsView({ business }: { business: any }) {
  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-bold">Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Reviews view coming soon...</p>
          <p className="text-sm text-slate-500 mt-2">
            Total Reviews: {business.totalReviews || 0}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Complaints View Component
function ComplaintsView({ business }: { business: any }) {
  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-bold">Complaints</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Complaints view coming soon...</p>
          <p className="text-sm text-slate-500 mt-2">
            View customer concerns and feedback here
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// QR View Component
function QRView({ business }: { business: any }) {
  const reviewUrl = `${window.location.origin}/r/${business.slug}`;

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${business.slug}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const printPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(svgBlob);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${business.name} - QR Code</title>
          <style>
            @media print {
              @page {
                margin: 0;
                size: A4;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: white;
              }
            }
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: white;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .qr-container {
              text-align: center;
            }
            .qr-code {
              display: inline-block;
              padding: 20px;
              background: white;
              border: 2px solid #e2e8f0;
              border-radius: 12px;
            }
            .business-name {
              margin-top: 20px;
              font-size: 18px;
              font-weight: 600;
              color: #1e293b;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="qr-code">
              <img src="${svgUrl}" alt="QR Code" style="max-width: 100%; height: auto;" />
            </div>
            <div class="business-name">${business.name}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-bold">QR Code</CardTitle>
        <CardDescription>
          Generate and download your QR code for customer reviews
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center">
          <div className="p-8 bg-white rounded-3xl shadow-inner border-2 border-slate-200 mb-6">
            <QRCodeSVG
              id="qr-code-svg"
              value={reviewUrl}
              size={280}
              level="H"
              includeMargin
            />
          </div>

          <div className="flex gap-4 w-full max-w-md">
            <Button
              onClick={downloadQR}
              className="flex-1 rounded-xl font-semibold"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PNG
            </Button>
            <Button
              className="flex-1 rounded-xl font-semibold"
              variant="outline"
              onClick={printPDF}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print PDF
            </Button>
          </div>
        </div>

        <Separator />

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="text-sm font-semibold text-slate-900">Live URL</p>
          </div>
          <a
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 p-3 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
            title={reviewUrl}
          >
            <span className="text-sm font-medium text-slate-700 truncate flex-1 group-hover:text-blue-600 transition-colors">
              {reviewUrl}
            </span>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
