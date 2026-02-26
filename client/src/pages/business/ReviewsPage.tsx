/**
 * Review Management — Insights parity: metric strip, one console card, accordion list.
 * Inbox/work-queue style; expand row for AI reply / your reply.
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MessageSquare,
  Clock,
  Zap,
  Filter,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  Mail,
} from "lucide-react";
import { useGoogleReviews, type GoogleReviewsResponse } from "@/hooks/use-businesses";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Review = GoogleReviewsResponse["reviews"][number];
type TabId = "all" | "unreplied" | "critical";
type DateRangePreset = "7d" | "30d" | "since-revsboost" | "all-time" | "custom";

const MOCK_AI_APOLOGY =
  "Thank you for taking the time to share your feedback. We're sorry your experience didn't meet your expectations. We'd like to make this right. Please reach out to us directly so we can address your concerns. We value your feedback and are committed to improving.";

const MOCK_AI_THANKS =
  "Thank you so much for the kind words and the 5-star review! We're glad you had a great experience and we look forward to seeing you again.";

const MOCK_AI_THANKS_4 =
  "Thank you for your feedback and the 4-star rating! We're happy you had a positive experience and we're always working to make it even better. We hope to see you again soon.";

const MOCK_AI_NEUTRAL =
  "Thank you for taking the time to leave a review. We appreciate all feedback and use it to improve. If there's anything we could do better next time, we'd love to hear from you directly.";

/** Default AI draft by rating (fallback until API returns). Thank-you for 4–5★, apology for 1–2★, neutral for 3★. */
function getDefaultDraft(starRating: number): string {
  if (starRating >= 5) return MOCK_AI_THANKS;
  if (starRating >= 4) return MOCK_AI_THANKS_4;
  if (starRating <= 2) return MOCK_AI_APOLOGY;
  return MOCK_AI_NEUTRAL;
}

/**
 * Generate an AI reply draft for a Google review.
 * Replace this with your real API call (e.g. POST /api/businesses/:id/generate-reply with { comment, starRating }).
 * API should return a reply that is simple, professional, and aligned with Google's guidelines.
 *
 * Future: Auto-reply — automatically post an AI reply within 1 hour max, tailored to each review.
 */
async function generateReplyDraft(
  _businessId: number,
  review: { comment: string; starRating: number }
): Promise<string> {
  // Stub: simulate network + use rating-based draft. Optionally personalize with first line of comment.
  await new Promise((r) => setTimeout(r, 600));
  const base = getDefaultDraft(review.starRating);
  const hasComment = review.comment && review.comment.trim() && review.comment !== "No comment.";
  if (hasComment && review.starRating >= 4) {
    return `Thank you for your kind words${review.comment.length > 20 ? " and detailed feedback" : ""}! We're so glad you had a great experience and we look forward to seeing you again.`;
  }
  if (hasComment && review.starRating <= 2) {
    return base;
  }
  return base;
}

const AVATAR_COLORS = [
  "bg-slate-100 text-slate-600",
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
];

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function avatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// ─── Metric cards (Insights-style: same typography, green pill trends) ───────
function MetricCard({
  label,
  value,
  trend,
  icon,
  isAlert,
  subtext,
  trendSubtext,
}: {
  label: string;
  value: string;
  trend?: string;
  icon: React.ReactNode;
  isAlert?: boolean;
  subtext?: string;
  trendSubtext?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between h-32",
        isAlert ? "border-red-200 bg-red-50/30" : "border-slate-200"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {label}
          </span>
          <h3
            className={cn(
              "text-2xl font-bold mt-1 truncate",
              isAlert ? "text-red-600" : "text-slate-900"
            )}
          >
            {value}
          </h3>
        </div>
        <div
          className={cn(
            "p-2 rounded-lg shrink-0",
            isAlert ? "bg-red-100" : "bg-slate-50"
          )}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-auto flex-wrap">
        {subtext ? (
          <span className="text-xs font-medium text-red-500">{subtext}</span>
        ) : trend != null && trend !== "-" ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
              trend.startsWith("-")
                ? "bg-red-50 text-red-700 border-red-100"
                : "bg-emerald-50 text-emerald-700 border-emerald-100"
            )}
          >
            {trend.startsWith("-") ? (
              <TrendingDown size={10} />
            ) : (
              <TrendingUp size={10} />
            )}{" "}
            {trend}
          </span>
        ) : null}
        {!isAlert && trendSubtext != null && (
          <span className="text-[10px] text-slate-400">{trendSubtext}</span>
        )}
      </div>
    </div>
  );
}

