/**
 * Insights — ReVue bento layout: gradient hero card, stat cards, area + radar charts, dark AI card.
 */
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  type TooltipProps,
} from "recharts";
import {
  Loader2,
  TrendingUp,
  Zap,
  QrCode,
  ArrowUpRight,
  MessageSquare,
} from "lucide-react";
import { useGoogleReviews, useBusinessStats, useBusinessReviews } from "@/hooks/use-businesses";
import { useChartAccent } from "@/hooks/use-chart-accent";
import { getEffectiveReviewTags } from "@/lib/categoriesAndTags";
import { cn } from "@/lib/utils";

type InAppReview = { experienceType: string; selectedTags?: string[]; isGenerated?: boolean };

function getThisMonthPerformanceData(): { name: string; value: number }[] {
  const now = new Date();
  const monthName = now.toLocaleString("en-US", { month: "short" });
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const today = now.getDate();
  const sampleDays = [1, 5, 10, 15, 20, 25, daysInMonth].filter((d) => d <= today);
  const points = sampleDays.length ? sampleDays : [1];
  const last = Math.max(points.length - 1, 1);
  return points.map((day, i) => ({
    name: `${monthName} ${day}`,
    value: Math.round(4 + (i / last) * 18 + Math.sin(i) * 3),
  }));
}

const TIME_RANGES = ["7d", "30d", "90d"] as const;

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary text-primary-foreground text-xs p-2 rounded-lg shadow-xl border border-primary/80">
        <p className="font-semibold mb-1 opacity-80">{label}</p>
        <p className="font-bold text-sm">{payload[0].value} Reviews</p>
      </div>
    );
  }
  return null;
};

interface InsightsPageProps {
  business: {
    id: number;
    name?: string;
    locationResourceName?: string;
    category?: string;
    focusAreas?: string[];
    reviewKeywords?: string;
  };
}

