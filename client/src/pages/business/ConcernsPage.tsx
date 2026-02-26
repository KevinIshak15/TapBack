/**
 * Concerns Inbox — "Digital Rolodex": forward email, list + detail, tel/mailto, Pending | Contacted.
 * Contacted state is driven by local overlay (set once from server, then only updated on user click)
 * so the button never reverts when the cache refetches.
 */
import { useState, useMemo, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Copy,
} from "lucide-react";
import {
  useBusinessReviews,
  setConcernsLastViewed,
  useUpdateConcernStatus,
  useUpdateBusiness,
} from "@/hooks/use-businesses";
import { useUser } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ConcernReview {
  id: number;
  experienceType: string;
  content?: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  concernStatus?: "pending" | "contacted";
}

interface ConcernsPageProps {
  business: { id: number; name?: string; concernsNotificationEmail?: string };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ConcernsPage({ business }: ConcernsPageProps) {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { toast } = useToast();

  const { data: reviews = [], isLoading, isError } = useBusinessReviews(business.id, {
    refetchOnWindowFocus: false,
  });
  const updateStatus = useUpdateConcernStatus();
  const updateBusiness = useUpdateBusiness();

  const [forwardEmail, setForwardEmail] = useState(
    business.concernsNotificationEmail ?? user?.email ?? ""
  );
  const [savedForwardEmail, setSavedForwardEmail] = useState(forwardEmail);

  useEffect(() => {
    const email = business.concernsNotificationEmail ?? user?.email ?? "";
    setForwardEmail(email);
    setSavedForwardEmail(email);
  }, [business.concernsNotificationEmail, user?.email]);

  useEffect(() => {
    setConcernsLastViewed(business.id);
    queryClient.invalidateQueries({ queryKey: ["/api/businesses/concerns-count", business.id] });
  }, [business.id, queryClient]);

  const concerns = useMemo(
    () =>
      (reviews as ConcernReview[])
        .filter((r) => r.experienceType === "concern")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reviews]
  );

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected =
    selectedId !== null
      ? concerns.find((c) => c.id === selectedId) ?? concerns[0] ?? null
      : concerns[0] ?? null;

  useEffect(() => {
    if (selectedId === null && concerns.length > 0) setSelectedId(concerns[0].id);
  }, [concerns, selectedId]);

  const [contactedOverlay, setContactedOverlay] = useState<Set<number>>(() => new Set());
  const hasInitializedOverlay = useRef(false);
  useEffect(() => {
    if (concerns.length === 0 || hasInitializedOverlay.current) return;
    hasInitializedOverlay.current = true;
    const fromServer = new Set(
      concerns.filter((c) => c.concernStatus === "contacted").map((c) => c.id)
    );
    if (fromServer.size > 0) setContactedOverlay((prev) => new Set([...prev, ...fromServer]));
  }, [concerns]);

  function isContacted(review: ConcernReview): boolean {
    return contactedOverlay.has(review.id) || review.concernStatus === "contacted";
  }

  function getStatus(review: ConcernReview): "pending" | "contacted" {
    return isContacted(review) ? "contacted" : "pending";
  }

  const handleSaveForwardEmail = () => {
    updateBusiness.mutate(
      { id: business.id, concernsNotificationEmail: forwardEmail || undefined },
      {
        onSuccess: () => {
          setSavedForwardEmail(forwardEmail);
          toast({ title: "Saved", description: "Concerns will be forwarded to this email." });
        },
        onError: (e) =>
          toast({ variant: "destructive", title: "Error", description: (e as Error).message }),
      }
    );
  };

