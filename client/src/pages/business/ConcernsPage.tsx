/**
 * Private Feedback Inbox — Two-column list + detail; status dropdown; shield header.
 * Clean-Clinic styling.
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, Mail, Phone, Loader2, AlertCircle } from "lucide-react";
import { useBusinessReviews } from "@/hooks/use-businesses";
import { cn } from "@/lib/utils";

export type ConcernStatus = "New" | "In Progress" | "Resolved";

/** In-app review from API (experienceType === 'concern'). */
interface ConcernReview {
  id: number;
  experienceType: string;
  content?: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

interface ConcernsPageProps {
  business: { id: number; name?: string };
}

export function ConcernsPage({ business }: ConcernsPageProps) {
  const { data: reviews = [], isLoading, isError } = useBusinessReviews(business.id);
  const concerns = useMemo(
    () => (reviews as ConcernReview[]).filter((r) => r.experienceType === "concern"),
    [reviews]
  );
  const [selectedId, setSelectedId] = useState<number | null>(concerns[0]?.id ?? null);
  const [statusById, setStatusById] = useState<Record<number, ConcernStatus>>({});
  const [readIds, setReadIds] = useState<Set<number>>(() => new Set());

  const selected = concerns.find((c) => c.id === selectedId) ?? concerns[0] ?? null;
  const selectedStatus = selected ? (statusById[selected.id] ?? "New") : "New";
  const isNew = (id: number) => !readIds.has(id);

  const markRead = (id: number) => setReadIds((prev) => new Set(prev).add(id));
  const setStatus = (id: number, status: ConcernStatus) =>
    setStatusById((prev) => ({ ...prev, [id]: status }));

  const onSelect = (c: ConcernReview) => {
    setSelectedId(c.id);
    markRead(c.id);
  };

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
        <p className="font-medium">Could not load concerns</p>
        <p className="text-sm mt-1">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden space-y-3">
      {/* Private Internal Data header */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-slate-600 bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-2 shrink-0"
      >
        <Shield className="w-4 h-4 text-slate-500 flex-shrink-0" />
        <span className="text-xs font-medium">Private internal data — for staff only</span>
      </motion.div>

      <div className="shrink-0">
        <h2 className="text-xl font-bold text-slate-900">Concerns inbox</h2>
        <p className="text-slate-500 text-xs mt-0.5">Private feedback from customers</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0 overflow-hidden">
        {/* Left: list */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="p-2 border-b border-slate-200 bg-slate-50/50 shrink-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {concerns.length} concern{concerns.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="divide-y divide-slate-100 flex-1 min-h-0 overflow-y-auto">
            {concerns.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No concerns yet.</div>
            ) : (
              concerns.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelect(c)}
                  className={cn(
                    "w-full text-left px-4 py-3 transition-colors flex items-center justify-between gap-2",
                    selectedId === c.id ? "bg-indigo-50 border-l-4 border-indigo-500" : "hover:bg-slate-50"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">{c.customerName || "Anonymous"}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(c.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {isNew(c.id) && (
                    <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                      New
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: detail */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0 overflow-y-auto">
          {!selected ? (
            <div className="p-12 text-center text-slate-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Select a concern to view details.</p>
            </div>
          ) : (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold text-slate-900">{selected.customerName || "Anonymous"}</h3>
                <time className="text-sm text-slate-500">
                  {new Date(selected.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>

              <div className="mb-4">
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {selected.content || "No message."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {selected.customerEmail && (
                  <a
                    href={`mailto:${selected.customerEmail}`}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                )}
                {selected.customerPhone && (
                  <a
                    href={`tel:${selected.customerPhone}`}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setStatus(selected.id, e.target.value as ConcernStatus)}
                  className="w-full max-w-xs px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
