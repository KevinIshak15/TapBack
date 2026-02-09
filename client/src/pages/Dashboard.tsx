import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useUser } from "@/hooks/use-auth";
import { useBusinesses } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Store } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useUser();
  const { data: businesses, isLoading: businessesLoading } = useBusinesses();

  // Redirect to login if not authenticated (use useEffect to avoid setState during render)
  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  if (userLoading || businessesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-48" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-3">
              Your Businesses
            </h1>
            <p className="text-lg text-slate-600">
              Manage your locations and track review performance
            </p>
          </div>
          <Link href="/business/new">
            <Button
              size="lg"
              className="shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all font-semibold rounded-2xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Business
            </Button>
          </Link>
        </motion.div>

        {businesses && businesses.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {businesses.map((business, index) => (
              <motion.div
                key={business.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/business/${business.slug}`}>
                  <Card className="modern-card-hover h-full flex flex-col cursor-pointer">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-display font-bold mb-1">
                            {business.name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {business.category}
                          </CardDescription>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                          <Store className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 glass rounded-3xl border-2 border-dashed border-slate-300"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Store className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">
              No businesses yet
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto text-lg">
              Add your first business to start collecting reviews and analyzing feedback.
            </p>
            <Link href="/business/new">
              <Button
                size="lg"
                className="shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all font-semibold rounded-2xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Business Profile
              </Button>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
