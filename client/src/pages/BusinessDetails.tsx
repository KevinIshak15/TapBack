import { Link, useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useUser } from "@/hooks/use-auth";
import { useBusinessBySlug } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode, BarChart, ArrowRight, Settings, Store, Loader2, MessageSquare, AlertTriangle, Download, Printer, ExternalLink, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

type TabType = "settings" | "qr" | "insights" | "reviews" | "complaints";

export default function BusinessDetails() {
  const [, params] = useRoute("/business/:slug");
  const [, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useUser();
  const slug = params?.slug || "";
  const { data: business, isLoading: businessLoading } = useBusinessBySlug(slug);
  const [activeTab, setActiveTab] = useState<TabType>("settings");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  // Redirect to dashboard if business not found
  useEffect(() => {
    if (!businessLoading && !business && user) {
      setLocation("/dashboard");
    }
  }, [business, businessLoading, user, setLocation]);

  if (userLoading || businessLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="flex gap-6">
            <Skeleton className="h-96 w-64 rounded-2xl" />
            <Skeleton className="h-96 flex-1 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !business) {
    return null;
  }

  const tabs = [
    { id: "settings" as TabType, label: "Business Settings", icon: Settings },
    { id: "qr" as TabType, label: "QR Code", icon: QrCode },
    { id: "insights" as TabType, label: "Insights", icon: BarChart },
    { id: "reviews" as TabType, label: "Reviews", icon: MessageSquare },
    { id: "complaints" as TabType, label: "Complaints", icon: AlertTriangle },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "settings":
        return <BusinessSettingsView business={business} />;
      case "qr":
        return <QRView business={business} />;
      case "insights":
        return <InsightsView business={business} />;
      case "reviews":
        return <ReviewsView business={business} />;
      case "complaints":
        return <ComplaintsView business={business} />;
      default:
        return <BusinessSettingsView business={business} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="mb-6 gap-2 hover:bg-slate-100"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Business Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-2">
                {business.name}
              </h1>
              <p className="text-lg text-slate-600">
                {business.category}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Layout */}
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

// Business Settings View Component
function BusinessSettingsView({ business }: { business: any }) {
  return (
    <Card className="glass-strong border-slate-200/60">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-bold">Business Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Section 1: Customer Review Options */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Customer Review Options
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Select which options customers can choose when leaving a review
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Focus Areas (Tags) - Max 4
              </label>
              {business.focusAreas && business.focusAreas.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {business.focusAreas.map((area: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 mt-1 italic">No focus areas set</p>
              )}
              <p className="text-xs text-slate-500 mt-2">
                These tags appear as options for customers to select when leaving a review
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Section 2: Business Information */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Business Information
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Manage your business profile and settings
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Business Name</label>
              <p className="text-lg text-slate-900 mt-1">{business.name}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-slate-700">Category</label>
              <p className="text-lg text-slate-900 mt-1">{business.category}</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-slate-700">Logo</label>
              <div className="mt-2">
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={`${business.name} logo`}
                    className="h-20 w-20 object-contain rounded-lg border border-slate-200"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                    <Store className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-2">Logo upload coming soon</p>
              </div>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-slate-700">Google Review URL</label>
              <a
                href={business.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-blue-600 hover:text-blue-700 hover:underline mt-1 block truncate"
                title={business.googleReviewUrl}
              >
                {business.googleReviewUrl}
              </a>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-slate-700">Focus Areas (Tags) - Max 4</label>
              {business.focusAreas && business.focusAreas.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {business.focusAreas.map((area: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 mt-1 italic">No focus areas set</p>
              )}
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-slate-700">Theme (Color & Branding)</label>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-md"></div>
                  <div className="flex flex-col justify-center">
                    <p className="text-sm font-medium text-slate-900">Default Theme</p>
                    <p className="text-xs text-slate-500">Blue to Purple gradient</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Theme customization coming soon</p>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-slate-700">Status</label>
              <div className="mt-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Active
                </span>
                <p className="text-xs text-slate-500 mt-2">
                  {business.status === "inactive" ? "Business is currently inactive" : "Business is active and accepting reviews"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Link href={`/business/${business.slug}/setup`}>
            <Button className="w-full sm:w-auto">
              Edit Business Settings
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Insights View Component
function InsightsView({ business }: { business: any }) {
  return (
    <Card className="glass-strong border-slate-200/60">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-bold">Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <BarChart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Insights view coming soon...</p>
          <Link href={`/business/${business.slug}/insights`}>
            <Button className="mt-4" variant="outline">
              View Full Insights Page
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Reviews View Component
function ReviewsView({ business }: { business: any }) {
  return (
    <Card className="glass-strong border-slate-200/60">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-bold">Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Reviews view coming soon...</p>
          <p className="text-sm text-slate-500 mt-2">
            Total Reviews: {business.totalReviews || 0}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Complaints View Component
function ComplaintsView({ business }: { business: any }) {
  return (
    <Card className="glass-strong border-slate-200/60">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-bold">Complaints</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Complaints view coming soon...</p>
          <p className="text-sm text-slate-500 mt-2">
            View customer concerns and feedback here
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// QR View Component
function QRView({ business }: { business: any }) {
  const reviewUrl = `${window.location.origin}/r/${business.slug}`;

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${business.slug}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const printPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(svgBlob);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${business.name} - QR Code</title>
          <style>
            @media print {
              @page {
                margin: 0;
                size: A4;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: white;
              }
            }
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: white;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .qr-container {
              text-align: center;
            }
            .qr-code {
              display: inline-block;
              padding: 20px;
              background: white;
              border: 2px solid #e2e8f0;
              border-radius: 12px;
            }
            .business-name {
              margin-top: 20px;
              font-size: 18px;
              font-weight: 600;
              color: #1e293b;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="qr-code">
              <img src="${svgUrl}" alt="QR Code" style="max-width: 100%; height: auto;" />
            </div>
            <div class="business-name">${business.name}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Card className="glass-strong border-slate-200/60">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-bold">QR Code</CardTitle>
        <CardDescription>
          Generate and download your QR code for customer reviews
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center">
          <div className="p-8 bg-white rounded-3xl shadow-inner border-2 border-slate-200 mb-6">
            <QRCodeSVG
              id="qr-code-svg"
              value={reviewUrl}
              size={280}
              level="H"
              includeMargin
            />
          </div>

          <div className="flex gap-4 w-full max-w-md">
            <Button
              onClick={downloadQR}
              className="flex-1 rounded-xl font-semibold"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PNG
            </Button>
            <Button
              className="flex-1 rounded-xl font-semibold"
              variant="outline"
              onClick={printPDF}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print PDF
            </Button>
          </div>
        </div>

        <Separator />

        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="text-sm font-semibold text-slate-900">Live URL</p>
          </div>
          <a
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 p-3 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
            title={reviewUrl}
          >
            <span className="text-sm font-medium text-slate-700 truncate flex-1 group-hover:text-blue-600 transition-colors">
              {reviewUrl}
            </span>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
