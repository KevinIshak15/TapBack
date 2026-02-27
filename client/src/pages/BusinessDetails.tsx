import { Link, useRoute, useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBusinessSchema, type InsertBusiness } from "@shared/schema";
import { useUser } from "@/hooks/use-auth";
import { useBusinessBySlug, useUpdateBusiness, useRefreshGoogleReviewUrl, PLACEHOLDER_GOOGLE_URL, useBusinessReviews, useGoogleReviews } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { QrCode, BarChart, Settings, Store, Loader2, MessageSquare, AlertTriangle, Download, Printer, ExternalLink, CheckCircle2, X, Plus, ZoomIn, ZoomOut, Eye, Palette, ChevronDown, Filter, ArrowUpDown, Calendar, Star, Trash2, Clock, RefreshCw } from "lucide-react";
import {
  CATEGORIES,
  getDefaultTagsForCategory,
  OPTIONAL_TAG_BANK,
  isOptionalBankTag,
} from "@/lib/categoriesAndTags";
import { makeLogoTransparent } from "@/lib/logoToTransparent";
import { ConfirmDeleteBusinessDialog } from "@/components/ConfirmDeleteBusinessDialog";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";
import { BusinessLayout } from "@/components/BusinessLayout";
import { PostersView } from "@/pages/BusinessPosters";
import { InsightsPage } from "@/pages/business/InsightsPage";
import { ReviewsPage } from "@/pages/business/ReviewsPage";
import { ConcernsPage } from "@/pages/business/ConcernsPage";
import { REVIEW_THEMES, getReviewTheme, type ReviewThemeId } from "@/lib/reviewThemes";

type TabType = "settings" | "review-options" | "qr" | "posters" | "insights" | "reviews" | "concerns";

const PATH_TABS: TabType[] = ["review-options", "posters", "insights", "reviews", "concerns"];

function getTabFromPath(pathname: string): TabType {
  if (typeof window === "undefined") return "settings";
  const segment = pathname.split("/").filter(Boolean)[2]; // business, slug, tab
  if (segment === "feedback") return "reviews"; // legacy redirect
  return PATH_TABS.includes(segment as TabType) ? (segment as TabType) : "settings";
}

