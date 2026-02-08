import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { useRoute, Link } from "wouter";
import { useBusinessBySlug } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, ArrowLeft, ExternalLink, Printer, QrCode, CheckCircle2 } from "lucide-react";

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
    // Create a print window with only the QR code
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-8 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-strong border-slate-200/60 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-display">Review QR Code</CardTitle>
                <CardDescription className="text-base">
                  Customers scan this to leave a review
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="p-8 bg-white rounded-3xl shadow-inner border-2 border-slate-200 mb-8">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={reviewUrl}
                    size={280}
                    level="H"
                    includeMargin
                  />
                </div>

                <div className="flex gap-4 w-full">
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
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-strong border-slate-200/60 shadow-2xl h-full">
              <CardHeader>
                <CardTitle className="text-2xl font-display">How it works</CardTitle>
                <CardDescription className="text-base">
                  Getting the most out of your QR code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    step: "1",
                    title: "Print & Display",
                    desc: "Place this QR code at your checkout counter, on receipts, or on table tents.",
                  },
                  {
                    step: "2",
                    title: "Customer Scans",
                    desc: "When scanned, customers are taken to a mobile-optimized page to rate their experience.",
                  },
                  {
                    step: "3",
                    title: "Smart Routing",
                    desc: "Positive feedback gets guided to Google Reviews. Negative feedback is captured privately.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}

                <div className="pt-6 border-t border-slate-200 mt-6">
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
                    >
                      <span className="text-sm font-medium text-slate-700 break-all flex-1 group-hover:text-blue-600 transition-colors">
                        {reviewUrl}
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