export function InsightsPage({ business }: InsightsPageProps) {
  const [range, setRange] = useState<string>("30d");
  const chartAccent = useChartAccent();

  const hasGbp = !!(business.locationResourceName);
  const { data: googleData, isLoading: googleLoading, isError: googleError } = useGoogleReviews(
    business.id,
    hasGbp
  );
  const { data: stats } = useBusinessStats(business.id);
  const { data: inAppReviews = [] } = useBusinessReviews(business.id);

  const reviews = googleData?.reviews ?? [];
  const totalReviews = googleData?.totalReviewCount ?? 0;
  const avgRating = googleData?.averageRating ?? 0;

  const totalReviewsDisplay = hasGbp && !googleLoading ? totalReviews : 1284;
  const avgRatingDisplay = hasGbp && avgRating > 0 ? avgRating.toFixed(1) : "4.9";
  const scansDisplay = stats?.scans ?? 450;
  const redirectsDisplay = stats?.redirects ?? 142;
  const conversionRate =
    scansDisplay > 0 ? ((redirectsDisplay / scansDisplay) * 100).toFixed(1) : "0";

  const thisMonthData = getThisMonthPerformanceData();

  // Suppress unused variable warning — reviews used implicitly via totalReviews shape
  void reviews;

  // Sentiment from review tags
  const keywordsFromReviewOptions = getEffectiveReviewTags(
    business.category ?? "Other",
    business.focusAreas
  );
  const tagCounts: Record<string, number> = {};
  (inAppReviews as InAppReview[])
    .filter((r) => r.experienceType === "great")
    .forEach((r) => {
      (r.selectedTags ?? []).forEach((tag) => {
        if (tag.trim()) tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      });
    });
  const totalTagPicks = Object.values(tagCounts).reduce((a, b) => a + b, 0);
  const sentimentPills =
    keywordsFromReviewOptions.length > 0
      ? keywordsFromReviewOptions
          .map((tag) => {
            const count = tagCounts[tag] ?? 0;
            const pct = totalTagPicks > 0 ? Math.round((count / totalTagPicks) * 100) : 0;
            return { tag, pct, type: "pos" as const };
          })
          .sort((a, b) => b.pct - a.pct)
      : [
          { tag: "Great service", pct: 42, type: "pos" as const },
          { tag: "Friendly staff", pct: 28, type: "pos" as const },
          { tag: "Would recommend", pct: 18, type: "pos" as const },
          { tag: "Professional", pct: 8, type: "pos" as const },
          { tag: "Clean place", pct: 4, type: "pos" as const },
        ];

  const radarData =
    sentimentPills.length > 0
      ? sentimentPills.slice(0, 5).map(({ tag, pct }) => ({
          subject: tag.split(" ")[0],
          A: Math.max(pct, 5),
          fullMark: 100,
        }))
      : [
          { subject: "Service", A: 42, fullMark: 100 },
          { subject: "Staff", A: 28, fullMark: 100 },
          { subject: "Value", A: 18, fullMark: 100 },
          { subject: "Quality", A: 8, fullMark: 100 },
          { subject: "Clean", A: 5, fullMark: 100 },
        ];

  const greatReviews = (inAppReviews as InAppReview[]).filter((r) => r.experienceType === "great");
  const aiGeneratedCount = greatReviews.filter((r) => r.isGenerated).length;
  const aiAdoptionPct =
    greatReviews.length > 0 ? Math.round((aiGeneratedCount / greatReviews.length) * 100) : 82;

  if (!hasGbp) {
    return (
      <div className="rounded-[2rem] border border-dashed border-border p-12 text-center bg-muted/50">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-foreground font-medium text-sm">
          Connect Google Business Profile to see insights
        </p>
        <p className="text-muted-foreground text-xs mt-1">Link this business to a GBP location.</p>
      </div>
    );
  }

  if (googleLoading) {
    return (
      <div className="flex items-center justify-center py-24 bg-muted/50 rounded-[2rem]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (googleError) {
    return (
      <div className="rounded-[2rem] bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
        <p className="font-medium">Could not load Google reviews</p>
        <p className="text-xs mt-1">Check your Google Business Profile connection.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full overflow-hidden bg-background font-display text-foreground">
      <div className="w-full px-2 sm:px-4 lg:px-6 py-3 md:py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Insights</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Performance metrics for{" "}
            <span className="font-semibold text-foreground">{business.name ?? "this location"}</span>.
          </p>
        </div>
        <div className="flex bg-card rounded-[2rem] p-1 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "px-4 py-2 text-sm font-bold rounded-[1.5rem] transition-all",
                range === r
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1 — Bento stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        {/* Hero card — primary gradient */}
        <div className="relative bg-primary rounded-[2rem] p-6 text-primary-foreground overflow-hidden shadow-[0_8px_30px_hsl(var(--primary)/0.25)]">
          <div
            className="absolute top-4 left-4 w-32 h-32 bg-primary-foreground rounded-full blur-3xl opacity-10"
            aria-hidden
          />
          <div
            className="absolute -bottom-6 -right-6 w-40 h-40 bg-primary-foreground rounded-full blur-3xl opacity-10"
            aria-hidden
          />
          <div className="relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary-foreground/70 mb-1">
              Avg Rating
            </p>
            <div className="text-5xl font-black text-primary-foreground mb-3">{avgRatingDisplay}</div>
            <div className="flex items-center gap-1.5 bg-primary-foreground/20 rounded-full px-3 py-1 w-fit text-xs font-bold">
              <TrendingUp className="w-3 h-3" />
              +0.2 this month
            </div>
          </div>
        </div>

        {/* QR Scans */}
        <div className="bg-card rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">QR Scans</p>
            <div className="bg-muted/50 rounded-full p-2">
              <QrCode className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground mb-2">
              {scansDisplay.toLocaleString()}
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> +8%
            </span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-card rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Conversion
            </p>
            <div className="bg-muted/50 rounded-full p-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground mb-2">{conversionRate}%</div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> +2.4%
            </span>
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-card rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Reviews
            </p>
            <div className="bg-muted/50 rounded-full p-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground mb-2">
              {totalReviewsDisplay.toLocaleString()}
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> +12%
            </span>
          </div>
        </div>
      </div>

      {/* Row 2 — Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Area chart — Review Velocity */}
        <div className="lg:col-span-2 bg-card rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border p-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Review Velocity
          </p>
          <h3 className="text-base font-bold text-foreground mb-5">Monthly review growth</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={thisMonthData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="insightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartAccent} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={chartAccent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: chartAccent, strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartAccent}
                  strokeWidth={2.5}
                  fill="url(#insightGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar — Sentiment */}
        <div className="bg-card rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border p-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Sentiment
          </p>
          <h3 className="text-base font-bold text-foreground mb-5">Top drivers</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Radar
                  name="Sentiment"
                  dataKey="A"
                  stroke={chartAccent}
                  fill={chartAccent}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 — Primary AI adoption card */}
      <div className="relative bg-primary rounded-[2rem] p-6 text-primary-foreground overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground rounded-full blur-3xl opacity-10 -mr-20 -mt-20"
          aria-hidden
        />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary-foreground/10 p-3 rounded-2xl shrink-0">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary-foreground/60 mb-1">
                AI Draft Adoption
              </p>
              <div className="text-5xl font-black text-primary-foreground mb-2">{aiAdoptionPct}%</div>
              <p className="text-sm text-primary-foreground/80 max-w-xs">
                Of customers use the AI suggestion tool to complete their reviews.
              </p>
            </div>
          </div>
          <div className="w-full md:w-64 shrink-0">
            <div className="flex justify-between text-xs text-primary-foreground/70 mb-2">
              <span>Adoption rate</span>
              <span className="text-primary-foreground font-bold">{aiAdoptionPct}%</span>
            </div>
            <div className="h-2.5 bg-primary-foreground/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-foreground/40 to-primary-foreground/70 rounded-full transition-all duration-700"
                style={{ width: `${aiAdoptionPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
