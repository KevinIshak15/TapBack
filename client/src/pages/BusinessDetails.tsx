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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, BarChart, Settings, Store, Loader2, MessageSquare, AlertTriangle, Download, Printer, ExternalLink, CheckCircle2, GripVertical, X, Plus, ZoomIn, ZoomOut, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app/AppShell";

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

  const tabItems: { id: TabType; label: string; icon: typeof Settings }[] = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "qr", label: "QR Code", icon: QrCode },
    { id: "insights", label: "Insights", icon: BarChart },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
    { id: "complaints", label: "Complaints", icon: AlertTriangle },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-slate-900 truncate">
              {business.name}
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              {business.category}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setTab(v as TabType)} className="w-full">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-xl h-11 shadow-card flex flex-wrap gap-1">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="rounded-lg px-3 gap-1.5 data-[state=active]:bg-[hsl(var(--app-surface))] data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
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
      </div>
    </AppShell>
  );
}

// Category-specific default tags
const categoryDefaultTags: Record<string, string[]> = {
  "Restaurant": ["Great food", "Friendly staff", "Fast service", "Clean place", "Good value"],
  "Cafe": ["Great coffee", "Cozy atmosphere", "Friendly staff", "Consistent quality", "Relaxing spot"],
  "Retail": ["Helpful staff", "Good selection", "Easy checkout", "Clean store", "Smooth experience"],
  "Service": ["Professional service", "On time", "Clear communication", "Quality work", "Easy to work with"],
  "Healthcare": ["Caring staff", "Professional experience", "Clean facility", "Clear explanations", "Well organized"],
  "Beauty & Wellness": ["Relaxing experience", "Friendly staff", "Great results", "Clean space", "Professional service"],
  "Automotive": ["Honest service", "Quick turnaround", "Fair pricing", "Knowledgeable staff", "Quality work"],
  "Home Services": ["On time", "Professional team", "Clean work", "Clear pricing", "Job done right"],
  "Education": ["Supportive staff", "Clear instruction", "Positive environment", "Well organized", "Helpful experience"],
  "Entertainment": ["Great experience", "Fun atmosphere", "Friendly staff", "Well organized", "Would come again"],
  "Fitness & Sports": ["Clean facility", "Motivating trainers", "Friendly staff", "Great workouts", "Welcoming environment"],
  "Real Estate": ["Professional agent", "Responsive", "Knowledgeable", "Smooth process", "Helpful guidance"],
  "Legal": ["Professional service", "Clear communication", "Responsive", "Knowledgeable", "Helpful guidance"],
  "Financial": ["Clear advice", "Professional staff", "Easy process", "Helpful support", "Trustworthy service"],
  "Travel & Hospitality": ["Friendly staff", "Clean rooms", "Comfortable stay", "Great location", "Would stay again"],
  "Other": ["Great service", "Friendly staff", "Professional experience", "Clean environment", "Highly recommend"],
};

// Get default tags for a category, fallback to generic if category not found
function getDefaultTagsForCategory(category: string): string[] {
  return categoryDefaultTags[category] || categoryDefaultTags["Other"];
}

