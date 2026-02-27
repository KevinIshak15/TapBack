/**
 * Shared layout for all business sub-pages so the header + tab bar
 * (Settings, QR Code, Insights, Reviews, Complaints) always stay visible.
 */
import { Link, useLocation } from "wouter";
import { AppShell } from "@/components/app/AppShell";
import { useNewConcernsCount } from "@/hooks/use-businesses";
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
  business: { id: number; name: string; category: string };
  slug: string;
  children: React.ReactNode;
}

export function BusinessLayout({ business, slug, children }: BusinessLayoutProps) {
  const [location] = useLocation();
  const pathname = location.split("?")[0];
  const activeTab = getActiveTab(pathname);
  const newConcernsCount = useNewConcernsCount(business.id);

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
      <div className="h-full flex flex-col min-h-0 space-y-1">
        <div className="flex items-center gap-2 shrink-0 py-0.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Store className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate leading-tight">
              {business.name}
            </h1>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {business.category}
            </p>
          </div>
        </div>

        <div className="flex justify-center w-full shrink-0">
          <nav
            className="bg-card border border-border p-1 rounded-xl h-11 shadow-[0_8px_30px_rgba(0,0,0,0.04)] inline-flex flex-wrap gap-0.5 justify-center"
            aria-label="Business sections"
          >
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const showConcernsBadge = tab.id === "concerns" && newConcernsCount > 0;
            return (
              <Link
                key={tab.id}
                href={tabHref(tab.id)}
                className={cn(
                  "relative inline-flex items-center justify-center rounded-lg px-3 gap-1.5 h-9 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
                {showConcernsBadge && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-bold border-2 border-white"
                    aria-label={`${newConcernsCount} new concerns`}
                  >
                    {newConcernsCount > 99 ? "99+" : newConcernsCount}
                  </span>
                )}
              </Link>
            );
          })}
          </nav>
        </div>

        {/* Tab content: full-bleed, no grey box or max-width */}
        <div className="business-page-content flex-1 min-h-0 overflow-hidden flex flex-col w-full">
          {children}
        </div>
      </div>
    </AppShell>
  );
}
