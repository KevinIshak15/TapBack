import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Building2, Search, ExternalLink, QrCode } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import type { Business } from "@shared/schema";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/admin">
            <Button variant="ghost" className="mb-6 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900">
                Manage Businesses
              </h1>
              <p className="text-lg text-slate-600 mt-1">
                View and manage all platform businesses
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search businesses by name, category, or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-slate-200 bg-white"
            />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBusinesses.length === 0 ? (
              <Card className="glass-strong border-slate-200/60 shadow-2xl">
                <CardContent className="py-12 text-center">
                  <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No businesses found</p>
                </CardContent>
              </Card>
            ) : (
              filteredBusinesses.map((business) => (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="modern-card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-slate-900">
                                {business.name}
                              </h3>
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                {business.category}
                              </span>
                            </div>
                            <div className="space-y-1 mb-3">
                              <p className="text-sm text-slate-600">
                                <span className="font-medium">Slug:</span> {business.slug}
                              </p>
                              <p className="text-sm text-slate-600">
                                <span className="font-medium">Owner ID:</span> {business.ownerId}
                              </p>
                              {business.description && (
                                <p className="text-sm text-slate-600 line-clamp-2">
                                  {business.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>
                                Created: {new Date(business.createdAt).toLocaleDateString()}
                              </span>
                              {business.totalReviews !== undefined && (
                                <span>• {business.totalReviews} reviews</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Link href={`/business/${business.slug}/qr`}>
                            <Button variant="outline" size="sm" className="gap-2">
                              <QrCode className="w-4 h-4" />
                              QR
                            </Button>
                          </Link>
                          {business.googleReviewUrl && (
                            <a
                              href={business.googleReviewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" size="sm" className="gap-2">
                                <ExternalLink className="w-4 h-4" />
                                Google
                              </Button>
                            </a>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement business editing
                              alert(`Edit business ${business.name} - Coming soon!`);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                      {business.focusAreas && business.focusAreas.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <div className="flex flex-wrap gap-2">
                            {business.focusAreas.map((area, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Summary */}
        {businesses && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Card className="glass-strong border-slate-200/60 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-display">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {businesses.length}
                    </div>
                    <div className="text-sm text-slate-600">Total Businesses</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {new Set(businesses.map((b) => b.category)).size}
                    </div>
                    <div className="text-sm text-slate-600">Categories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {businesses.reduce((sum, b) => sum + (b.totalReviews || 0), 0)}
                    </div>
                    <div className="text-sm text-slate-600">Total Reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