export default function BusinessDetails() {
  const [, params] = useRoute("/business/:slug/:tab?");
  const [location, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useUser();
  const slug = params?.slug || "";
  const pathname = location.split("?")[0];
  const activeTab = getTabFromPath(pathname);
  const { data: business, isLoading: businessLoading } = useBusinessBySlug(slug);

  const setTab = (tab: TabType) => {
    if (tab === "qr") {
      setLocation(`/business/${slug}/qr`);
      return;
    }
    const url = tab === "settings" ? `/business/${slug}` : `/business/${slug}/${tab}`;
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

  // Legacy: redirect /business/:slug/feedback to /business/:slug/reviews
  useEffect(() => {
    if (pathname.endsWith("/feedback")) {
      setLocation(`/business/${slug}/reviews`, { replace: true });
    }
  }, [pathname, slug, setLocation]);

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
      <Tabs value={activeTab} onValueChange={(v) => setTab(v as TabType)} className="w-full h-full min-h-0 flex flex-col">
          <TabsContent value="settings" className="mt-2 h-full min-h-0 flex flex-col overflow-hidden data-[state=inactive]:hidden">
            <BusinessSettingsView business={business} />
          </TabsContent>
          <TabsContent value="review-options" className="mt-2 h-full min-h-0 flex flex-col overflow-y-auto data-[state=inactive]:hidden">
            <ReviewOptionsView business={business} />
          </TabsContent>
          <TabsContent value="qr" className="mt-2 h-full min-h-0 flex flex-col overflow-hidden data-[state=inactive]:hidden">
            <QRView business={business} />
          </TabsContent>
          <TabsContent value="posters" className="mt-2 h-full min-h-0 flex flex-col overflow-auto data-[state=inactive]:hidden">
            <PostersView business={business} />
          </TabsContent>
          <TabsContent value="insights" className="mt-1 h-full min-h-0 flex flex-col overflow-hidden data-[state=inactive]:hidden">
            <InsightsPage business={business} />
          </TabsContent>
          <TabsContent value="reviews" className="mt-2 h-full min-h-0 flex flex-col overflow-hidden data-[state=inactive]:hidden">
            <ReviewsPage business={business} />
          </TabsContent>
          <TabsContent value="concerns" className="mt-2 h-full min-h-0 flex flex-col overflow-hidden data-[state=inactive]:hidden">
            <ConcernsPage business={business} />
          </TabsContent>
        </Tabs>
    </BusinessLayout>
  );
}

// Business Settings View Component — Business Information only
function BusinessSettingsView({ business }: { business: any }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const updateMutation = useUpdateBusiness();
  const refreshUrlMutation = useRefreshGoogleReviewUrl(business?.slug ?? "");
  const hasTriedRefresh = useRef(false);

  const form = useForm<Partial<InsertBusiness>>({
    resolver: zodResolver(insertBusinessSchema.partial()),
    defaultValues: {
      name: business.name,
      category: business.category,
      googleReviewUrl: business.googleReviewUrl,
      logo: business.logo ?? "",
    },
  });

  // Reset form when business data changes
  useEffect(() => {
    form.reset({
      name: business.name,
      category: business.category,
      googleReviewUrl: business.googleReviewUrl,
      logo: business.logo ?? "",
    });
  }, [business, form]);

  // Auto-refresh Google Review URL when business is linked to GBP but still has placeholder URL
  useEffect(() => {
    const locationResourceName = business?.locationResourceName;
    const url = business?.googleReviewUrl;
    if (
      !locationResourceName ||
      !url ||
      url !== PLACEHOLDER_GOOGLE_URL ||
      hasTriedRefresh.current
    ) {
      return;
    }
    hasTriedRefresh.current = true;
    refreshUrlMutation.mutate(business.id, {
      onSuccess: (data) => {
        if (data?.updated) {
          toast({
            title: "Google Review URL updated",
            description: "Filled from your Google Business Profile.",
          });
        } else {
          toast({
            title: "Could not get URL from Google",
            description: data?.message ?? "Paste your review link from Google Maps manually.",
          });
        }
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Could not refresh URL",
          description: "Paste your Google review link manually.",
        });
      },
    });
  }, [business?.id, business?.locationResourceName, business?.googleReviewUrl, business?.slug]);

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

  return (
    <>
    <div className="w-full min-h-full overflow-hidden bg-background font-display text-foreground">
    <div className="w-full px-2 sm:px-4 lg:px-6 py-3 md:py-4 flex-1 min-h-0 overflow-auto">
    <div className="pb-4 mb-4 border-b border-border">
      <h2 className="text-lg font-display font-bold text-foreground">Settings</h2>
      <p className="text-sm text-muted-foreground mt-1">Manage your business details and profile.</p>
    </div>
    <div className="mt-6">
    <Card className="bg-card border border-border rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <CardContent className="pt-4 px-4 pb-4">
        <div className="max-w-2xl">
          <h3 className="text-xs font-semibold text-foreground mb-2">Business Information</h3>
            <form onSubmit={form.handleSubmit(handleSaveBusinessInfo)} className="space-y-2">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-foreground">Business Name *</Label>
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
                <Label className="text-sm font-medium text-foreground">Category *</Label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-1">Search to find your business type. Used for review tags and SEO.</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full mt-1 justify-between h-10 font-normal",
                        !form.watch("category") && "text-muted-foreground"
                      )}
                    >
                      {form.watch("category") || "Select category..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0 z-[100] bg-card border border-border shadow-lg overflow-hidden"
                    align="start"
                    sideOffset={4}
                  >
                    <Command className="bg-card rounded-md border-0">
                      <CommandInput placeholder="Search category..." className="bg-card" />
                      <CommandList className="max-h-[280px] overflow-y-auto bg-card">
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup className="bg-card p-1">
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
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Label htmlFor="googleReviewUrl" className="text-sm font-medium text-foreground">Google Review URL *</Label>
                  {business?.locationResourceName && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      disabled={refreshUrlMutation.isPending}
                      onClick={() => {
                        refreshUrlMutation.mutate(business.id, {
                          onSuccess: (data) => {
                            if (data?.updated) {
                              toast({
                                title: "Google Review URL updated",
                                description: "The field has been filled from your Google Business Profile.",
                              });
                            } else {
                              toast({
                                title: "Could not get URL from Google",
                                description: data?.message ?? "Paste your review link from Google Maps or Search manually.",
                              });
                            }
                          },
                          onError: (err: Error) => {
                            toast({
                              variant: "destructive",
                              title: "Refresh failed",
                              description: err.message ?? "Could not fetch URL from Google. Paste it manually.",
                            });
                          },
                        });
                      }}
                    >
                      {refreshUrlMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                      <span className="ml-1.5">{refreshUrlMutation.isPending ? "Refreshing…" : "Refresh from Google"}</span>
                    </Button>
                  )}
                </div>
                <Input
                  id="googleReviewUrl"
                  {...form.register("googleReviewUrl")}
                  className="mt-1"
                  placeholder="https://www.google.com/..."
                />
                {business?.locationResourceName && (
                  <p className="text-xs text-muted-foreground mt-1">Linked to Google Business Profile. Use the button above to fill this from Google.</p>
                )}
                {form.formState.errors.googleReviewUrl && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.googleReviewUrl.message}</p>
                )}
              </div>
              <Separator />
              <div>
                <Label htmlFor="logo" className="text-sm font-medium text-foreground">Logo (optional)</Label>
                <p className="text-xs text-muted-foreground mt-0.5 mb-1">Any image format. We make the background transparent so it looks clean on your QR code and review flow.</p>
                {form.watch("logo") ? (
                  <div className="mt-2 flex items-center gap-3 flex-wrap">
                    <img
                      src={form.watch("logo")}
                      alt="Logo preview"
                      className="h-14 w-auto max-w-[140px] object-contain rounded border border-border bg-card"
                    />
                    <div className="flex gap-2">
                      <Label htmlFor="logo-file" className="cursor-pointer">
                        <span className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-muted hover:bg-muted/80 text-foreground">
                          Upload picture
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
                      <span className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 border border-input bg-background hover:bg-muted/50">
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
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-1">Danger zone</h3>
          <p className="text-xs text-muted-foreground mb-3">Permanently remove this business and all its data.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete business
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
    </div>
    </div>
    <ConfirmDeleteBusinessDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      business={{ id: business.id, name: business.name }}
      onDeleted={() => setLocation("/dashboard")}
    />
  </>
  );
}