  const toggleStatus = () => {
    if (!selected) return;
    const currentStatus = getStatus(selected);
    const newStatus: "pending" | "contacted" = currentStatus === "contacted" ? "pending" : "contacted";

    setContactedOverlay((prev) => {
      const next = new Set(prev);
      if (newStatus === "contacted") next.add(selected.id);
      else next.delete(selected.id);
      return next;
    });

    updateStatus.mutate(
      { businessId: business.id, reviewId: selected.id, concernStatus: newStatus },
      {
        onError: () => {
          setContactedOverlay((prev) => {
            const next = new Set(prev);
            if (newStatus === "contacted") next.delete(selected.id);
            else next.add(selected.id);
            return next;
          });
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not update status. Please try again.",
          });
        },
      }
    );
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast({ title: "Copied", description: `${label} copied to clipboard.` }),
      () => toast({ variant: "destructive", title: "Copy failed" })
    );
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
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden space-y-4">
      {/* Title + description (consistent with other tabs) */}
      <div className="pb-4 mb-2 border-b border-slate-200 shrink-0">
        <h1 className="text-lg font-display font-bold text-slate-900">Concerns</h1>
        <p className="text-sm text-slate-500 mt-1">Customer concerns inbox: forward to your email and manage responses.</p>
      </div>
      {/* Forward concerns to */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Mail size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Forward all concerns to</h2>
            <p className="text-xs text-slate-500">We'll email you when a form is submitted.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="email"
            value={forwardEmail}
            onChange={(e) => setForwardEmail(e.target.value)}
            placeholder="email@example.com"
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2 w-full sm:w-64 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          />
          <button
            type="button"
            onClick={handleSaveForwardEmail}
            disabled={updateBusiness.isPending || forwardEmail === savedForwardEmail}
            className="text-sm font-medium text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {updateBusiness.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* List + Detail */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Left: list */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50/50 min-h-0">
          <div className="p-4 border-b border-slate-200 bg-white shrink-0">
            <h3 className="font-bold text-slate-800">Inbox</h3>
          </div>
          <div className="overflow-y-auto flex-1">
            {concerns.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No concerns yet.</div>
            ) : (
              concerns.map((c) => {
                const status = getStatus(c);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      "w-full text-left p-4 border-b border-slate-100 transition-all hover:bg-white",
                      selected?.id === c.id
                        ? "bg-white border-l-4 border-l-indigo-600 shadow-sm"
                        : "border-l-4 border-l-transparent opacity-80 hover:opacity-100"
                    )}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span
                        className={cn(
                          "text-sm font-semibold truncate",
                          status === "pending" ? "text-slate-900" : "text-slate-500"
                        )}
                      >
                        {c.customerName || "Anonymous"}
                      </span>
                      {status === "pending" && (
                        <span
                          className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5"
                          aria-hidden
                        />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">
                      {c.content || "No message."}
                    </p>
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      {formatDateShort(c.createdAt)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: detail */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {!selected ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center flex-1">
              <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
              <p>Select a concern to view details.</p>
            </div>
          ) : (
            <>
              {/* Header + status toggle */}
              <div className="px-6 sm:px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start gap-4 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg shrink-0">
                    {(selected.customerName || "A").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">
                      {selected.customerName || "Anonymous"}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                      <Calendar size={14} />
                      {formatDate(selected.createdAt)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleStatus}
                  disabled={updateStatus.isPending}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all shrink-0",
                    getStatus(selected) === "contacted"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {getStatus(selected) === "contacted" ? (
                    <>
                      <CheckCircle2
                        size={18}
                        className="fill-emerald-600 text-emerald-600"
                      />
                      Contacted
                    </>
                  ) : (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-slate-300" />
                      Mark as Contacted
                    </>
                  )}
                </button>
              </div>

              {/* Contact info */}
              <div className="px-6 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selected.customerPhone && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-indigo-200 transition-colors group relative">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                      <Phone size={12} />
                      Phone
                    </div>
                    <a
                      href={`tel:${selected.customerPhone}`}
                      className="text-lg font-semibold text-slate-900 hover:text-indigo-600 hover:underline"
                    >
                      {selected.customerPhone}
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selected.customerPhone!, "Phone number")}
                      className="absolute top-4 right-4 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Copy phone"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                )}
                {selected.customerEmail && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-indigo-200 transition-colors group relative">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                      <Mail size={12} />
                      Email
                    </div>
                    <a
                      href={`mailto:${selected.customerEmail}`}
                      className="text-lg font-semibold text-slate-900 hover:text-indigo-600 hover:underline break-all"
                    >
                      {selected.customerEmail}
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selected.customerEmail!, "Email")}
                      className="absolute top-4 right-4 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Copy email"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="px-6 sm:px-8 pb-8 flex-1">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Customer concern</h3>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-slate-700 leading-relaxed">
                  &ldquo;{selected.content || "No message."}&rdquo;
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
