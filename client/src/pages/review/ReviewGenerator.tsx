import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useBusinessBySlug } from "@/hooks/use-businesses";
import { useGenerateReview } from "@/hooks/use-reviews";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getReviewTheme,
  getReviewThemeStyle,
  getReviewCardStyle,
  getPrimaryButtonStyle,
  getSecondaryButtonStyle,
} from "@/lib/reviewThemes";
import { getEffectiveReviewTags } from "@/lib/categoriesAndTags";
import { ReviewFlowLayout } from "@/components/ReviewFlowLayout";

const CARD_BASE_CLASS = "w-full max-w-md p-8";

export default function ReviewGenerator() {
  const [, params] = useRoute("/r/:slug/review");
  const [, setLocation] = useLocation();
  const slug = params?.slug || "";
  const { data: business } = useBusinessBySlug(slug);
  const theme = getReviewTheme(business?.reviewTheme);
  const themeStyle = getReviewThemeStyle(theme);
  const generateMutation = useGenerateReview();

  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [generatedReview, setGeneratedReview] = useState("");
  const [step, setStep] = useState<"tags" | "generate" | "copy">("tags");
  const [regenerationCount, setRegenerationCount] = useState(0);
  const MAX_REGENERATIONS = 3;

  if (!business) return null;

  const chipOptions = getEffectiveReviewTags(business.category ?? "Other", business.focusAreas);

  const toggleChip = (label: string) => {
    setSelectedChips((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  const handleGenerate = async (isRegeneration = false) => {
    if (isRegeneration && regenerationCount >= MAX_REGENERATIONS) return;
    setStep("generate");
    try {
      const result = await generateMutation.mutateAsync({
        businessId: business.id,
        tags: selectedChips,
        experienceType: "great",
        customText: undefined,
      });
      setGeneratedReview(result.review);
      setStep("copy");
      if (isRegeneration) setRegenerationCount((c) => c + 1);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyAndContinue = () => {
    navigator.clipboard.writeText(generatedReview);
    window.open(business.googleReviewUrl, "_blank");
  };

  return (
    <ReviewFlowLayout companyName={business.name} style={themeStyle}>
      <div className={CARD_BASE_CLASS} style={getReviewCardStyle(theme)}>
        {step === "tags" && (
          <div className="space-y-6">
            <h2
              className="text-xl font-semibold text-center"
              style={{ color: theme.text }}
            >
              What stood out to you?
            </h2>
            <p className="text-sm text-center opacity-80" style={{ color: theme.text }}>
              We&apos;ll write a review for you. Press &apos;Generate&apos; when you&apos;re done.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {chipOptions.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleChip(label)}
                  className={cn(
                    "px-4 py-2.5 rounded-full text-sm font-medium transition-all border-2 whitespace-nowrap",
                    selectedChips.includes(label)
                      ? "text-white border-transparent"
                      : ""
                  )}
                  style={
                    selectedChips.includes(label)
                      ? {
                          background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                        }
                      : {
                          background: theme.cardBg,
                          color: theme.text,
                          borderColor: theme.backgroundAccent,
                        }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <Button
              size="lg"
              className="w-full h-12 rounded-xl font-semibold disabled:opacity-50"
              style={
                selectedChips.length > 0
                  ? getPrimaryButtonStyle(theme)
                  : {
                      background: theme.backgroundAccent,
                      color: theme.text,
                      border: "none",
                      opacity: 0.7,
                    }
              }
              disabled={selectedChips.length === 0}
              onClick={() => handleGenerate(false)}
            >
              Generate
            </Button>
          </div>
        )}

        {step === "generate" && (
          <div className="text-center py-10">
            <Loader2
              className="w-12 h-12 animate-spin mx-auto mb-4"
              style={{ color: theme.primary }}
            />
            <p className="text-sm opacity-80" style={{ color: theme.text }}>
              Writing your review...
            </p>
          </div>
        )}

        {step === "copy" && (
          <div className="space-y-6">
            <h2
              className="text-xl font-semibold text-center"
              style={{ color: theme.text }}
            >
              Your Review
            </h2>
            <div
              className="rounded-xl p-5 text-left text-sm leading-relaxed min-h-[120px] whitespace-pre-wrap"
              style={{
                background: theme.backgroundAccent,
                color: theme.text,
                border: `1px solid ${theme.primary}20`,
              }}
            >
              {generatedReview}
            </div>
            <p className="text-xs text-center opacity-80" style={{ color: theme.text }}>
              By continuing, you agree with the generated sentiments. For an
              explanation, please{" "}
              <a href="#" className="underline" onClick={(e) => e.preventDefault()}>
                click here
              </a>
              .
            </p>
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full h-12 rounded-xl font-semibold"
                style={getPrimaryButtonStyle(theme)}
                onClick={handleCopyAndContinue}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Review & Continue
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 rounded-xl"
                style={getSecondaryButtonStyle(theme)}
                onClick={() => handleGenerate(true)}
                disabled={
                  generateMutation.isPending ||
                  regenerationCount >= MAX_REGENERATIONS
                }
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Review
              </Button>
            </div>
          </div>
        )}
      </div>
    </ReviewFlowLayout>
  );
}
