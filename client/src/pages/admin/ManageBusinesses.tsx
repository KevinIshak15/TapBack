import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Search, Eye } from "lucide-react";
import { Link, useSearch } from "wouter";
import { useState, useMemo, useEffect } from "react";
import type { Business } from "@shared/schema";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ["all", "Active", "Trial", "PastDue", "Cancelled"] as const;

/** Mock status for now - backend can add later. */
function getMockStatus(_b: Business): string {
  return "Active";
}

/** Mock last activity for now. */
function getMockLastActivity(b: Business): string {
  const d = b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdAt);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ManageBusinesses() {
  const searchString = useSearch();
  const ownerParam = new URLSearchParams(searchString?.replace(/^\?/, "") || "").get("owner");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const ownerFilterId = ownerParam ? Number(ownerParam) : null;
  useEffect(() => {
    if (ownerParam) setPage(1);
  }, [ownerParam]);

  const { data: businesses, isLoading } = useQuery<Business[]>({
    queryKey: ["/api/admin/businesses"],
    queryFn: async () => {
      const res = await fetch("/api/admin/businesses", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch businesses");
      return res.json();
    },
  });

  const filtered = useMemo(() => {
    let list = businesses ?? [];
    if (ownerFilterId != null && !Number.isNaN(ownerFilterId)) {
      list = list.filter((b) => b.ownerId === ownerFilterId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.slug.toLowerCase().includes(q)
      );
    }
    if (statusFilter && statusFilter !== "all") {
      list = list.filter((b) => getMockStatus(b) === statusFilter);
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [businesses, searchQuery, statusFilter, ownerFilterId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Businesses</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          View and manage all platform businesses
          {ownerFilterId != null && !Number.isNaN(ownerFilterId) && (
            <span className="ml-2 text-primary font-medium">· Filtered by owner ID {ownerFilterId}</span>
          )}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, category, or slug…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s === "all" ? "All statuses" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <Card className="app-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead className="w-[80px]">Owner</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[110px]">Created</TableHead>
                <TableHead className="w-[110px]">Last activity</TableHead>
                <TableHead className="w-[120px]">Google</TableHead>
                <TableHead className="w-[80px]">Plan</TableHead>
                <TableHead className="w-[90px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-slate-500 py-12">
                    No businesses found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((business) => (
                  <TableRow key={business.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{business.name}</p>
                          <p className="text-xs text-slate-500">{business.category}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/users?owner=${business.ownerId}`}>
                        <a className="text-primary hover:underline text-sm font-medium">{business.ownerId}</a>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {getMockStatus(business)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {new Date(business.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {getMockLastActivity(business)}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500">
                        {business.googleReviewUrl ? "Connected" : "Not connected"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">N/A</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/businesses/${business.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1.5">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <CardContent className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-slate-500">
                Page {page} of {totalPages} · {filtered.length} total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {businesses && businesses.length > 0 && (
        <Card className="app-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-semibold text-slate-900">{businesses.length}</div>
                <div className="text-xs text-slate-500">Total</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-primary">
                  {new Set(businesses.map((b) => b.category)).size}
                </div>
                <div className="text-xs text-slate-500">Categories</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-slate-900">
                  {businesses.reduce((sum, b) => sum + (b.totalReviews || 0), 0)}
                </div>
                <div className="text-xs text-slate-500">Reviews</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