// Business Settings View Component
function BusinessSettingsView({ business }: { business: any }) {
  const { toast } = useToast();
  const updateMutation = useUpdateBusiness();
  const [activeTab, setActiveTab] = useState("business-info");
  // Default tags that always show (category-specific)
  const defaultTags = getDefaultTagsForCategory(business.category || "Other");
  // Custom tags stored in database (max 2 additional)
  const [customTags, setCustomTags] = useState<string[]>(
    business.focusAreas && business.focusAreas.length > 0 
      ? business.focusAreas.filter((tag: string) => !defaultTags.includes(tag))
      : []
  );
  const [newTag, setNewTag] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // All tags for display (defaults + custom)
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

  const form = useForm<Partial<InsertBusiness>>({
    resolver: zodResolver(insertBusinessSchema.partial()),
    defaultValues: {
      name: business.name,
      category: business.category,
      googleReviewUrl: business.googleReviewUrl,
    },
  });

  // Reset form when business data changes
  useEffect(() => {
    form.reset({
      name: business.name,
      category: business.category,
      googleReviewUrl: business.googleReviewUrl,
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

  const handleAddTag = () => {
    if (newTag.trim() && customTags.length < 2 && !allTags.includes(newTag.trim())) {
      setCustomTags([...customTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (index: number) => {
    // Only allow removing custom tags (not defaults)
    // Index is relative to allTags, so we need to adjust for default tags
    const actualIndex = index - defaultTags.length;
    if (actualIndex >= 0) {
      setCustomTags(customTags.filter((_, i) => i !== actualIndex));
    }
  };

  const handleDragStart = (index: number) => {
    // Only allow dragging custom tags
    if (index >= defaultTags.length) {
      setDraggedIndex(index);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    // Only allow reordering custom tags (not defaults)
    if (index < defaultTags.length || draggedIndex < defaultTags.length) {
      return;
    }

    const newCustomTags = [...customTags];
    const draggedItem = newCustomTags[draggedIndex - defaultTags.length];
    newCustomTags.splice(draggedIndex - defaultTags.length, 1);
    newCustomTags.splice(index - defaultTags.length, 0, draggedItem);
    setCustomTags(newCustomTags);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };


  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-bold">Business Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="business-info">Business Information</TabsTrigger>
            <TabsTrigger value="review-options">Review Options</TabsTrigger>
          </TabsList>

          {/* Tab 1: Business Information */}
          <TabsContent value="business-info" className="space-y-6">
            <form onSubmit={form.handleSubmit(handleSaveBusinessInfo)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                    Business Name *
                  </Label>
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
                  <Label htmlFor="category" className="text-sm font-medium text-slate-700">
                    Category *
                  </Label>
                  <Input
                    id="category"
                    {...form.register("category")}
                    className="mt-1"
                    placeholder="e.g., Restaurant, Salon, Clinic"
                  />
                  {form.formState.errors.category && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.category.message}</p>
                  )}
                </div>

                <Separator />

                <div>
                  <Label htmlFor="googleReviewUrl" className="text-sm font-medium text-slate-700">
                    Google Review URL *
                  </Label>
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

              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Changes
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Tab 2: Review Options */}
          <TabsContent value="review-options" className="space-y-6">
            <div className="space-y-6">
              {/* Tags Section */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Focus Areas (Tags)
                </Label>
                <p className="text-xs text-slate-500 mb-4">
                  These tags appear as options for customers to select when leaving a review. Default tags for {business.category || "your category"} are always shown. You can add up to 2 additional custom tags.
                </p>

                <div className="space-y-2 mb-4">
                  {/* Default tags (always shown, non-removable) */}
                  {defaultTags.map((tag, index) => (
                    <div
                      key={`default-${tag}`}
                      className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <GripVertical className="w-4 h-4 text-slate-300" />
                      <span className="flex-1 font-medium text-slate-900">{tag}</span>
                      <span className="text-xs text-slate-400 px-2 py-1 bg-slate-100 rounded">Default</span>
                    </div>
                  ))}
                  
                  {/* Custom tags (removable, draggable) */}
                  {customTags.map((tag, index) => {
                    const displayIndex = defaultTags.length + index;
                    return (
                      <div
                        key={`custom-${index}`}
                        draggable
                        onDragStart={() => handleDragStart(displayIndex)}
                        onDragOver={(e) => handleDragOver(e, displayIndex)}
                        onDragEnd={handleDragEnd}
                        className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-move hover:bg-slate-100 transition-colors"
                      >
                        <GripVertical className="w-4 h-4 text-slate-400" />
                        <span className="flex-1 font-medium text-slate-900">{tag}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTag(displayIndex)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {customTags.length < 2 && (
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add a custom tag (max 2)"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!newTag.trim() || customTags.length >= 2 || allTags.includes(newTag.trim())}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    type="button"
                    onClick={handleSaveTags}
                    disabled={updateMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Save Tags
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

            </div>
          </TabsContent>
        </Tabs>
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
