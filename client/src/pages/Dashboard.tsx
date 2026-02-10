import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-auth";
import { useBusinesses } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Store, Building2, CreditCard, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardTab = "businesses" | "subscription" | "settings";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useUser();
  const { data: businesses, isLoading: businessesLoading } = useBusinesses();
  const [activeTab, setActiveTab] = useState<DashboardTab>("businesses");

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

  const tabs = [
    { id: "businesses" as DashboardTab, label: "My Businesses", icon: Building2 },
    { id: "subscription" as DashboardTab, label: "Subscription", icon: CreditCard },
    { id: "settings" as DashboardTab, label: "Account Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "businesses":
        return <BusinessesView businesses={businesses} />;
      case "subscription":
        return <SubscriptionView />;
      case "settings":
        return <AccountSettingsView user={user} />;
      default:
        return <BusinessesView businesses={businesses} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-slate-600">
            Manage your account and businesses
          </p>
        </motion.div>

        <div className="flex gap-6">
          {/* Side Panel */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-64 flex-shrink-0"
          >
            <Card className="glass-strong border-slate-200/60">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1 p-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500"}`} />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 min-w-0"
          >
            {renderContent()}
          </motion.main>
        </div>
      </div>
    </div>
  );
}

// Businesses View Component
function BusinessesView({ businesses }: { businesses: any[] | undefined }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-1">
            My Businesses
          </h2>
          <p className="text-slate-600">
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
      </div>

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
    </div>
  );
}

// Subscription View Component
function SubscriptionView() {
  return (
    <Card className="glass-strong border-slate-200/60">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-bold">Subscription</CardTitle>
        <CardDescription>Manage your subscription and billing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Subscription management coming soon...</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Account Settings View Component
function AccountSettingsView({ user }: { user: any }) {
  return (
    <Card className="glass-strong border-slate-200/60">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-bold">Account Settings</CardTitle>
        <CardDescription>Manage your account information and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Account Information</h3>
            <div className="space-y-2 text-slate-600">
              <p><span className="font-medium">Email:</span> {user?.email || "N/A"}</p>
              <p><span className="font-medium">Username:</span> {user?.username || "N/A"}</p>
              {user?.firstName && <p><span className="font-medium">Name:</span> {user.firstName} {user.lastName}</p>}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200">
            <p className="text-slate-600">More account settings coming soon...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
