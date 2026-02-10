import { useState, useCallback, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useBusinessBySlug } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Download, Eye, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PaperSize = "LETTER" | "A4";
type Variant = "light" | "dark";

interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  previewThumbnailUrl?: string;
}

function buildApiBase(businessId: number): string {
  return `/api/businesses/${businessId}/posters`;
}

function previewUrl(base: string, templateId: string, size: PaperSize, variant: Variant): string {
  const params = new URLSearchParams({
    templateId,
    size,
    variant,
  });
  return `${base}/preview?${params.toString()}`;
}

function htmlPreviewUrl(base: string, templateId: string, size: PaperSize, variant: Variant): string {
  const params = new URLSearchParams({
    templateId,
    size,
    variant,
    embed: "1",
  });
  return `${base}/html?${params.toString()}`;
}

function downloadPdfUrl(base: string, templateId: string, size: PaperSize, variant: Variant): string {
  const params = new URLSearchParams({ templateId, size, variant });
  return `${base}/download.pdf?${params.toString()}`;
}

function downloadPngUrl(base: string, templateId: string, size: PaperSize, variant: Variant): string {
  const params = new URLSearchParams({ templateId, size, variant });
  return `${base}/download.png?${params.toString()}`;
}

export default function BusinessPosters() {
  const [, params] = useRoute("/business/:slug/posters");
  const slug = params?.slug ?? "";
  const { data: business, isLoading: businessLoading } = useBusinessBySlug(slug);
  const [templates, setTemplates] = useState<TemplateMeta[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [size, setSize] = useState<PaperSize>("LETTER");
  const [variant, setVariant] = useState<Variant>("light");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateMeta | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewImageLoading, setPreviewImageLoading] = useState(false);
  const [downloadPending, setDownloadPending] = useState<"pdf" | "png" | null>(null);
  const { toast } = useToast();

  const apiBase = business ? buildApiBase(business.id) : "";
  const fetchTemplates = useCallback(async () => {
    if (!business) return;
    setTemplatesLoading(true);
    try {
      const res = await fetch(apiBase + "/templates", { credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load templates");
      }
      const list = await res.json();
      setTemplates(list);
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Could not load templates.",
        variant: "destructive",
      });
      setTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  }, [business, apiBase, toast]);

  useEffect(() => {
    if (business) fetchTemplates();
  }, [business?.id]);

  const openPreview = useCallback((t: TemplateMeta) => {
    setPreviewImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPreviewTemplate(t);
    setPreviewImageLoading(true);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewTemplate(null);
    setPreviewImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!previewTemplate || !apiBase) return;
    let revoked = false;
    let blobUrl: string | null = null;
    const url = previewUrl(apiBase, previewTemplate.id, size, variant);
    fetch(url, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Preview failed");
        return res.blob();
      })
      .then((blob) => {
        const u = URL.createObjectURL(blob);
        if (revoked) {
          URL.revokeObjectURL(u);
          return;
        }
        blobUrl = u;
        setPreviewImageUrl(u);
        setPreviewImageLoading(false);
      })
      .catch(() => {
        if (!revoked) {
          setPreviewImageLoading(false);
          toast({
            title: "Preview failed",
            description: "Couldn't generate preview. Try again.",
            variant: "destructive",
          });
        }
      });
    return () => {
      revoked = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [previewTemplate?.id, apiBase, size, variant, toast]);

  const handleDownload = useCallback(
    async (format: "pdf" | "png", templateId: string) => {
      if (!business) return;
      setDownloadPending(format);
      try {
        const url =
          format === "pdf"
            ? downloadPdfUrl(apiBase, templateId, size, variant)
            : downloadPngUrl(apiBase, templateId, size, variant);
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Download failed");
        }
        const blob = await res.blob();
        const disposition = res.headers.get("Content-Disposition");
        const match = disposition?.match(/filename="?([^";]+)"?/);
        const filename =
          match?.[1] ?? `${business.slug}-${templateId}-${size}.${format === "pdf" ? "pdf" : "png"}`;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
        toast({ title: "Download started", description: filename });
      } catch (e) {
        toast({
          title: "Download failed",
          description: e instanceof Error ? e.message : "Couldn't generate poster. Try again.",
          variant: "destructive",
        });
      } finally {
        setDownloadPending(null);
      }
    },
    [business, apiBase, size, variant, toast]
  );

  if (businessLoading || !business) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href={`/business/${slug}/qr`}>
              <Button variant="ghost" size="sm" className="mb-2 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to QR
              </Button>
            </Link>
            <h1 className="text-2xl font-display font-bold text-slate-900">
              QR Marketing Materials
            </h1>
            <p className="text-slate-600 mt-1">
              Professionally designed posters — ready to print.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="poster-size" className="text-sm font-medium text-slate-700 whitespace-nowrap">
                Paper size
              </Label>
              <Select
                value={size}
                onValueChange={(v) => setSize(v as PaperSize)}
              >
                <SelectTrigger id="poster-size" className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LETTER">Letter (8.5×11)</SelectItem>
                  <SelectItem value="A4">A4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="poster-variant" className="text-sm font-medium text-slate-700 whitespace-nowrap">
                Dark variant
              </Label>
              <Switch
                id="poster-variant"
                checked={variant === "dark"}
                onCheckedChange={(checked) => setVariant(checked ? "dark" : "light")}
              />
            </div>
          </div>
        </div>

        {templatesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border border-slate-200 bg-white overflow-hidden">
                <div className="aspect-[8.5/11] bg-slate-100 animate-pulse" />
                <CardHeader>
                  <div className="h-5 bg-slate-200 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-full mt-2 animate-pulse" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <Card className="border border-slate-200 bg-white">
            <CardContent className="py-12 text-center text-slate-600">
              No templates available. Try again later.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((t) => (
              <Card
                key={t.id}
                className="border border-slate-200 bg-white overflow-hidden flex flex-col"
              >
                <div className="aspect-[8.5/11] bg-white relative overflow-hidden rounded-t-lg flex items-center justify-center min-h-[200px]">
                  <iframe
                    title={`Preview: ${t.name}`}
                    src={htmlPreviewUrl(apiBase, t.id, size, variant)}
                    className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                  />
                </div>
                <CardHeader className="flex-1">
                  <CardTitle className="text-lg">{t.name}</CardTitle>
                  <CardDescription className="text-sm">{t.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-[100px]"
                    onClick={() => openPreview(t)}
                  >
                    <Eye className="w-4 h-4 mr-1.5" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-[100px]"
                    onClick={() => handleDownload("pdf", t.id)}
                    disabled={downloadPending !== null}
                  >
                    {downloadPending === "pdf" ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4 mr-1.5" />
                    )}
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-[100px]"
                    onClick={() => handleDownload("png", t.id)}
                    disabled={downloadPending !== null}
                  >
                    {downloadPending === "png" ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-1.5" />
                    )}
                    PNG
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name ?? "Preview"}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <>
              <div className="flex-1 min-h-0 overflow-auto bg-slate-100 rounded-lg flex items-center justify-center p-4 relative">
                {previewImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-lg">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
                  </div>
                )}
                {previewImageUrl && (
                  <img
                    src={previewImageUrl}
                    alt={`Preview: ${previewTemplate.name}`}
                    className="max-w-full h-auto shadow-md"
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                <Button
                  onClick={() => handleDownload("pdf", previewTemplate.id)}
                  disabled={downloadPending !== null}
                >
                  {downloadPending === "pdf" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload("png", previewTemplate.id)}
                  disabled={downloadPending !== null}
                >
                  {downloadPending === "png" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Download PNG
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