// Review Options View — Focus Areas (tags), Review page theme, Live Preview
function ReviewOptionsView({ business }: { business: any }) {
  const { toast } = useToast();
  const updateMutation = useUpdateBusiness();
  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    business.reviewTheme || "classic"
  );
  const [customTags, setCustomTags] = useState<string[]>(
    business.focusAreas && business.focusAreas.length > 0
      ? business.focusAreas.filter((tag: string) => !getDefaultTagsForCategory(business.category || "Other").includes(tag))
      : []
  );
  const [newTag, setNewTag] = useState("");

  const defaultTags = getDefaultTagsForCategory(business.category || "Other");
  const allTags = [...defaultTags, ...customTags];

  useEffect(() => {
    const currentDefaultTags = getDefaultTagsForCategory(business.category || "Other");
    setCustomTags(
      business.focusAreas && business.focusAreas.length > 0
        ? business.focusAreas.filter((tag: string) => !currentDefaultTags.includes(tag))
        : []
    );
  }, [business.focusAreas, business.category]);

  useEffect(() => {
    setSelectedThemeId(business.reviewTheme || "classic");
  }, [business.reviewTheme]);

  const handleSaveTags = async () => {
    try {
      await updateMutation.mutateAsync({
        id: business.id,
        focusAreas: customTags,
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

  const customCount = customTags.filter((t) => !isOptionalBankTag(t)).length;
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
    <div className="w-full min-h-full bg-background font-display text-foreground">
    <div className="w-full px-2 sm:px-4 lg:px-6 py-3 md:py-4">
    <div className="pb-4 mb-4 border-b border-border">
      <h2 className="text-lg font-display font-bold text-foreground">Review Options</h2>
      <p className="text-sm text-muted-foreground mt-1">Focus areas, review page theme, and how the customer review flow will look.</p>
    </div>
    <div className="mt-6">
    <Card className="bg-card border border-border rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex-1 min-h-0 flex flex-col overflow-hidden">
      <CardContent className="flex-1 min-h-0 overflow-auto px-4 pt-4 pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr_1fr] gap-6 lg:gap-6">
        <div className="space-y-6 lg:min-w-0 border border-border rounded-2xl p-6 bg-card">
          {/* Focus Areas */}
          <section>
            <h3 className="text-sm font-bold text-foreground">Focus Areas (Tags)</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">5 tags are set by category (best for Google). Add up to 2 more from the options below or one of your own.</p>
            <div className="space-y-2 mb-4">
              {defaultTags.map((tag) => (
                <div key={`default-${tag}`} className="flex items-center gap-3 py-2.5 px-3 bg-muted/80 rounded-lg border border-border/80">
                  <span className="flex-1 font-medium text-foreground text-sm">{tag}</span>
                  <span className="text-[11px] text-muted-foreground font-normal">Best for Google</span>
                </div>
              ))}
              {customTags.map((tag, index) => {
                const displayIndex = defaultTags.length + index;
                return (
                  <div
                    key={`extra-${index}`}
                    className="flex items-center gap-2 py-2.5 px-3 bg-primary/5 rounded-lg border border-primary/20 text-sm"
                  >
                    <span className="flex-1 font-medium text-foreground">{tag}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveTag(displayIndex)} className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600">
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
            {customTags.length < 2 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Add from options (max 2 total) or your own (max 1 custom).</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {OPTIONAL_TAG_BANK.map((tag) => {
                    const isSelected = customTags.includes(tag);
                    return (
                      <Button
                        key={tag}
                        type="button"
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-9 text-sm rounded-lg transition-colors",
                          isSelected
                            ? "bg-primary text-white border-primary hover:bg-primary/90"
                            : "bg-card border-border text-foreground hover:bg-muted/50"
                        )}
                        disabled={!canAddFromBank || isSelected}
                        onClick={() => handleAddFromBank(tag)}
                      >
                        {tag}
                        <Plus className="w-3.5 h-3.5 ml-1 opacity-80" />
                      </Button>
                    );
                  })}
                </div>
                <div className="flex gap-2 items-center">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomTag(); } }}
                    placeholder="Your own tag (max 1)"
                    className="flex-1 h-9 text-sm rounded-lg border-border"
                    disabled={!canAddCustom}
                  />
                  <Button type="button" size="sm" onClick={handleAddCustomTag} disabled={!canAddCustom || !newTag.trim() || allTags.includes(newTag.trim())} className="h-9 px-4 shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            <Button type="button" size="sm" onClick={handleSaveTags} disabled={updateMutation.isPending} className="mt-4 h-9 px-4 bg-primary text-white hover:bg-primary/90 rounded-lg">
              {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Clock className="w-3.5 h-3.5 mr-2" />}
              Save Tags
            </Button>
          </section>
        </div>

        {/* Review page theme - own column for more width, theme options on the right */}
        <div className="lg:min-w-0 border border-border rounded-2xl p-6 bg-card">
          <section>
            <div>
              <h3 className="text-sm font-bold text-foreground">Review page theme</h3>
              <p className="text-sm text-muted-foreground mt-1">Used on the customer review flow (experience, tags, AI step).</p>
            </div>
            <div className="flex justify-end mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-2xl">
              {Object.values(REVIEW_THEMES).map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedThemeId(theme.id)}
                  className={cn(
                    "rounded-xl border-2 p-4 text-left transition-all w-full min-w-0 flex flex-col gap-3",
                    selectedThemeId === theme.id
                      ? "border-primary shadow-md bg-primary/5"
                      : "border-border hover:border-border hover:shadow-sm"
                  )}
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
                    <p className="font-semibold text-foreground text-sm">{theme.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{theme.description}</p>
                  </div>
                </button>
              ))}
              </div>
            </div>
            <Button type="button" size="sm" onClick={handleSaveTheme} disabled={updateMutation.isPending} className="mt-4 h-9 px-4 bg-primary text-white hover:bg-primary/90 rounded-lg shrink-0">
              {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Clock className="w-3.5 h-3.5 mr-2" />}
              Save theme
            </Button>
          </section>
        </div>

        {/* Live Preview */}
        <div className="rounded-2xl border border-border bg-muted/50 p-6 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            LIVE PREVIEW
          </p>
          <div className="flex justify-center">
            <div className="w-full max-w-[375px] rounded-[2rem] border-[10px] border-border bg-card shadow-xl overflow-hidden">
              <div className="rounded-[1.25rem] overflow-hidden bg-card min-h-[720px] flex flex-col">
                <div
                  className="p-4 flex flex-col gap-6"
                  style={{
                    background: selectedTheme.pageBackground ?? selectedTheme.background,
                    color: selectedTheme.text,
                    fontFamily: selectedTheme.fontFamily,
                  }}
                >
                  <div className="space-y-3">
                    <p className="text-xs font-semibold tracking-wide opacity-90" style={{ color: selectedTheme.text }}>
                      How was your experience at{" "}
                      <span className="font-bold" style={{ color: selectedTheme.text }}>{business.name}</span>
                      ?
                    </p>
                    {business.logo && (
                      <div className="flex justify-center items-center pt-2 pb-1 h-28 max-w-[220px] mx-auto">
                        <img src={business.logo} alt="" className="object-contain w-full h-full" style={{ maxHeight: 112, maxWidth: 220, objectFit: "contain" }} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
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
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-60">2. What stood out?</p>
                    <p className="text-base font-medium">Pick any that apply (optional).</p>
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
                    <p className="text-xs font-medium uppercase tracking-wide opacity-70 mt-2 mb-1" style={{ color: selectedTheme.text }}>
                      Anything else to add?
                    </p>
                    <div
                      className="w-full min-h-[2.5rem] rounded-xl border-2 px-3 py-2 text-sm flex items-center"
                      style={{
                        borderColor: selectedTheme.primary + "60",
                        background: selectedTheme.cardBg ?? "#fff",
                        color: selectedTheme.text,
                      }}
                    >
                      <span className="text-sm opacity-50" style={{ color: selectedTheme.text }}>
                        e.g. specific staff member, wait time...
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-60">3. AI-generated review</p>
                    <p className="text-base font-semibold">Review Ready!</p>
                    <p className="text-xs opacity-80">Review generated based on your inputs</p>
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
                  <p className="text-xs opacity-50 pt-2" style={{ color: selectedTheme.text }}>
                    Powered by{" "}
                    <a
                      href="https://revsboost.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:opacity-80"
                      style={{ color: selectedTheme.text }}
                    >
                      RevsBoost
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </CardContent>
    </Card>
    </div>
    </div>
    </div>
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
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-display font-bold">QR Marketing Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customization Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template" className="text-sm font-medium text-foreground">
                  Template
                </Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger id="template" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border shadow-lg">
                    <SelectItem value="counter-card">Counter Card (4x6)</SelectItem>
                    <SelectItem value="poster">Poster (8.5x11)</SelectItem>
                    <SelectItem value="table-tent">Table Tent (Tri-fold)</SelectItem>
                    <SelectItem value="sticker-2x2">Sticker Label (2x2)</SelectItem>
                    <SelectItem value="sticker-3x3">Sticker Label (3x3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme" className="text-sm font-medium text-foreground">
                  Theme
                </Label>
                <Select value={themeId} onValueChange={setThemeId}>
                  <SelectTrigger id="theme" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border shadow-lg">
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
                <Label htmlFor="headline" className="text-sm font-medium text-foreground">
                  Headline (max 50 chars)
                </Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value.slice(0, 50))}
                  className="h-10"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">{headline.length}/50</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subheadline" className="text-sm font-medium text-foreground">
                  Subheadline (max 80 chars)
                </Label>
                <Input
                  id="subheadline"
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value.slice(0, 80))}
                  className="h-10"
                  maxLength={80}
                />
                <p className="text-xs text-muted-foreground">{subheadline.length}/80</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note" className="text-sm font-medium text-foreground">
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
                <span className="text-sm font-medium text-foreground min-w-[50px] text-center">
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
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-display font-bold">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8 bg-muted rounded-xl min-h-[500px] overflow-auto">
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

