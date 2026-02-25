/**
 * Shared layout for all business sub-pages so the header + tab bar
 * (Settings, QR Code, Insights, Reviews, Complaints) always stay visible.
 */
import { Link, useLocation } from "wouter";
import { AppShell } from "@/components/app/AppShell";
import { Store, Settings, QrCode, BarChart, MessageSquare, AlertTriangle, Palette, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";

type TabId = "settings" | "review-options" | "qr" | "posters" | "insights" | "reviews" | "concerns";

const TAB_ITEMS: { id: TabId; label: string; icon: typeof Settings }[] = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "review-options", label: "Review Options", icon: Palette },
  { id: "qr", label: "QR Code", icon: QrCode },
  { id: "posters", label: "QR Marketing", icon: FileImage },
  { id: "insights", label: "Insights", icon: BarChart },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
  { id: "concerns", label: "Concerns", icon: AlertTriangle },
];

const PATH_TAB_IDS: TabId[] = ["review-options", "posters", "insights", "reviews", "concerns"];

function getActiveTab(pathname: string): TabId {
  if (pathname.endsWith("/qr")) return "qr";
  if (pathname.endsWith("/posters")) return "posters";
  if (pathname.endsWith("/insights")) return "insights";
  if (pathname.endsWith("/reviews")) return "reviews";
  if (pathname.endsWith("/concerns")) return "concerns";
  const segment = pathname.split("/").filter(Boolean)[2];
  return PATH_TAB_IDS.includes(segment as TabId) ? (segment as TabId) : "settings";
}

interface BusinessLayoutProps {
  business: { name: string; category: string };
  slug: string;
  children: React.ReactNode;
}

export function BusinessLayout({ business, slug, children }: BusinessLayoutProps) {
  const [location] = useLocation();
  const pathname = location.split("?")[0];
  const activeTab = getActiveTab(pathname);

  const tabHref = (tab: TabId) => {
    if (tab === "qr") return `/business/${slug}/qr`;
    if (tab === "posters") return `/business/${slug}/posters`;
    if (tab === "settings") return `/business/${slug}`;
    if (tab === "insights") return `/business/${slug}/insights`;
    if (tab === "reviews") return `/business/${slug}/reviews`;
    if (tab === "concerns") return `/business/${slug}/concerns`;
    return `/business/${slug}/${tab}`;
  };

  return (
    <AppShell>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Store className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-slate-900 truncate leading-tight">
              {business.name}
            </h1>
            <p className="text-[11px] text-slate-600 leading-tight">
              {business.category}
            </p>
          </div>
        </div>

        <div className="flex justify-center w-full">
          <nav
            className="bg-white border border-slate-200 p-0.5 rounded-lg h-8 shadow-sm inline-flex flex-wrap gap-0.5 justify-center"
            aria-label="Business sections"
          >
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tabHref(tab.id)}
                className={cn(
                  "inline-flex items-center justify-center rounded-md px-2 gap-0.5 h-6 text-[11px] font-medium transition-colors",
                  isActive
                    ? "bg-[hsl(var(--app-surface))] text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon className="h-3 w-3 shrink-0" />
                {tab.label}
              </Link>
            );
          })}
          </nav>
        </div>

        {/* Slightly zoomed-out content so more fits without scrolling */}
        <div className="business-page-content">
          {children}
        </div>
      </div>
    </AppShell>
  );
}
