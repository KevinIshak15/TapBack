import { QRCodeSVG } from "qrcode.react";
import { useRoute, Link } from "wouter";
import { useBusinessBySlug } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, ExternalLink, Printer, QrCode, CheckCircle2 } from "lucide-react";
import { BusinessLayout } from "@/components/BusinessLayout";

export default function BusinessQR() {
  const [, params] = useRoute("/business/:slug/qr");
  const slug = params?.slug || "";
  const { data: business, isLoading } = useBusinessBySlug(slug);

  if (isLoading || !business) return null;

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
              @page { margin: 0; size: A4; }
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; }
            }
            body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: white; font-family: system-ui, -apple-system, sans-serif; }
            .qr-container { text-align: center; }
            .qr-code { display: inline-block; padding: 20px; background: white; border: 2px solid #e2e8f0; border-radius: 12px; }
            .business-name { margin-top: 20px; font-size: 18px; font-weight: 600; color: #1e293b; }
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
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const steps = [
    { title: "Print & display", desc: "Place this QR code at checkout, on receipts, or table tents." },
    { title: "Customer scans", desc: "Scanned devices open a mobile-optimized page to rate their experience." },
    { title: "Smart routing", desc: "Positive feedback goes to Google Reviews; concerns are captured privately." },
  ];

  return (
    <BusinessLayout business={business} slug={slug}>
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden min-w-0 w-full bg-background font-display text-foreground">
        <div className="w-full px-2 sm:px-4 lg:px-6 py-3 md:py-4 flex-1 flex flex-col min-h-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-4 mb-4 border-b border-border shrink-0">
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">QR Code</h2>
              <p className="text-sm text-muted-foreground mt-1">Generate and download your QR code for customer reviews.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-card border border-border shadow-sm rounded-xl">
              <CardHeader className="text-center pb-2 pt-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <QrCode className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base font-semibold text-foreground">Review QR code</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Customers scan this to leave a review</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center pt-0 pb-4">
                <div className="p-4 bg-card rounded-lg border border-border mb-4">
                  <QRCodeSVG id="qr-code-svg" value={reviewUrl} size={200} level="H" includeMargin />
                </div>
              <div className="flex gap-2 w-full">
                <Button onClick={downloadQR} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
                <Button variant="outline" className="flex-1" onClick={printPDF}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-sm rounded-xl h-full">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-base font-semibold text-foreground">How it works</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Getting the most out of your QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {steps.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-border">
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-foreground">Live URL</p>
                  </div>
                  <a
                    href={reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border hover:border-primary/40 text-sm text-foreground break-all"
                  >
                    <span className="flex-1">{reviewUrl}</span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </BusinessLayout>
  );
}
