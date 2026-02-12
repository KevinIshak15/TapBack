import { useRoute, Link } from "wouter";
import { useBusiness, useBusinessStats } from "@/hooks/use-businesses";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeatureGate } from "@/components/admin/FeatureGate";
import { getMockActivityForBusiness } from "@/data/mockActivity";
import {
  Building2,
  QrCode,
  Settings,
  Activity,
  Plug,
  MessageSquare,
  BarChart3,
  CreditCard,
  ExternalLink,
  Lock,
  User,
  Smartphone,
} from "lucide-react";

const TAB_IDS = [
  "overview",
  "qr",
  "settings",
  "activity",
  "google",
  "reviews",
  "insights",
  "billing",
] as const;

export default function AdminBusinessDetail() {
  const [, params] = useRoute("/admin/businesses/:businessId");
  const businessId = params?.businessId ? Number(params.businessId) : 0;
  const { data: business, isLoading, isError } = useBusiness(businessId);
  const { data: stats } = useBusinessStats(businessId);

  if (isLoading || !business) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <p className="text-slate-600">Business not found.</p>
        <Link href="/admin/businesses">
          <Button variant="outline">Back to businesses</Button>
        </Link>
      </div>
    );
  }

  const scansTotal = stats?.scans ?? business.totalScans ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{business.name}</h1>
          <p className="text-sm text-slate-600 mt-0.5">{business.category} · {business.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/r/${business.slug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2">
              <Smartphone className="h-4 w-4" />
              View customer review flow
            </Button>
          </a>
          <Link href={`/business/${business.slug}/qr`}>
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Open QR page
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-slate-100 rounded-lg">
          <TabsTrigger value="overview" className="gap-1.5">Overview</TabsTrigger>
          <TabsTrigger value="qr" className="gap-1.5">QR & Templates</TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">Settings</TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5">Activity Log</TabsTrigger>
          <TabsTrigger value="google" className="gap-1.5">
            <Lock className="h-3.5 w-3.5 opacity-70" />
            Google
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1.5">
            <Lock className="h-3.5 w-3.5 opacity-70" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-1.5">
            <Lock className="h-3.5 w-3.5 opacity-70" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5">
            <Lock className="h-3.5 w-3.5 opacity-70" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="app-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><span className="text-slate-500">Name</span> {business.name}</p>
                <p><span className="text-slate-500">Category</span> {business.category}</p>
                <p><span className="text-slate-500">Slug</span> {business.slug}</p>
                <p className="flex items-center gap-2">
                  <span className="text-slate-500">Owner</span>
                  <span>{business.ownerId}</span>
                  <Link href={`/admin/users?owner=${business.ownerId}`}>
                    <a className="text-primary hover:underline text-xs font-medium flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      Look up in Users
                    </a>
                  </Link>
                </p>
              </CardContent>
            </Card>
            <Card className="app-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Scans (total)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-slate-900">{scansTotal}</div>
              </CardContent>
            </Card>
            <Card className="app-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Reviews generated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-slate-900">{stats?.reviewsGenerated ?? business.totalReviews ?? 0}</div>
              </CardContent>
            </Card>
          </div>
          <Card className="app-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Conversion</CardTitle>
              <CardDescription>N/A until reviews enabled</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 text-sm">—</p>
            </CardContent>
          </Card>
          <Card className="app-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Plug className="h-4 w-4 text-slate-400" />
                <span className="text-sm">Google Business</span>
                <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">Not connected</span>
              </div>
            </CardContent>
          </Card>
          <Card className="app-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Customer review link</CardTitle>
              <CardDescription>URL customers see when they scan the QR code. Copy to share or troubleshoot.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="flex-1 min-w-0 text-sm bg-slate-100 px-2 py-1.5 rounded truncate">
                  {typeof window !== "undefined" ? `${window.location.origin}/r/${business.slug}` : `/r/${business.slug}`}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `${window.location.origin}/r/${business.slug}`;
                    navigator.clipboard.writeText(url);
                  }}
                >
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr" className="mt-6">
          <Card className="app-card">
            <CardHeader>
              <CardTitle className="text-base">QR & Templates</CardTitle>
              <CardDescription>Link to the business QR page for this location.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/business/${business.slug}/qr`}>
                <Button variant="outline" className="gap-2">
                  <QrCode className="h-4 w-4" />
                  Open QR code page
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card className="app-card">
            <CardHeader>
              <CardTitle className="text-base">Settings</CardTitle>
              <CardDescription>Edit business details. Backend form can be wired here.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Placeholder for editable form (name, category, Google URL, etc.).</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card className="app-card">
            <CardHeader>
              <CardTitle className="text-base">Activity Log</CardTitle>
              <CardDescription>Recent scans, reviews, and changes (mock data).</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {getMockActivityForBusiness(business.id).map((a) => (
                  <li key={a.id} className="flex items-start gap-3 text-sm">
                    <span className="text-slate-400 whitespace-nowrap">
                      {new Date(a.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">{a.type}</span>
                    <span className="text-slate-700">{a.message}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="google" className="mt-6">
          <FeatureGate
            flag="google_integration_enabled"
            title="Google Business Profile"
            description="Connect and manage Google Business Profile for this location."
          >
            <Card className="app-card">
              <CardContent className="py-8 text-center text-slate-500">Placeholder when enabled.</CardContent>
            </Card>
          </FeatureGate>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <FeatureGate
            flag="reviews_enabled"
            title="Reviews"
            description="View and moderate reviews from Google and in-app."
          >
            <Card className="app-card">
              <CardContent className="py-8 text-center text-slate-500">Placeholder when enabled.</CardContent>
            </Card>
          </FeatureGate>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <FeatureGate
            flag="insights_enabled"
            title="Insights"
            description="Analytics and insights for this business."
          >
            <Card className="app-card">
              <CardContent className="py-8 text-center text-slate-500">Placeholder when enabled.</CardContent>
            </Card>
          </FeatureGate>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <FeatureGate
            flag="billing_enabled"
            title="Billing"
            description="Subscription and billing for this business."
          >
            <Card className="app-card">
              <CardContent className="py-8 text-center text-slate-500">Placeholder when enabled.</CardContent>
            </Card>
          </FeatureGate>
        </TabsContent>
      </Tabs>
    </div>
  );
}
