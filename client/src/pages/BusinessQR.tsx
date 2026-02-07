import { QRCodeSVG } from "qrcode.react";
import { useRoute, Link } from "wouter";
import { useBusiness } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, ArrowLeft, ExternalLink, Printer } from "lucide-react";

export default function BusinessQR() {
  const [, params] = useRoute("/business/:id/qr");
  const businessId = parseInt(params?.id || "0");
  const { data: business, isLoading } = useBusiness(businessId);

  if (isLoading || !business) return null;

  // The public URL for reviews
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Card */}
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle>Review QR Code</CardTitle>
              <CardDescription>Customers scan this to leave a review</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="p-8 bg-white rounded-3xl shadow-inner border border-gray-100 mb-8">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={reviewUrl}
                  size={240}
                  level="H"
                  includeMargin
                />
              </div>
              
              <div className="flex gap-4 w-full">
                <Button onClick={downloadQR} className="flex-1" variant="outline">
                  <Download className="w-4 h-4 mr-2" /> Download PNG
                </Button>
                <Button className="flex-1" variant="outline" onClick={() => window.print()}>
                  <Printer className="w-4 h-4 mr-2" /> Print PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
              <CardDescription>Getting the most out of your QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">1. Print & Display</h3>
                <p className="text-sm text-gray-600">Place this QR code at your checkout counter, on receipts, or on table tents.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">2. Customer Scans</h3>
                <p className="text-sm text-gray-600">When scanned, customers are taken to a mobile-optimized page to rate their experience.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">3. Smart Routing</h3>
                <p className="text-sm text-gray-600">Positive feedback gets guided to Google Reviews. Negative feedback is captured privately.</p>
              </div>
              
              <div className="pt-6 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-2">Live URL:</p>
                <a 
                  href={reviewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all flex items-center gap-2"
                >
                  {reviewUrl} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
