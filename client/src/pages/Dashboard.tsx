import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useBusinesses } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, LayoutDashboard, LogOut, ArrowRight, Store, QrCode, BarChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useUser();
  const { data: businesses, isLoading: businessesLoading } = useBusinesses();
  const logoutMutation = useLogout();

  if (userLoading || businessesLoading) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-48" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Auth guard
  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline">Signed in as {user.username}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display text-gray-900">Your Businesses</h1>
            <p className="text-gray-500 mt-2">Manage your locations and review campaigns.</p>
          </div>
          <Link href="/business/new">
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Business
            </Button>
          </Link>
        </div>

        {businesses && businesses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Card key={business.id} className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200 overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold">{business.name}</CardTitle>
                      <CardDescription className="mt-1">{business.category}</CardDescription>
                    </div>
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Store className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Link href={`/business/${business.id}/qr`}>
                      <Button variant="outline" className="w-full h-auto py-3 flex-col gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30">
                        <QrCode className="w-5 h-5" />
                        <span className="text-xs font-semibold">QR Code</span>
                      </Button>
                    </Link>
                    <Link href={`/business/${business.id}/insights`}>
                      <Button variant="outline" className="w-full h-auto py-3 flex-col gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30">
                        <BarChart className="w-5 h-5" />
                        <span className="text-xs font-semibold">Insights</span>
                      </Button>
                    </Link>
                  </div>
                  <Link href={`/business/${business.id}/setup`}>
                    <Button className="w-full group" variant="secondary">
                      Manage Settings
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No businesses yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Add your first business to start collecting reviews and analyzing feedback.</p>
            <Link href="/business/new">
              <Button size="lg" className="shadow-lg shadow-primary/20">
                <Plus className="w-5 h-5 mr-2" />
                Create Business Profile
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
