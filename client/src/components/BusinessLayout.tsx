/**
 * Shared layout for all business sub-pages so the header + tab bar
 * (Settings, QR Code, Insights, Reviews, Complaints) always stay visible.
 */
import { Link, useLocation } from "wouter";
import { AppShell } from "@/components/app/AppShell";
import { Store, Settings, QrCode, BarChart, MessageSquare, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type TabId = "settings" | "qr" | "insights" | "reviews" | "complaints";

const TAB_ITEMS: { id: TabId; label: string; icon: typeof Settings }[] = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "qr", label: "QR Code", icon: QrCode },
  { id: "insights", label: "Insights", icon: BarChart },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
  { id: "complaints", label: "Complaints", icon: AlertTriangle },
];

function getActiveTab(pathname: string, search: string): TabId {
  if (pathname.endsWith("/qr")) return "qr";
  const tab = new URLSearchParams(search).get("tab");
  const valid: TabId[] = ["settings", "insights", "reviews", "complaints"];
  return valid.includes(tab as TabId) ? (tab as TabId) : "settings";
}

interface BusinessLayoutProps {
  business: { name: string; category: string };
  slug: string;
  children: React.ReactNode;
}

export function BusinessLayout({ business, slug, children }: BusinessLayoutProps) {
  const [location] = useLocation();
  const pathname = location.split("?")[0];
  const search = location.includes("?") ? "?" + location.split("?")[1] : "";
  const activeTab = getActiveTab(pathname, search);

  const tabHref = (tab: TabId) => {
    if (tab === "qr") return `/business/${slug}/qr`;
    if (tab === "settings") return `/business/${slug}`;
    return `/business/${slug}?tab=${tab}`;
  };

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

        <div className="flex justify-center w-full">
          <nav
            className="bg-white border border-slate-200 p-1 rounded-xl h-11 shadow-card inline-flex flex-wrap gap-1 justify-center"
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
                  "inline-flex items-center justify-center rounded-lg px-3 gap-1.5 h-9 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[hsl(var(--app-surface))] text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </Link>
            );
          })}
          </nav>
        </div>

        {children}
      </div>
    </AppShell>
  );
}