// ─── Tab button (inside console header) ────────────────────────────────────
function TabButtonInner({
  text,
  count,
  active,
  isAlert,
  showAlertDot,
  onClick,
}: {
  text: string;
  count: number;
  active: boolean;
  isAlert?: boolean;
  showAlertDot?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
        active
          ? isAlert
            ? "bg-white text-rose-600 shadow-sm ring-1 ring-black/5"
            : "bg-white text-slate-900 shadow-sm ring-1 ring-black/5"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
      )}
    >
      {isAlert && showAlertDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden />
      )}
      {text}
      <span
        className={cn(
          "text-[10px] px-1.5 py-0.5 rounded-full tabular-nums",
          active ? "bg-slate-100 text-slate-600" : "bg-slate-200 text-slate-500"
        )}
      >
        {count}
      </span>
    </button>
  );
}

// ─── Review row + accordion (table hybrid) ─────────────────────────────────
function ReviewRow({
  review,
  avatarColorClass,
  isExpanded,
  onToggle,
  draftText,
  onDraftChange,
  onGenerateDraft,
  onEditDraft,
  isDraftEditable,
  isGenerating,
}: {
  review: Review;
  avatarColorClass: string;
  isExpanded: boolean;
  onToggle: () => void;
  draftText: string;
  onDraftChange: (text: string) => void;
  onGenerateDraft: () => void;
  onEditDraft: () => void;
  isDraftEditable: boolean;
  isGenerating: boolean;
}) {
  const isCritical = review.starRating <= 2;
  const isReplied = !!review.reviewReply;
  const displayName = review.reviewerDisplayName || "Anonymous";
  const initial = displayName.charAt(0).toUpperCase();
  const tags = isCritical ? ["Critical"] : review.starRating >= 4 ? ["Positive"] : ["Feedback"];

  return (
    <div className="border-b border-slate-50 last:border-b-0">
      {/* Summary row (always visible) */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full p-5 flex items-start gap-4 text-left transition-colors hover:bg-slate-50/50",
          isExpanded ? "bg-slate-50/80" : "bg-white"
        )}
      >
        <div className="mt-1 relative shrink-0">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border border-slate-200",
              avatarColorClass
            )}
          >
            {initial}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
            <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-bold text-white">
              G
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm truncate">{displayName}</h3>
                <span className="text-slate-400 text-xs shrink-0">
                  • {formatFullDate(review.createTime)}
                </span>
                {isCritical && !isReplied && (
                  <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100 shrink-0">
                    Critical
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                {isExpanded ? (
                  <>
                    <span>AI draft</span>
                    <ChevronUp size={16} className="text-slate-400" />
                  </>
                ) : (
                  <>
                    <span>{isReplied ? "View reply" : "View AI draft"}</span>
                    <ChevronDown size={16} className="text-slate-400" />
                  </>
                )}
              </span>
            </div>
          <div className="flex items-center gap-2 mt-1 mb-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={14}
                  className={cn(
                    i <= review.starRating
                      ? isCritical
                        ? "fill-rose-400 text-rose-400"
                        : "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200"
                  )}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-600 line-clamp-1">
            {review.comment || "No comment."}
          </p>
        </div>

        <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
          {isReplied ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
              <CheckCircle2 size={12} /> Replied
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
              <Clock size={12} /> Pending
            </div>
          )}
        </div>
      </button>

      {/* Expanded content (accordion) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pl-[72px] bg-slate-50/80 border-t border-slate-100/50 md:pl-[72px]">
              <div className="py-4">
                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {review.comment || "No comment."}
                </p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-white text-slate-500 px-2 py-1 rounded border border-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                {isReplied && review.reviewReply ? (
                  <div className="flex gap-3">
                    <CornerDownRight className="text-slate-300 mt-1 shrink-0" size={20} />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Your Reply
                      </span>
                      <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                        {review.reviewReply}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-indigo-50 text-indigo-600 p-1 rounded">
                          <Zap size={14} className="fill-indigo-600" />
                        </div>
                        <span className="text-xs font-semibold text-indigo-900">
                          AI-generated reply
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">Simple, on-brand, Google-friendly. Editable.</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Based on what they wrote; kept short and aligned with Google&apos;s guidelines.
                    </p>
                    <textarea
                      className={cn(
                        "w-full text-sm text-slate-700 border border-slate-200 rounded-lg p-3 outline-none transition-all resize-none",
                        isDraftEditable
                          ? "bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          : "bg-slate-50 cursor-default",
                        isGenerating && "opacity-70 pointer-events-none"
                      )}
                      rows={4}
                      value={isGenerating ? "Generating reply…" : draftText}
                      onChange={(e) => onDraftChange(e.target.value)}
                      placeholder={isDraftEditable ? "Edit the draft above, then Post Reply when ready." : "Click “Edit Draft” to modify."}
                      readOnly={isGenerating || !isDraftEditable}
                    />
                    <div className="flex justify-between items-center pt-1 flex-wrap gap-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1"
                          onClick={() => onDraftChange(getDefaultDraft(review.starRating))}
                        >
                          Discard
                        </button>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          disabled={isGenerating}
                          onClick={onGenerateDraft}
                          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              Generating…
                            </>
                          ) : (
                            <>
                              <Zap size={12} />
                              Generate AI reply
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={onEditDraft}
                          className={cn(
                            "px-4 py-2 border text-xs font-semibold rounded-lg",
                            isDraftEditable
                              ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          )}
                        >
                          {isDraftEditable ? "Done editing" : "Edit Draft"}
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2"
                        >
                          <Mail size={12} /> Post Reply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ReviewsPageProps {
  business: { id: number; name?: string; locationResourceName?: string; createdAt?: string };
}

export function ReviewsPage({ business }: ReviewsPageProps) {
  const hasGbp = !!(business.locationResourceName);
  const { data, isLoading, isError } = useGoogleReviews(business.id, hasGbp);
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("since-revsboost");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<Record<string, string>>({});
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const reviews = Array.isArray(data?.reviews) ? data.reviews : [];

  const dateFilterBounds = useMemo((): { start: Date | null; end: Date | null } => {
    const now = new Date();
    if (dateRangePreset === "7d") {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }
    if (dateRangePreset === "30d") {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }
    if (dateRangePreset === "since-revsboost") {
      const joinedAt = business.createdAt ? new Date(business.createdAt) : null;
      if (joinedAt && !Number.isNaN(joinedAt.getTime())) {
        joinedAt.setHours(0, 0, 0, 0);
        return { start: joinedAt, end: now };
      }
      return { start: null, end: null };
    }
    if (dateRangePreset === "all-time") return { start: null, end: null };
    if (dateRangePreset === "custom" && dateFrom && dateTo) {
      const start = new Date(dateFrom);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    return { start: null, end: null };
  }, [dateRangePreset, dateFrom, dateTo, business.createdAt]);

  const reviewsInRange = useMemo(() => {
    const { start, end } = dateFilterBounds;
    if (start == null || end == null) return reviews;
    const startMs = start.getTime();
    const endMs = end.getTime();
    return reviews.filter((r) => {
      const t = r.createTime ? new Date(r.createTime).getTime() : 0;
      return !Number.isNaN(t) && t >= startMs && t <= endMs;
    });
  }, [reviews, dateFilterBounds]);

  const totalCountInRange = reviewsInRange.length;
  const totalReviewsAllTime = data?.totalReviewCount ?? reviews.length;
  const totalReviewsPercentInPeriod =
    totalReviewsAllTime > 0
      ? Math.round((totalCountInRange / totalReviewsAllTime) * 100)
      : 0;
  const totalReviewsPeriodSubtext =
    dateRangePreset === "7d"
      ? "in last 7 days"
      : dateRangePreset === "30d"
        ? "in last 30 days"
        : dateRangePreset === "since-revsboost"
          ? "since joining RevsBoost"
          : dateRangePreset === "all-time"
            ? "all time"
            : dateRangePreset === "custom" && (dateFrom || dateTo)
              ? "in selected period"
              : "of all reviews";
  const averageRatingInRange =
    totalCountInRange > 0
      ? reviewsInRange.reduce((s, r) => s + r.starRating, 0) / totalCountInRange
      : 0;
  const repliedInRange = reviewsInRange.filter((r) => r.reviewReply).length;
  const responseRateInRange =
    totalCountInRange > 0 ? Math.round((repliedInRange / totalCountInRange) * 100) : 0;
  const unrepliedCountInRange = reviewsInRange.filter((r) => !r.reviewReply).length;
  const criticalCountInRange = reviewsInRange.filter(
    (r) => (r.starRating === 1 || r.starRating === 2) && !r.reviewReply
  ).length;

  const metricTrends = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    let currentStart: number;
    let currentEnd: number;
    let prevStart: number;
    let prevEnd: number;
    let trendSubtext = "vs previous period";

    if (dateRangePreset === "7d") {
      const ms7 = 7 * dayMs;
      currentEnd = now;
      currentStart = now - ms7;
      prevEnd = currentStart - 1;
      prevStart = prevEnd - ms7;
      trendSubtext = "vs previous 7 days";
    } else if (dateRangePreset === "30d") {
      const ms30 = 30 * dayMs;
      currentEnd = now;
      currentStart = now - ms30;
      prevEnd = currentStart - 1;
      prevStart = prevEnd - ms30;
      trendSubtext = "vs previous 30 days";
    } else if (dateRangePreset === "custom" && dateFrom && dateTo) {
      const start = new Date(dateFrom).getTime();
      const end = new Date(dateTo).getTime();
      const span = end - start;
      currentStart = start;
      currentEnd = end;
      prevEnd = start - 1;
      prevStart = prevEnd - span;
      trendSubtext = "vs previous period";
    } else {
      const ms30 = 30 * dayMs;
      currentEnd = now;
      currentStart = now - ms30;
      prevEnd = currentStart - 1;
      prevStart = prevEnd - ms30;
      trendSubtext =
        dateRangePreset === "all-time" ? "all time" : "since joining RevsBoost";
    }

    const currentPeriod = reviews.filter((r) => {
      const t = r.createTime ? new Date(r.createTime).getTime() : 0;
      return !Number.isNaN(t) && t >= currentStart && t <= currentEnd;
    });
    const prevPeriod = reviews.filter((r) => {
      const t = r.createTime ? new Date(r.createTime).getTime() : 0;
      return !Number.isNaN(t) && t >= prevStart && t <= prevEnd;
    });

    let totalTrend: string | null = null;
    if (prevPeriod.length > 0) {
      const pct = ((currentPeriod.length - prevPeriod.length) / prevPeriod.length) * 100;
      totalTrend = pct >= 0 ? `+${Math.round(pct)}%` : `${Math.round(pct)}%`;
    } else if (currentPeriod.length > 0) {
      totalTrend = "New";
    }

    let avgTrend: string | null = null;
    if (currentPeriod.length > 0 && prevPeriod.length > 0) {
      const avgCur = currentPeriod.reduce((s, r) => s + r.starRating, 0) / currentPeriod.length;
      const avgPrev = prevPeriod.reduce((s, r) => s + r.starRating, 0) / prevPeriod.length;
      const diff = avgCur - avgPrev;
      avgTrend = diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
    } else if (currentPeriod.length > 0 && prevPeriod.length === 0) {
      avgTrend = "-";
    }

    let responseTrend: string | null = null;
    if (currentPeriod.length > 0 && prevPeriod.length > 0) {
      const repliedCur = currentPeriod.filter((r) => r.reviewReply).length;
      const repliedPrev = prevPeriod.filter((r) => r.reviewReply).length;
      const rateCur = (repliedCur / currentPeriod.length) * 100;
      const ratePrev = (repliedPrev / prevPeriod.length) * 100;
      const diff = rateCur - ratePrev;
      responseTrend = diff >= 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
    } else if (currentPeriod.length > 0 && prevPeriod.length === 0) {
      responseTrend = "-";
    }

    return { totalTrend, avgTrend, responseTrend, trendSubtext };
  }, [reviews, dateRangePreset, dateFrom, dateTo]);

  const filteredReviews = useMemo(() => {
    let list = reviews;
    if (activeTab === "critical") {
      list = list.filter((r) => (r.starRating === 1 || r.starRating === 2) && !r.reviewReply);
    } else if (activeTab === "unreplied") {
      list = list.filter((r) => !r.reviewReply);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          (r.comment || "").toLowerCase().includes(q) ||
          (r.reviewerDisplayName || "").toLowerCase().includes(q)
      );
    }
    const { start, end } = dateFilterBounds;
    if (start != null && end != null) {
      const startMs = start.getTime();
      const endMs = end.getTime();
      list = list.filter((r) => {
        const t = r.createTime ? new Date(r.createTime).getTime() : 0;
        return !Number.isNaN(t) && t >= startMs && t <= endMs;
      });
    }
    return list;
  }, [reviews, activeTab, searchQuery, dateFilterBounds]);

  const toggleExpand = (id: string, starRating: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setEditingDraftId(null);
    if (!draftText[id]) setDraftText((t) => ({ ...t, [id]: getDefaultDraft(starRating) }));
  };
  const onDraftChange = (id: string, text: string) =>
    setDraftText((t) => ({ ...t, [id]: text }));

  const handleGenerateDraft = async (review: Review) => {
    setGeneratingId(review.reviewId);
    try {
      const draft = await generateReplyDraft(business.id, {
        comment: review.comment ?? "",
        starRating: review.starRating,
      });
      setDraftText((t) => ({ ...t, [review.reviewId]: draft }));
    } finally {
      setGeneratingId(null);
    }
  };

  if (!hasGbp) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
        <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-700 font-medium">Connect Google Business Profile to manage reviews</p>
        <p className="text-sm text-slate-500 mt-1">
          Link this business to a GBP location to view and reply to reviews.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-800">
        <p className="font-medium">Could not load reviews</p>
        <p className="text-sm mt-1">Check your Google Business Profile connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden min-w-0 bg-[#F8FAFC] font-sans text-slate-800 p-3 md:p-4">
      {/* Header (match Insights) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-4 mb-4 border-b border-slate-200 shrink-0">
        <div>
          <h1 className="text-lg font-display font-bold text-slate-900">Reviews</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time feedback monitoring for{" "}
            <span className="font-semibold text-slate-900">{business.name ?? "this location"}</span>.
          </p>
        </div>
      </div>

      {/* Metrics row (Insights-style: same card look, green pills) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 shrink-0">
        <MetricCard
          label="Total Reviews"
          value={totalCountInRange.toLocaleString()}
          trend={totalReviewsAllTime > 0 ? `${totalReviewsPercentInPeriod}%` : undefined}
          trendSubtext={totalReviewsPeriodSubtext}
          icon={<MessageSquare size={18} className="text-slate-400" />}
        />
        <MetricCard
          label="Avg Rating"
          value={totalCountInRange > 0 ? averageRatingInRange.toFixed(1) : "-"}
          trend={metricTrends?.avgTrend ?? undefined}
          trendSubtext={metricTrends?.trendSubtext}
          icon={<Star size={18} className="text-slate-400" />}
        />
        <MetricCard
          label="Response Rate"
          value={`${responseRateInRange}%`}
          trend={metricTrends?.responseTrend ?? undefined}
          trendSubtext={metricTrends?.trendSubtext}
          icon={<Zap size={18} className="text-slate-400" />}
        />
        <MetricCard
          label="Critical Pending"
          value={String(criticalCountInRange)}
          isAlert
          subtext="Requires attention"
          icon={<AlertCircle size={18} className="text-red-400" />}
        />
      </div>

      {/* Reviews Console (one big white card) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        {/* Console header: tabs + search inside card */}
        <div className="p-3 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3 bg-white shrink-0">
          <div className="flex bg-slate-100/80 p-1 rounded-lg">
            <TabButtonInner
              text="All Reviews"
              count={totalCountInRange}
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
            />
            <TabButtonInner
              text="Unreplied"
              count={unrepliedCountInRange}
              active={activeTab === "unreplied"}
              onClick={() => setActiveTab("unreplied")}
            />
            <TabButtonInner
              text="Critical"
              count={criticalCountInRange}
              active={activeTab === "critical"}
              isAlert
              showAlertDot={criticalCountInRange > 0}
              onClick={() => setActiveTab("critical")}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative group flex-1 md:flex-initial">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search reviews…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full md:w-64"
              />
            </div>
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium bg-white",
                    (dateRangePreset !== "since-revsboost" && dateRangePreset !== "all-time") || dateFrom || dateTo
                      ? "border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Filter size={16} />
                  {dateRangePreset === "7d" && "7d"}
                  {dateRangePreset === "30d" && "30d"}
                  {dateRangePreset === "since-revsboost" && !dateFrom && !dateTo && "Since RevsBoost"}
                  {dateRangePreset === "all-time" && !dateFrom && !dateTo && "All time"}
                  {dateRangePreset === "custom" && (dateFrom && dateTo ? `${dateFrom} → ${dateTo}` : "Custom")}
                  <ChevronDown size={14} className="opacity-70" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-72 p-0 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden"
                align="end"
              >
                <div className="p-2 border-b border-slate-100 bg-white">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date range</span>
                </div>
                <div className="p-2 space-y-0.5 bg-white">
                  <button
                    type="button"
                    onClick={() => { setDateRangePreset("7d"); setDateFrom(""); setDateTo(""); setFilterOpen(false); }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      dateRangePreset === "7d" ? "bg-indigo-100 text-indigo-900" : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    Last 7 days
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDateRangePreset("30d"); setDateFrom(""); setDateTo(""); setFilterOpen(false); }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      dateRangePreset === "30d" ? "bg-indigo-100 text-indigo-900" : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    Last 30 days
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDateRangePreset("since-revsboost"); setDateFrom(""); setDateTo(""); setFilterOpen(false); }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      dateRangePreset === "since-revsboost" && !dateFrom && !dateTo ? "bg-indigo-100 text-indigo-900" : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    Since RevsBoost
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDateRangePreset("all-time"); setDateFrom(""); setDateTo(""); setFilterOpen(false); }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      dateRangePreset === "all-time" && !dateFrom && !dateTo ? "bg-indigo-100 text-indigo-900" : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    All time
                  </button>
                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setDateRangePreset("custom")}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        dateRangePreset === "custom" ? "bg-indigo-100 text-indigo-900" : "text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      Custom range
                    </button>
                    {dateRangePreset === "custom" && (
                      <div className="px-3 pb-3 pt-1 flex gap-2 items-center">
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        />
                        <span className="text-slate-400 text-sm">to</span>
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Review list (table/accordion hybrid) */}
        <div className="flex-1 overflow-auto min-h-0">
          {filteredReviews.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No reviews match this filter.
            </div>
          ) : (
            filteredReviews.map((review, i) => (
              <ReviewRow
                key={review.reviewId}
                review={review}
                avatarColorClass={avatarColor(i)}
                isExpanded={expandedId === review.reviewId}
                onToggle={() => toggleExpand(review.reviewId, review.starRating)}
                draftText={draftText[review.reviewId] ?? getDefaultDraft(review.starRating)}
                onDraftChange={(text) => onDraftChange(review.reviewId, text)}
                onGenerateDraft={() => handleGenerateDraft(review)}
                onEditDraft={() => setEditingDraftId((prev) => (prev === review.reviewId ? null : review.reviewId))}
                isDraftEditable={editingDraftId === review.reviewId}
                isGenerating={generatingId === review.reviewId}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}
