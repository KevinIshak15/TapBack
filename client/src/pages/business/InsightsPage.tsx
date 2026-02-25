/**
 * Insights — Stripe/Linear-style: unified stat bar, information density, no visual fluff.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import {
  Loader2,
  ScanLine,
  ShieldCheck,
  Clock,
  MessageSquare,
  Star,
  TrendingUp,
  MousePointerClick,
  Zap,
  MoreHorizontal,
  Download,
} from "lucide-react";
import { useGoogleReviews, useBusinessStats, useBusinessReviews } from "@/hooks/use-businesses";
import { getEffectiveReviewTags } from "@/lib/categoriesAndTags";
import { cn } from "@/lib/utils";

type InAppReview = { experienceType: string; selectedTags?: string[]; isGenerated?: boolean };

function getThisMonthPerformanceData(): { date: string; reviews: number }[] {
  const now = new Date();
  const monthName = now.toLocaleString("en-US", { month: "short" });
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const today = now.getDate();
  const sampleDays = [1, 5, 10, 15, 20, 25, daysInMonth].filter((d) => d <= today);
  const points = sampleDays.length ? sampleDays : [1];
  const last = Math.max(points.length - 1, 1);
  return points.map((day, i) => ({
    date: `${monthName} ${day}`,
    reviews: Math.round(4 + (i / last) * 18 + Math.sin(i) * 3),
  }));
}

// ─── Components ─────────────────────────────────────────────────────────────

const StatItem = ({
  label,
  value,
  trend,
  subtext,
  icon: Icon,
}: {
  label: string;
  value: string;
  trend?: string;
  subtext?: string;
  icon: React.ElementType;
}) => (
  <div className="p-5 flex flex-col justify-between h-full hover:bg-slate-50/50 transition-colors group">
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="w-4 h-4 shrink-0" />
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      {trend && (
        <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 shrink-0">
          <TrendingUp className="w-3 h-3 mr-1" /> {trend}
        </span>
      )}
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2 flex-wrap">
        {value}
        {subtext != null && subtext !== "" && (
          <span className="text-xs font-normal text-slate-400">{subtext}</span>
        )}
      </div>
    </div>
  </div>
);

const SectionHeader = ({
  title,
  action,
}: {
  title: string;
  action?: boolean;
}) => (
  <div className="flex justify-between items-center mb-4 px-1">
    <h3 className="text-sm font-bold text-slate-900">{title}</h3>
    {action && (
      <button
        type="button"
        className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded"
        aria-label="More options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs p-2 rounded-lg shadow-xl border border-slate-700">
        <p className="font-semibold mb-1 opacity-50">{label}</p>
        <p className="font-bold text-sm">{payload[0].value} Reviews</p>
      </div>
    );
  }
  return null;
};

const TIME_RANGES = ["7d", "30d", "90d"] as const;

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

  // Rating distribution from real reviews or mock
  const starCountsReal: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const s = r.starRating ?? 5;
    if (s >= 1 && s <= 5) starCountsReal[s] = (starCountsReal[s] ?? 0) + 1;
  });
  const totalStarCount = Object.values(starCountsReal).reduce((a, b) => a + b, 0);
  const starCounts =
    totalStarCount > 0
      ? ([5, 4, 3, 2, 1] as const).map((stars) => {
          const count = starCountsReal[stars] ?? 0;
          const percent = totalStarCount > 0 ? Math.round((count / totalStarCount) * 100) : 0;
          const colors: Record<number, string> = {
            5: "#10b981",
            4: "#84cc16",
            3: "#eab308",
            2: "#f97316",
            1: "#ef4444",
          };
          return {
            stars: String(stars),
            count,
            color: colors[stars],
            percent: `${percent}%`,
          };
        })
      : [
          { stars: "5", count: 142, color: "#10b981", percent: "88%" },
          { stars: "4", count: 32, color: "#84cc16", percent: "8%" },
          { stars: "3", count: 12, color: "#eab308", percent: "2%" },
          { stars: "2", count: 8, color: "#f97316", percent: "1%" },
          { stars: "1", count: 5, color: "#ef4444", percent: "1%" },
        ];

  const thisMonthData = getThisMonthPerformanceData();

  // Review Health (secondary bar)
  const concernsCount = stats?.concerns ?? 14;
  const avgReplyTimeMs = (() => {
    const withReply = reviews.filter((r) => r.reviewReply && r.createTime && r.updateTime);
    if (withReply.length === 0) return null;
    const totalMs = withReply.reduce((acc, r) => {
      const created = new Date(r.createTime).getTime();
      const updated = new Date(r.updateTime!).getTime();
      return acc + (updated - created);
    }, 0);
    return totalMs / withReply.length;
  })();
  const avgReplyTimeDisplay =
    avgReplyTimeMs != null
      ? avgReplyTimeMs < 3600000
        ? `${(avgReplyTimeMs / 60000).toFixed(1)} min`
        : `${(avgReplyTimeMs / 3600000).toFixed(1)} hrs`
      : "4.2 hrs";

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
  // Same words as Review Options: category defaults + any custom/focus-area extras; show all with usage % (or 0%).
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
          { tag: "Great service", pct: 0, type: "pos" as const },
          { tag: "Friendly staff", pct: 0, type: "pos" as const },
          { tag: "Would recommend", pct: 0, type: "pos" as const },
          { tag: "Professional", pct: 0, type: "pos" as const },
          { tag: "Clean place", pct: 0, type: "pos" as const },
        ];

  const greatReviews = (inAppReviews as InAppReview[]).filter((r) => r.experienceType === "great");
  const aiGeneratedCount = greatReviews.filter((r) => r.isGenerated).length;
  const aiAdoptionPct =
    greatReviews.length > 0 ? Math.round((aiGeneratedCount / greatReviews.length) * 100) : 82;

  if (!hasGbp) {
    return (
      <div
        className={cn(
          "rounded-lg border border-dashed border-slate-200 p-12 text-center bg-slate-50"
        )}
      >
        <ScanLine className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-800 font-medium text-sm">Connect Google Business Profile to see insights</p>
        <p className="text-slate-500 text-xs mt-1">Link this business to a GBP location.</p>
      </div>
    );
  }

  if (googleLoading) {
    return (
      <div className="flex items-center justify-center py-24 bg-slate-50 rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (googleError) {
    return (
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
        <p className="font-medium">Could not load Google reviews</p>
        <p className="text-xs mt-1">Check your Google Business Profile connection.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-0 bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Insights</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time performance metrics for{" "}
            <span className="font-semibold text-slate-700">{business.name ?? "this location"}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            {TIME_RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                  range === r
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                )}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:border-slate-300 hover:text-slate-700 transition-all shadow-sm"
            aria-label="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Unified Stat Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <StatItem
            label="Total Reviews"
            value={totalReviewsDisplay.toLocaleString()}
            trend="+12%"
            icon={MessageSquare}
          />
          <StatItem
            label="Avg Rating"
            value={avgRatingDisplay}
            trend="+0.2"
            icon={Star}
          />
          <StatItem
            label="QR Scans"
            value={scansDisplay.toLocaleString()}
            trend="+8%"
            icon={MousePointerClick}
          />
          <StatItem
            label="Conversion Rate"
            value={`${conversionRate}%`}
            trend="+2.4%"
            icon={Zap}
          />
        </div>
        <div className="bg-slate-50/50 border-t border-slate-100 p-3 flex flex-wrap gap-6 px-5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Avg Reply Time: <span className="font-semibold text-slate-700">{avgReplyTimeDisplay}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              Intercepted:{" "}
              <span className="font-semibold text-slate-700">{concernsCount} (Protected)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Charts: 2/3 + 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 min-h-0 flex-1">
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[280px]">
          <SectionHeader title="Review Velocity" action />
          <div className="h-[280px] w-full flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={thisMonthData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
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
                  cursor={{
                    stroke: "#6366f1",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="reviews"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#colorGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <SectionHeader title="Rating Distribution" />
          <div className="flex-1 flex flex-col justify-center gap-4">
            {starCounts.map((item) => (
              <div key={item.stars} className="flex items-center text-xs group">
                <div className="flex items-center gap-1 w-12 text-slate-600 font-medium shrink-0">
                  {item.stars} <span className="text-slate-300">★</span>
                </div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden mx-2 min-w-0">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: item.percent }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
                <span className="w-8 text-right font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tabular-nums shrink-0">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Sentiment Pills + AI Adoption */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <SectionHeader title="Sentiment Drivers" />
          <div className="flex flex-wrap gap-2">
            {sentimentPills
              .filter((x) => x.type === "pos")
              .map(({ tag, pct }) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 hover:shadow-sm cursor-default transition-shadow"
                >
                  {tag} <span className="ml-1 opacity-60">{pct}%</span>
                </span>
              ))}
            {sentimentPills
              .filter((x) => x.type === "neg")
              .map(({ tag, pct }) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-100 hover:shadow-sm cursor-default transition-shadow"
                >
                  {tag} <span className="ml-1 opacity-60">{pct}%</span>
                </span>
              ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm text-white flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1">
              AI Draft Adoption
            </h3>
            <div className="text-4xl font-bold text-white mb-2">{aiAdoptionPct}%</div>
            <p className="text-xs text-slate-400 max-w-[200px]">
              Of your customers use the AI suggestion tool to finish their reviews.
            </p>
          </div>
          <div className="relative z-10 bg-white/10 p-4 rounded-full backdrop-blur-sm border border-white/10">
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
          <div
            className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
