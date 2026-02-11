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
      <div className="max-w-4xl space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold text-slate-900">Review QR code</CardTitle>
              <CardDescription>Customers scan this to leave a review</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="p-6 bg-white rounded-xl border border-slate-200 mb-6">
                <QRCodeSVG id="qr-code-svg" value={reviewUrl} size={240} level="H" includeMargin />
              </div>
              <div className="flex gap-3 w-full">
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

          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">How it works</CardTitle>
              <CardDescription>Getting the most out of your QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-200">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-slate-900">Live URL</p>
                  </div>
                  <a
                    href={reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-sm text-slate-700 break-all"
                  >
                    <span className="flex-1">{reviewUrl}</span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BusinessLayout>
  );
}
