/**
 * Public Review Manager — Pill tabs, review cards, AI Draft for 1–2★.
 * Clean-Clinic styling; star badges (yellow 5, red/orange 1–2).
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Wand2, Loader2, MessageSquare } from "lucide-react";
import { useGoogleReviews, type GoogleReviewsResponse } from "@/hooks/use-businesses";
import { cn } from "@/lib/utils";

type Review = GoogleReviewsResponse["reviews"][number];

type TabId = "all" | "critical" | "unreplied";

const MOCK_AI_APOLOGY =
  "Thank you for taking the time to share your feedback. We're sorry your experience didn't meet your expectations. We'd like to make this right—please reach out to us directly so we can address your concerns. We value your feedback and are committed to improving.";

function ReviewCard({
  review,
  onAIDraftToggle,
  expandedDraftId,
  draftText,
  onDraftChange,
}: {
  review: Review;
  onAIDraftToggle: (id: string) => void;
  expandedDraftId: string | null;
  draftText: Record<string, string>;
  onDraftChange: (id: string, text: string) => void;
}) {
  const isCritical = review.starRating <= 2;
  const isExpanded = expandedDraftId === review.reviewId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-5 rounded-xl border transition-shadow duration-200",
        isCritical ? "border-orange-200 bg-orange-50/30 hover:shadow-md" : "border-slate-200 bg-white hover:shadow-md"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
            {review.reviewerDisplayName === "Anonymous" ? "?" : (review.reviewerDisplayName || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">{review.reviewerDisplayName || "Anonymous"}</h4>
            <div className="flex items-center gap-1 text-sm mt-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3.5 h-3.5",
                    i <= review.starRating
                      ? review.starRating <= 2
                        ? "text-orange-500 fill-orange-500"
                        : "text-amber-500 fill-amber-500"
                      : "text-slate-300"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        <span className="text-xs text-slate-400">
          {new Date(review.createTime).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      <p className="mt-3 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
        {review.comment || "No comment."}
      </p>

      {review.reviewReply && (
        <div className="mt-3 pl-3 border-l-2 border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Your reply</p>
          <p className="text-slate-700 text-sm italic mt-0.5">{review.reviewReply}</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {isCritical && (
          <button
            type="button"
            onClick={() => onAIDraftToggle(review.reviewId)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm shadow-indigo-200"
          >
            <Wand2 className="w-3.5 h-3.5" />
            {isExpanded ? "Hide AI Draft" : "Generate AI Reply"}
          </button>
        )}
        <button
          type="button"
          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors"
        >
          Reply Manually
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-slate-200">
              <label className="block text-xs font-medium text-slate-600 mb-2">AI draft (edit as needed)</label>
              <textarea
                value={draftText[review.reviewId] ?? MOCK_AI_APOLOGY}
                onChange={(e) => onDraftChange(review.reviewId, e.target.value)}
                className="w-full min-h-[100px] px-3 py-2 text-sm text-slate-800 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Professional apology draft…"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ReviewsPageProps {
  business: { id: number; name?: string; locationResourceName?: string };
}

export function ReviewsPage({ business }: ReviewsPageProps) {
  const hasGbp = !!(business.locationResourceName);
  const { data, isLoading, isError } = useGoogleReviews(business.id, hasGbp);
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [expandedDraftId, setExpandedDraftId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<Record<string, string>>({});

  const reviews = data?.reviews ?? [];
  const filtered =
    activeTab === "all"
      ? reviews
      : activeTab === "critical"
        ? reviews.filter((r) => r.starRating <= 2)
        : reviews.filter((r) => !r.reviewReply);

  const onAIDraftToggle = (id: string) => {
    setExpandedDraftId((prev) => (prev === id ? null : id));
    if (!draftText[id]) setDraftText((t) => ({ ...t, [id]: MOCK_AI_APOLOGY }));
  };
  const onDraftChange = (id: string, text: string) => setDraftText((t) => ({ ...t, [id]: text }));

  if (!hasGbp) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
        <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-700 font-medium">Connect Google Business Profile to manage reviews</p>
        <p className="text-sm text-slate-500 mt-1">Link this business to a GBP location to view and reply to reviews.</p>
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Public reviews</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage and reply to Google reviews</p>
      </div>

      {/* Pill tab switcher */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {(
          [
            { id: "all" as TabId, label: "All" },
            { id: "critical" as TabId, label: "Critical (1–2★)" },
            { id: "unreplied" as TabId, label: "Unreplied" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              activeTab === id
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No reviews match this filter.
          </div>
        ) : (
          filtered.map((review) => (
            <ReviewCard
              key={review.reviewId}
              review={review}
              onAIDraftToggle={onAIDraftToggle}
              expandedDraftId={expandedDraftId}
              draftText={draftText}
              onDraftChange={onDraftChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
