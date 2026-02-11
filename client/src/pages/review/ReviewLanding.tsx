import { useState } from "react";
import { useRoute } from "wouter";
import { useBusinessBySlug } from "@/hooks/use-businesses";
import { useGenerateReview, useCreateReview } from "@/hooks/use-reviews";
import { Loader2, Copy, RefreshCw, Send, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

const LOGO_DISPLAY_HEIGHT = 100;
const LOGO_DISPLAY_MAX_WIDTH = 220;

const SECTION_LABEL_CLASS = "text-[10px] font-semibold uppercase tracking-wide opacity-60";

const MAX_AI_REVIEWS = 3; // Total number of AI-generated reviews allowed (1 initial + 2 regenerations)

export default function ReviewLanding() {
  const [, params] = useRoute("/r/:slug");
  const slug = params?.slug || "";
  const { data: business, isLoading } = useBusinessBySlug(slug);
  const { toast } = useToast();
  const theme = getReviewTheme(business?.reviewTheme);
  const themeStyle = getReviewThemeStyle(theme);
  const cardStyle = getReviewCardStyle(theme);
  const generateMutation = useGenerateReview();
  const createReviewMutation = useCreateReview();

  const [logoError, setLogoError] = useState(false);
  const [choice, setChoice] = useState<"great" | "concern" | null>(null);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [additionalComments, setAdditionalComments] = useState("");
  const [generatedReview, setGeneratedReview] = useState("");
  const [editableReview, setEditableReview] = useState(""); // User can edit the AI review
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationCount, setGenerationCount] = useState(0); // How many AI reviews we've generated (1–3)
  const [feedbackText, setFeedbackText] = useState("");
  const [concernName, setConcernName] = useState("");
  const [concernNumber, setConcernNumber] = useState("");
  const [concernEmail, setConcernEmail] = useState("");

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: themeStyle.background }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.primary }} />
      </div>
    );
  }

  if (!business) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: themeStyle.background, color: themeStyle.color }}
      >
        <div className="text-center">
          <p className="text-xl opacity-80">Business not found.</p>
        </div>
      </div>
    );
  }

  const showLogo = Boolean(business.logo) && !logoError;
  const chipOptions = getEffectiveReviewTags(business.category ?? "Other", business.focusAreas);

  const toggleChip = (label: string) => {
    setSelectedChips((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  const handleGenerate = async (isRegeneration = false) => {
    const wouldBeCount = isRegeneration ? generationCount + 1 : 1;
    if (wouldBeCount > MAX_AI_REVIEWS) return;
    setIsGenerating(true);
    try {
      const result = await generateMutation.mutateAsync({
        businessId: business.id,
        tags: selectedChips,
        experienceType: "great",
        customText: additionalComments.trim() || undefined,
      });
      setGeneratedReview(result.review);
      setEditableReview(result.review);
      setGenerationCount(isRegeneration ? generationCount + 1 : 1);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAndContinue = () => {
    navigator.clipboard.writeText(editableReview.trim() || generatedReview);
    window.open(business.googleReviewUrl, "_blank");
    toast({ title: "Copied!", description: "Paste your review on Google." });
  };

  const handleConcernSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReviewMutation.mutateAsync({
        businessId: business.id,
        experienceType: "concern",
        content: feedbackText.trim() || undefined,
        customerEmail: concernEmail.trim() || undefined,
        customerName: concernName.trim() || undefined,
        customerPhone: concernNumber.trim() || undefined,
      });
      toast({
        title: "Thank you",
        description: "Your feedback has been sent directly to the owner.",
      });
      setFeedbackText("");
      setConcernName("");
      setConcernNumber("");
      setConcernEmail("");
      setChoice(null);
    } catch {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Could not send your feedback. Please try again.",
      });
    }
  };

  return (
    <ReviewFlowLayout companyName={business.name} style={themeStyle}>
      {/* Same layout as Live Preview: one card, all sections stacked — responsive width to use space */}
      <div
        className="w-full max-w-[min(100%,26rem)] sm:max-w-[30rem] md:max-w-[34rem] lg:max-w-[38rem] rounded-2xl overflow-hidden flex flex-col gap-6 p-5 sm:p-6 md:p-8"
        style={{
          ...cardStyle,
          fontFamily: theme.fontFamily,
          color: theme.text,
        }}
      >
        {/* 1. How did you like your visit? */}
        <div className="space-y-3">
          <p className={SECTION_LABEL_CLASS} style={{ color: theme.text }}>
            1. How did you like your visit?
          </p>
          <h4 className="text-base font-bold" style={{ color: theme.text }}>
            {business.name}
          </h4>
          <p className="text-sm opacity-90" style={{ color: theme.text }}>
            How was your experience at {business.name}?
          </p>
          <p className="text-xs opacity-70" style={{ color: theme.text }}>
            We value your honest feedback
          </p>
          {showLogo && (
            <div
              className="flex justify-center items-center pt-1"
              style={{ minHeight: LOGO_DISPLAY_HEIGHT }}
            >
              <img
                src={business.logo!}
                alt=""
                className="object-contain"
                style={{
                  maxHeight: LOGO_DISPLAY_HEIGHT,
                  maxWidth: LOGO_DISPLAY_MAX_WIDTH,
                  width: "auto",
                  height: "auto",
                }}
                onError={() => setLogoError(true)}
              />
            </div>
          )}
        </div>

        {/* 2. Great or concerns? */}
        <div className="space-y-2">
          <p className={SECTION_LABEL_CLASS} style={{ color: theme.text }}>
            2. Great or concerns?
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setChoice("great")}
              className={cn(
                "py-3 rounded-xl text-center text-xs font-semibold border-2 transition-opacity",
                choice === "great" && "ring-2 ring-offset-2"
              )}
              style={
                choice === "great"
                  ? {
                      background: theme.backgroundAccent,
                      color: theme.primary,
                      borderColor: theme.primary + "80",
                      ringColor: theme.primary,
                    }
                  : {
                      background: theme.backgroundAccent,
                      color: theme.primary,
                      borderColor: theme.primary + "50",
                    }
              }
            >
              It was Great!
            </button>
            <button
              type="button"
              onClick={() => setChoice("concern")}
              className={cn(
                "py-3 rounded-xl text-center text-xs font-semibold border-2 transition-opacity opacity-90 hover:opacity-100",
                choice === "concern" && "ring-2 ring-offset-2"
              )}
              style={
                choice === "concern"
                  ? {
                      background: theme.backgroundAccent,
                      color: theme.secondary,
                      borderColor: theme.secondary + "80",
                      ringColor: theme.secondary,
                    }
                  : {
                      background: theme.backgroundAccent,
                      color: theme.secondary,
                      borderColor: theme.secondary + "50",
                    }
              }
            >
              I have concerns
            </button>
          </div>
        </div>

        {/* Concern path: replace sections 3+4 with concern form */}
        {choice === "concern" && (
          <div className="space-y-4">
            <p className="text-sm font-medium" style={{ color: theme.text }}>
              We&apos;re sorry to hear that. Tell us what went wrong — this goes privately to management.
            </p>
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{
                background: theme.backgroundAccent,
                border: `1px solid ${theme.primary}40`,
              }}
            >
              <Shield className="w-4 h-4 flex-shrink-0" style={{ color: theme.primary }} />
              <p className="text-xs opacity-90" style={{ color: theme.text }}>
                Your feedback is private and will not be posted publicly
              </p>
            </div>
            <form onSubmit={handleConcernSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium opacity-90 mb-1" style={{ color: theme.text }}>
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm border-2"
                  style={{
                    borderColor: theme.backgroundAccent,
                    background: theme.cardBg,
                    color: theme.text,
                  }}
                  value={concernName}
                  onChange={(e) => setConcernName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium opacity-90 mb-1" style={{ color: theme.text }}>
                  Phone number
                </label>
                <input
                  type="tel"
                  placeholder="Your phone number"
                  className="w-full rounded-xl px-4 py-3 text-sm border-2"
                  style={{
                    borderColor: theme.backgroundAccent,
                    background: theme.cardBg,
                    color: theme.text,
                  }}
                  value={concernNumber}
                  onChange={(e) => setConcernNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium opacity-90 mb-1" style={{ color: theme.text }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Your email"
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm border-2"
                  style={{
                    borderColor: theme.backgroundAccent,
                    background: theme.cardBg,
                    color: theme.text,
                  }}
                  value={concernEmail}
                  onChange={(e) => setConcernEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium opacity-90 mb-1" style={{ color: theme.text }}>
                  Message
                </label>
                <textarea
                  placeholder="Tell us about your concern..."
                  className="w-full min-h-[100px] resize-none rounded-xl px-4 py-3 text-sm border-2"
                  style={{
                    borderColor: theme.backgroundAccent,
                    background: theme.cardBg,
                    color: theme.text,
                  }}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2"
                style={getPrimaryButtonStyle(theme)}
              >
                <Send className="w-4 h-4" />
                Send feedback
              </button>
            </form>
            <a
              href={business.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs opacity-80 hover:underline"
              style={{ color: theme.text }}
            >
              I still want to post a public review
            </a>
            <button
              type="button"
              onClick={() => setChoice(null)}
              className="text-xs opacity-70 hover:underline"
              style={{ color: theme.text }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* 3. Choose tags — only when Great path */}
        {choice === "great" && (
          <>
            <div className="space-y-2">
              <p className={SECTION_LABEL_CLASS} style={{ color: theme.text }}>
                3. Choose tags
              </p>
              <p className="text-sm font-medium" style={{ color: theme.text }}>
                What stood out about your visit?
              </p>
              <div className="flex flex-wrap gap-1.5">
                {chipOptions.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleChip(label)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-full text-[11px] font-medium border-2 whitespace-nowrap transition-all",
                      selectedChips.includes(label) && "text-white border-transparent"
                    )}
                    style={
                      selectedChips.includes(label)
                        ? {
                            background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                          }
                        : {
                            background: theme.backgroundAccent,
                            color: theme.primary,
                            borderColor: theme.primary + "40",
                          }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="block text-[10px] font-medium uppercase tracking-wide opacity-70 mt-2 mb-1" style={{ color: theme.text }}>
                Additional comments (optional)
              </label>
              <textarea
                placeholder="e.g. specific staff member, wait time..."
                className="w-full min-h-[80px] rounded-xl border-2 px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{
                  borderColor: theme.primary + "60",
                  background: theme.cardBg ?? "#fff",
                  color: theme.text,
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.primary;
                  e.target.style.boxShadow = `0 0 0 2px ${theme.primary}30`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.primary + "60";
                  e.target.style.boxShadow = "none";
                }}
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
              />
              <button
                type="button"
                onClick={() => handleGenerate(false)}
                disabled={selectedChips.length === 0 || isGenerating}
                className="w-full py-2.5 rounded-xl text-[11px] font-semibold disabled:opacity-50"
                style={
                  selectedChips.length > 0 && !isGenerating
                    ? getPrimaryButtonStyle(theme)
                    : {
                        background: theme.backgroundAccent,
                        color: theme.text,
                        border: "none",
                      }
                }
              >
                {isGenerating ? "Generating..." : "Generate review"}
              </button>
            </div>

            {/* 4. AI-generated review */}
            <div className="space-y-2">
              <p className={SECTION_LABEL_CLASS} style={{ color: theme.text }}>
                4. AI-generated review
              </p>
              <p className="text-sm font-semibold" style={{ color: theme.text }}>
                Review Ready!
              </p>
              {isGenerating ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: theme.primary }} />
                  <span className="text-[11px] opacity-80" style={{ color: theme.text }}>
                    Writing your review...
                  </span>
                </div>
              ) : generatedReview ? (
                <>
                  <p className="text-[11px] opacity-80" style={{ color: theme.text }}>
                    Review generated based on your inputs — you can edit it below
                  </p>
                  <p className="text-[10px] font-medium opacity-70" style={{ color: theme.text }}>
                    Review {generationCount} of {MAX_AI_REVIEWS}
                  </p>
                  <textarea
                    className="w-full min-h-[120px] rounded-lg p-3 text-[11px] leading-relaxed resize-y"
                    style={{
                      background: theme.backgroundAccent,
                      color: theme.text,
                      border: `1px solid ${theme.primary}30`,
                    }}
                    value={editableReview}
                    onChange={(e) => setEditableReview(e.target.value)}
                    placeholder="Your review..."
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleCopyAndContinue}
                      className="w-full py-2.5 rounded-xl text-[11px] font-semibold text-white inline-flex items-center justify-center gap-1.5"
                      style={{
                        background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                      }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy & Post on Google
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerate(true)}
                      disabled={generateMutation.isPending || generationCount >= MAX_AI_REVIEWS}
                      className="w-full py-2.5 rounded-xl text-[11px] font-semibold border-2 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                      style={getSecondaryButtonStyle(theme)}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerate review {generationCount < MAX_AI_REVIEWS ? `(${MAX_AI_REVIEWS - generationCount} left)` : ""}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[11px] opacity-80" style={{ color: theme.text }}>
                    Review generated based on your inputs
                  </p>
                  <div
                    className="rounded-lg p-3 text-[11px] italic opacity-70"
                    style={{
                      background: theme.backgroundAccent,
                      color: theme.text,
                      border: `1px dashed ${theme.primary}40`,
                    }}
                  >
                    Select tags above and click &ldquo;Generate review&rdquo; to see your AI review here.
                  </div>
                  <div
                    className="py-2.5 rounded-xl text-center text-[11px] font-semibold text-white opacity-60"
                    style={{
                      background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                    }}
                  >
                    Copy & Post on Google
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* When no choice yet, show placeholder for sections 3 & 4 (like live preview) */}
        {!choice && (
          <>
            <div className="space-y-2">
              <p className={SECTION_LABEL_CLASS} style={{ color: theme.text }}>
                3. Choose tags
              </p>
              <p className="text-sm font-medium opacity-80" style={{ color: theme.text }}>
                What stood out about your visit?
              </p>
              <div className="flex flex-wrap gap-1.5">
                {chipOptions.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1.5 rounded-full text-[11px] font-medium border-2 opacity-80"
                    style={{
                      background: theme.backgroundAccent,
                      color: theme.primary,
                      borderColor: theme.primary + "40",
                    }}
                  >
                    {tag}
                  </span>
                ))}
                {chipOptions.length > 5 && (
                  <span className="text-[11px] opacity-60" style={{ color: theme.text }}>
                    +{chipOptions.length - 5}
                  </span>
                )}
              </div>
              <label className="block text-[10px] font-medium uppercase tracking-wide opacity-70 mt-2 mb-1" style={{ color: theme.text }}>
                Additional comments (optional)
              </label>
              <textarea
                placeholder="e.g. specific staff member, wait time..."
                className="w-full min-h-[80px] rounded-xl border-2 px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{
                  borderColor: theme.primary + "60",
                  background: theme.cardBg ?? "#fff",
                  color: theme.text,
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.primary;
                  e.target.style.boxShadow = `0 0 0 2px ${theme.primary}30`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.primary + "60";
                  e.target.style.boxShadow = "none";
                }}
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className={SECTION_LABEL_CLASS} style={{ color: theme.text }}>
                4. AI-generated review
              </p>
              <p className="text-sm font-semibold opacity-80" style={{ color: theme.text }}>
                Review Ready!
              </p>
              <p className="text-[11px] opacity-70" style={{ color: theme.text }}>
                Review generated based on your inputs
              </p>
              <div
                className="rounded-lg p-2 text-[11px] italic opacity-70"
                style={{ background: theme.backgroundAccent, color: theme.text }}
              >
                &ldquo;Great experience! Professional service and clear communication. Highly recommend.&rdquo;
              </div>
              <div
                className="py-2.5 rounded-xl text-center text-[11px] font-semibold text-white opacity-80"
                style={{
                  background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                }}
              >
                Copy & Post on Google
              </div>
            </div>
          </>
        )}

        <p className="text-[10px] opacity-50 pt-1" style={{ color: theme.text }}>
          Powered by RevsBoost
        </p>
    </div>
    </ReviewFlowLayout>
  );
}
