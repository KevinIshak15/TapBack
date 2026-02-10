import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Building2, Search, ExternalLink, QrCode } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import type { Business } from "@shared/schema";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";

export default function ManageBusinesses() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: businesses, isLoading } = useQuery<Business[]>({
    queryKey: ["/api/admin/businesses"],
    queryFn: async () => {
      const res = await fetch("/api/admin/businesses", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch businesses");
      return res.json();
    },
  });

  const filteredBusinesses = businesses?.filter((business) =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.slug.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Manage businesses"
          description="View and manage all platform businesses"
        />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search by name, category, or slug…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-lg border-slate-200 bg-white"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBusinesses.length === 0 ? (
              <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
                <CardContent className="py-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Building2 className="h-6 w-6 text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-600">No businesses found</p>
                </CardContent>
              </Card>
            ) : (
              filteredBusinesses.map((business) => (
                <Card key={business.id} className="bg-white border border-slate-200 shadow-sm rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-slate-900">{business.name}</h3>
                            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                              {business.category}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">{business.slug} · Owner {business.ownerId}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Created {new Date(business.createdAt).toLocaleDateString()}
                            {business.totalReviews != null && ` · ${business.totalReviews} reviews`}
                          </p>
                          {business.focusAreas && business.focusAreas.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {business.focusAreas.map((area, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary">
                                  {area}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/business/${business.slug}/qr`}>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <QrCode className="h-4 w-4" />
                            QR
                          </Button>
                        </Link>
                        {business.googleReviewUrl && (
                          <a href={business.googleReviewUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="gap-1.5">
                              <ExternalLink className="h-4 w-4" />
                              Google
                            </Button>
                          </a>
                        )}
                        <Button variant="outline" size="sm" onClick={() => alert(`Edit ${business.name} – Coming soon`)}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {businesses && businesses.length > 0 && (
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
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
                  <div className="text-xl font-semibold text-primary">{new Set(businesses.map((b) => b.category)).size}</div>
                  <div className="text-xs text-slate-500">Categories</div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-slate-900">{businesses.reduce((sum, b) => sum + (b.totalReviews || 0), 0)}</div>
                  <div className="text-xs text-slate-500">Reviews</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
