import { useState, useRef, useEffect } from "react";
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

/* Fixed slot so every uploaded logo displays at the same size (object-contain scales to fit) */
const LOGO_DISPLAY_HEIGHT = 200;
const LOGO_DISPLAY_MAX_WIDTH = 360;

const SECTION_LABEL_CLASS = "text-xs font-semibold uppercase tracking-wide opacity-60";

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
  const sectionTagsRef = useRef<HTMLDivElement>(null);
  const sectionCopyPasteRef = useRef<HTMLDivElement>(null);
  const sectionConcernRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to new sections when they appear (especially on phone)
  useEffect(() => {
    if (choice === "great" && sectionTagsRef.current) {
      sectionTagsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (choice === "concern" && sectionConcernRef.current) {
      sectionConcernRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [choice]);

  useEffect(() => {
    if (generatedReview && sectionCopyPasteRef.current) {
      sectionCopyPasteRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [generatedReview]);

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
        variation: isRegeneration ? generationCount : undefined,
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
        {/* 1. Intro + logo */}
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-wide opacity-90" style={{ color: theme.text }}>
            How was your experience at{" "}
            <span className="font-bold" style={{ color: theme.text }}>
              {business.name}
            </span>
            ?
          </p>
          {showLogo && (
            <div
              className="flex justify-center items-center pt-2 pb-1"
              style={{
                height: LOGO_DISPLAY_HEIGHT,
                maxWidth: LOGO_DISPLAY_MAX_WIDTH,
                margin: "0 auto",
              }}
            >
              <img
                src={business.logo!}
                alt=""
                className="object-contain w-full h-full"
                style={{
                  maxHeight: LOGO_DISPLAY_HEIGHT,
                  maxWidth: LOGO_DISPLAY_MAX_WIDTH,
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                }}
                onError={() => setLogoError(true)}
              />
            </div>
          )}
        </div>

        {/* Great or concerns — no number (already asked above) */}
        <div className="space-y-2">
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
          <div ref={sectionConcernRef} className="space-y-4">
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

        {/* 3. Choose tags — only when they chose "Great"; then after generate, show copy/paste */}
        {choice === "great" && (
          <>
            <div ref={sectionTagsRef} className="space-y-2">
              <p className={SECTION_LABEL_CLASS} style={{ color: theme.text }}>
                2. What stood out?
              </p>
              <p className="text-base font-medium" style={{ color: theme.text }}>
                Pick any that apply (optional).
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
              <label className="block text-xs font-medium uppercase tracking-wide opacity-70 mt-2 mb-1" style={{ color: theme.text }}>
                Anything else to add?
              </label>
              <textarea
                placeholder="e.g. specific staff member, wait time..."
                className="w-full min-h-[2.5rem] rounded-xl border-2 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-offset-1"
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
              {!generatedReview && (
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
              )}
              {isGenerating && (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: theme.primary }} />
                  <span className="text-[11px] opacity-80" style={{ color: theme.text }}>
                    Writing your review...
                  </span>
                </div>
              )}
            </div>

            {/* 3. Copy & paste — only after they generate */}
            {generatedReview && (
              <div ref={sectionCopyPasteRef} className="space-y-2">
                <p className={SECTION_LABEL_CLASS} style={{ color: theme.text }}>
                  3. Copy & post to Google
                </p>
                <p className="text-base font-semibold" style={{ color: theme.text }}>
                  Your review is ready
                </p>
                <p className="text-xs opacity-80" style={{ color: theme.text }}>
                  Edit if you’d like, then copy and paste it to Google.
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
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: theme.primary }} />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        Regenerate review {generationCount < MAX_AI_REVIEWS ? `(${MAX_AI_REVIEWS - generationCount} left)` : ""}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <p className="text-[10px] opacity-50 pt-1" style={{ color: theme.text }}>
          Powered by{" "}
          <a
            href="https://revsboost.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
            style={{ color: theme.text }}
          >
            RevsBoost
          </a>
        </p>
    </div>
    </ReviewFlowLayout>
  );
}