// Insights View — all reviews with stars, who wrote them, dates, and replies (Google Business Profile)
function InsightsView({ business }: { business: any }) {
  const hasGbp = !!(business.locationResourceName);
  const {
    data: googleData,
    isLoading: googleLoading,
    isError: googleError,
    error: googleErrorDetail,
  } = useGoogleReviews(business.id, hasGbp);

  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  const reviews = googleData?.reviews ?? [];
  const sortedReviews = (() => {
    const list = [...reviews];
    if (sortBy === "newest") list.sort((a, b) => new Date(b.updateTime || b.createTime).getTime() - new Date(a.updateTime || a.createTime).getTime());
    else if (sortBy === "oldest") list.sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime());
    else if (sortBy === "highest") list.sort((a, b) => b.starRating - a.starRating);
    else if (sortBy === "lowest") list.sort((a, b) => a.starRating - b.starRating);
    return list;
  })();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  // No GBP linked
  if (!hasGbp) {
    return (
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-display font-bold">Insights</CardTitle>
          <CardDescription className="text-muted-foreground">Review analytics and all Google reviews in one place.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 rounded-2xl bg-muted/50 border border-dashed border-border">
            <BarChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">Connect Google Business Profile to see insights</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Link this business to a Google Business Profile location to view all reviews, star ratings, who wrote them, and your replies here.
            </p>
            <Link href="/business/new">
              <Button className="mt-4" variant="outline">Add or connect a location</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading
  if (googleLoading) {
    return (
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-display font-bold">Insights</CardTitle>
          <CardDescription className="text-muted-foreground">Review analytics and all Google reviews.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span>Loading Google reviews…</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // API error (e.g. 403/404 = My Business API not enabled)
  if (googleError && googleErrorDetail) {
    const msg = googleErrorDetail.message ?? "";
    const is404 = msg.includes("404");
    const is403 = msg.includes("403") || msg.includes("has not been used") || msg.includes("is disabled");
    return (
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-display font-bold">Insights</CardTitle>
          <CardDescription className="text-muted-foreground">Review analytics and all Google reviews.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-800">
            <p className="font-medium">Could not load Google reviews</p>
            <p className="text-sm mt-1">{msg}</p>
            {(is404 || is403) ? (
              <div className="text-xs mt-3 text-amber-700 space-y-2">
                <p><strong>One-time fix (not per client):</strong> The project number in the error is <em>your app’s</em> Google Cloud project (the one that has your OAuth client) (GOOGLE_GBP_CLIENT_ID). Enable the <strong>Google My Business API</strong> once in that project; then <em>all</em> clients who connect their Business Profile will get reviews. You do not enable anything per business profile.</p>
                <p>In Google Cloud Console, open the project that owns your GBP OAuth credentials → <strong>APIs &amp; Services → Library</strong> → search for <strong>&quot;My Business API&quot;</strong> or <strong>&quot;Google My Business API&quot;</strong> → Enable. Or use the link from the error message above. Wait a few minutes, then refresh this page.</p>
                <p>Direct link: <a href="https://console.cloud.google.com/apis/library/mybusiness.googleapis.com" target="_blank" rel="noopener noreferrer" className="underline break-all">console.cloud.google.com/apis/library/mybusiness.googleapis.com</a> (ensure the correct project is selected in the top bar).</p>
              </div>
            ) : (
              <p className="text-xs mt-3 text-amber-700">
                Enable the <strong>My Business API</strong> in your app’s Google Cloud project (APIs &amp; Services → Library).
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const averageRating = googleData?.averageRating ?? 0;
  const totalCount = googleData?.totalReviewCount ?? 0;
  const serverError = googleData?.error;
  const serverMessage = googleData?.message;

  return (
    <Card className="bg-card border border-border shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/30">
        <CardTitle className="text-2xl font-display font-bold text-foreground">Insights</CardTitle>
        <CardDescription className="text-muted-foreground">
          All Google reviews for this location: who wrote them, star ratings, and your replies.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {serverError ? (
          <div className="px-6 py-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">{serverError}</div>
        ) : serverMessage && totalCount === 0 ? (
          <div className="px-6 py-6 text-muted-foreground text-sm">{serverMessage}</div>
        ) : (
          <>
            {/* Summary + sort */}
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-2xl font-bold text-foreground">{averageRating > 0 ? averageRating.toFixed(1) : "-"}</span>
                  <span className="text-muted-foreground text-sm">average</span>
                </div>
                <div className="text-muted-foreground text-sm">
                  <span className="font-semibold text-foreground">{totalCount}</span> review{totalCount !== 1 ? "s" : ""} on Google
                </div>
              </div>
              <Select value={sortBy} onValueChange={(v: "newest" | "oldest" | "highest" | "lowest") => setSortBy(v)}>
                <SelectTrigger className="w-[160px] h-9 rounded-lg border border-border bg-card text-foreground">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="z-[100] min-w-[160px] rounded-xl border-border bg-card shadow-lg">
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="highest">Highest rated</SelectItem>
                  <SelectItem value="lowest">Lowest rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Review list */}
            <div className="px-6 py-5">
              {sortedReviews.length === 0 ? (
                <div className="text-center py-14 rounded-2xl bg-muted/50 border border-dashed border-border">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No Google reviews yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Reviews from your Google Business Profile will appear here.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {sortedReviews.map((r) => (
                    <li key={r.reviewId} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0 rounded-full border border-border">
                            {r.reviewerProfilePhotoUrl ? (
                              <AvatarImage src={r.reviewerProfilePhotoUrl} alt={r.reviewerDisplayName} className="object-cover" />
                            ) : null}
                            <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                              {r.reviewerDisplayName === "Anonymous" ? "?" : (r.reviewerDisplayName || "?").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{r.reviewerDisplayName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn("w-4 h-4", star <= r.starRating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/40")}
                            />
                          ))}
                        </div>
                      </div>
                      <time className="text-xs text-muted-foreground block mb-2" dateTime={r.createTime}>
                        {formatDate(r.updateTime || r.createTime)}
                      </time>
                      {r.comment && <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">{r.comment}</p>}
                      {r.reviewReply ? (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Your reply</p>
                          <p className="text-sm text-foreground italic">{r.reviewReply}</p>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Review item type for list
type ReviewItem = {
  id: number;
  experienceType: string;
  content?: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  isGenerated?: boolean;
};

// Reviews & Concerns View (merged) with filters, date range, sort
function ReviewsAndConcernsView({ business }: { business: any }) {
  const { data: reviews = [], isLoading } = useBusinessReviews(business.id);
  const hasGbpLocation = !!(business.locationResourceName);
  const { data: googleReviewsData, isLoading: googleReviewsLoading, isError: googleReviewsError, error: googleReviewsErrorDetail } = useGoogleReviews(business.id, hasGbpLocation);
  const updateBusiness = useUpdateBusiness();
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<"all" | "concern" | "great">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name-az" | "name-za">("newest");
  const [concernsEmail, setConcernsEmail] = useState(business.concernsNotificationEmail ?? "");
  const [savingEmail, setSavingEmail] = useState(false);

  // Sync concerns email when business updates (e.g. after save)
  useEffect(() => {
    setConcernsEmail(business.concernsNotificationEmail ?? "");
  }, [business.concernsNotificationEmail]);

  const handleSaveConcernsEmail = async () => {
    setSavingEmail(true);
    try {
      await updateBusiness.mutateAsync({
        id: business.id,
        concernsNotificationEmail: concernsEmail.trim() || undefined,
      });
      toast({ title: "Saved", description: "Concerns will be sent to this email." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed to save", description: e?.message ?? "Please try again." });
    } finally {
      setSavingEmail(false);
    }
  };

  const filtered = ((): ReviewItem[] => {
    let list: ReviewItem[] = reviews as ReviewItem[];
    if (filterType === "concern") list = list.filter((r) => r.experienceType === "concern");
    else if (filterType === "great") list = list.filter((r) => r.experienceType === "great");

    if (dateFrom || dateTo) {
      list = list.filter((r) => {
        const d = new Date(r.createdAt).getTime();
        if (dateFrom && d < new Date(dateFrom).setHours(0, 0, 0, 0)) return false;
        if (dateTo && d > new Date(dateTo).setHours(23, 59, 59, 999)) return false;
        return true;
      });
    }

    const name = (r: ReviewItem) => (r.customerName || r.customerEmail || "").toLowerCase();
    if (sortBy === "newest") list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === "oldest") list = [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sortBy === "name-az") list = [...list].sort((a, b) => name(a).localeCompare(name(b)));
    else if (sortBy === "name-za") list = [...list].sort((a, b) => name(b).localeCompare(name(a)));

    return list;
  })();

  const isEmpty = !reviews.length;
  const noResults = reviews.length > 0 && filtered.length === 0;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  };

  return (
    <Card className="bg-card border border-border shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/30">
        <CardTitle className="text-2xl font-display font-bold text-foreground">Reviews &amp; Concerns</CardTitle>
        <CardDescription className="text-muted-foreground">
          Customer reviews and private concerns in one place.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Google Business Profile reviews (when business is linked to GBP) */}
            {hasGbpLocation && (
              <div className="px-6 py-4 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Google reviews
                </h3>
                {googleReviewsLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading Google reviews…</span>
                  </div>
                ) : googleReviewsError && googleReviewsErrorDetail ? (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">{googleReviewsErrorDetail.message}</p>
                ) : googleReviewsData?.error ? (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">{googleReviewsData.error}</p>
                ) : googleReviewsData?.message ? (
                  <p className="text-sm text-muted-foreground">{googleReviewsData.message}</p>
                ) : googleReviewsData?.reviews?.length ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      {googleReviewsData.totalReviewCount} review{googleReviewsData.totalReviewCount !== 1 ? "s" : ""} on Google
                      {googleReviewsData.averageRating > 0 && ` · ${googleReviewsData.averageRating.toFixed(1)}★ average`}
                    </p>
                    <ul className="space-y-3 max-h-80 overflow-y-auto">
                      {googleReviewsData.reviews.map((r) => (
                        <li key={r.reviewId} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 shrink-0 rounded-full border border-border">
                                {r.reviewerProfilePhotoUrl ? (
                                  <AvatarImage src={r.reviewerProfilePhotoUrl} alt={r.reviewerDisplayName} className="object-cover" />
                                ) : null}
                                <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                                  {r.reviewerDisplayName === "Anonymous" ? "?" : (r.reviewerDisplayName || "?").charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-foreground">{r.reviewerDisplayName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn("w-4 h-4", star <= r.starRating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/40")}
                                />
                              ))}
                            </div>
                          </div>
                          {r.createTime && (
                            <time className="text-xs text-muted-foreground block mb-2" dateTime={r.createTime}>
                              {new Date(r.createTime).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                            </time>
                          )}
                          {r.comment && <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">{r.comment}</p>}
                          {r.reviewReply ? (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Your reply</p>
                              <p className="text-sm text-foreground italic">{r.reviewReply}</p>
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No Google reviews yet for this location.</p>
                )}
              </div>
            )}

            {/* Receive concerns at this email */}
            <div className="px-6 py-4 border-b border-border bg-muted/50">
              <Label className="text-sm font-medium text-foreground">Receive concerns at</Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                New concerns are emailed here. Leave blank to use your account email.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="email"
                  placeholder="e.g. support@yourbusiness.com"
                  value={concernsEmail}
                  onChange={(e) => setConcernsEmail(e.target.value)}
                  className="h-9 max-w-xs bg-card border-border rounded-lg text-sm"
                />
                <Button
                  size="sm"
                  className="h-9"
                  disabled={savingEmail || (concernsEmail.trim() === (business.concernsNotificationEmail ?? ""))}
                  onClick={handleSaveConcernsEmail}
                >
                  {savingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </div>
            </div>

            {/* Toolbar: filters, date range, sort */}
            <div className="border-b border-border bg-muted/80 px-6 py-4">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm">
                    <Filter className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <Select value={filterType} onValueChange={(v: "all" | "concern" | "great") => setFilterType(v)}>
                    <SelectTrigger className="w-[150px] h-9 rounded-lg border border-border !bg-card text-foreground shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 rounded-xl border-border !bg-card shadow-lg">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="concern">Concerns only</SelectItem>
                      <SelectItem value="great">Great (reviews) only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator orientation="vertical" className="h-8 hidden sm:block bg-border" />
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm">
                    <Calendar className="h-[18px] w-[18px] shrink-0" strokeWidth={2} stroke="currentColor" />
                  </div>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 min-w-[140px] bg-card border-border rounded-lg text-sm shadow-sm [color-scheme:light]"
                  />
                  <span className="text-muted-foreground text-sm font-medium">to</span>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-9 min-w-[140px] bg-card border-border rounded-lg text-sm shadow-sm [color-scheme:light]"
                  />
                </div>
                <Separator orientation="vertical" className="h-8 hidden sm:block bg-border" />
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm">
                    <ArrowUpDown className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <Select value={sortBy} onValueChange={(v: "newest" | "oldest" | "name-az" | "name-za") => setSortBy(v)}>
                    <SelectTrigger className="w-[150px] h-9 rounded-lg border border-border !bg-card text-foreground shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 rounded-xl border-border !bg-card shadow-lg">
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                      <SelectItem value="name-az">Name A–Z</SelectItem>
                      <SelectItem value="name-za">Name Z–A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              {isEmpty ? (
                <div className="text-center py-14 rounded-2xl bg-muted/50 border border-dashed border-border">
                  <div className="flex justify-center gap-3 mb-4">
                    <MessageSquare className="w-12 h-12 text-muted-foreground" />
                    <AlertTriangle className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No reviews or concerns yet</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    When customers use your review link, their feedback will appear here.
                  </p>
                </div>
              ) : noResults ? (
                <div className="text-center py-14 rounded-2xl bg-muted/50 border border-dashed border-border">
                  <p className="text-muted-foreground font-medium">No items match the current filters or date range.</p>
                  <Button variant="outline" size="sm" className="mt-4 rounded-lg" onClick={() => { setFilterType("all"); setDateFrom(""); setDateTo(""); }}>
                    Clear filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {reviews.length} item{reviews.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ul className="space-y-4">
                    {filtered.map((r) => (
                      <li
                        key={r.id}
                        className={cn(
                          "rounded-2xl border text-left shadow-sm transition-shadow hover:shadow-md",
                          r.experienceType === "concern"
                            ? "border-rose-200/80 bg-gradient-to-br from-rose-50/80 to-card"
                            : "border-border/80 bg-gradient-to-br from-muted/50 to-card"
                        )}
                      >
                        <div className="p-5">
                          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                            <span
                              className={cn(
                                "inline-flex items-center text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md",
                                r.experienceType === "concern"
                                  ? "bg-rose-100 text-rose-800 border border-rose-200/60"
                                  : "bg-emerald-100 text-emerald-800 border border-emerald-200/60"
                              )}
                            >
                              {r.experienceType === "concern" ? "Concern" : "Review"}
                            </span>
                            <time className="text-xs text-muted-foreground tabular-nums" dateTime={r.createdAt}>
                              {formatDate(r.createdAt)}
                            </time>
                          </div>
                          {r.content && (
                            <p className="text-foreground whitespace-pre-wrap text-[15px] leading-relaxed mb-4">{r.content}</p>
                          )}
                          {(r.customerName || r.customerEmail || r.customerPhone) && (
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground pt-3 border-t border-border">
                              {r.customerName && <span className="font-medium text-foreground">{r.customerName}</span>}
                              {r.customerEmail && (
                                <a href={`mailto:${r.customerEmail}`} className="text-[hsl(var(--primary))] hover:underline font-medium">
                                  {r.customerEmail}
                                </a>
                              )}
                              {r.customerPhone && <span className="text-muted-foreground">{r.customerPhone}</span>}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </>
        )}
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
    <div className="w-full min-h-full overflow-hidden bg-background font-display text-foreground">
      <div className="w-full px-2 sm:px-4 lg:px-6 py-3 md:py-4 flex-1 min-h-0 overflow-auto">
        <div className="pb-4 mb-4 border-b border-border">
          <h2 className="text-lg font-display font-bold text-foreground">QR Code</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and download your QR code for customer reviews.
          </p>
        </div>
        <Card className="bg-card border border-border rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-col items-center">
          <div className="p-8 bg-muted/30 rounded-3xl shadow-inner border-2 border-border mb-6">
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

        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="text-sm font-semibold text-foreground">Live URL</p>
          </div>
          <a
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 p-3 rounded-lg bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all"
            title={reviewUrl}
          >
            <span className="text-sm font-medium text-foreground truncate flex-1 group-hover:font-bold transition-colors">
              {reviewUrl}
            </span>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0 transition-colors" />
          </a>
        </div>
      </CardContent>
    </Card>
      </div>
    </div>
  );
}
