import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRoute } from "wouter";
import { useBusinessBySlug } from "@/hooks/use-businesses";
import { useGenerateReview } from "@/hooks/use-reviews";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Check, Copy, ExternalLink, RefreshCw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReviewGenerator() {
  const [, params] = useRoute("/r/:slug/review");
  const slug = params?.slug || "";
  const { data: business } = useBusinessBySlug(slug);
  const generateMutation = useGenerateReview();

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customText, setCustomText] = useState("");
  const [generatedReview, setGeneratedReview] = useState("");
  const [step, setStep] = useState<"tags" | "generate" | "copy">("tags");
  const [regenerationCount, setRegenerationCount] = useState(0);
  const MAX_REGENERATIONS = 3;

  if (!business) return null;

  // Category-specific default tags
  const categoryDefaultTags: Record<string, string[]> = {
    "Restaurant": ["Great food", "Friendly staff", "Fast service", "Clean place", "Good value"],
    "Cafe": ["Great coffee", "Cozy atmosphere", "Friendly staff", "Consistent quality", "Relaxing spot"],
    "Retail": ["Helpful staff", "Good selection", "Easy checkout", "Clean store", "Smooth experience"],
    "Service": ["Professional service", "On time", "Clear communication", "Quality work", "Easy to work with"],
    "Healthcare": ["Caring staff", "Professional experience", "Clean facility", "Clear explanations", "Well organized"],
    "Beauty & Wellness": ["Relaxing experience", "Friendly staff", "Great results", "Clean space", "Professional service"],
    "Automotive": ["Honest service", "Quick turnaround", "Fair pricing", "Knowledgeable staff", "Quality work"],
    "Home Services": ["On time", "Professional team", "Clean work", "Clear pricing", "Job done right"],
    "Education": ["Supportive staff", "Clear instruction", "Positive environment", "Well organized", "Helpful experience"],
    "Entertainment": ["Great experience", "Fun atmosphere", "Friendly staff", "Well organized", "Would come again"],
    "Fitness & Sports": ["Clean facility", "Motivating trainers", "Friendly staff", "Great workouts", "Welcoming environment"],
    "Real Estate": ["Professional agent", "Responsive", "Knowledgeable", "Smooth process", "Helpful guidance"],
    "Legal": ["Professional service", "Clear communication", "Responsive", "Knowledgeable", "Helpful guidance"],
    "Financial": ["Clear advice", "Professional staff", "Easy process", "Helpful support", "Trustworthy service"],
    "Travel & Hospitality": ["Friendly staff", "Clean rooms", "Comfortable stay", "Great location", "Would stay again"],
    "Other": ["Great service", "Friendly staff", "Professional experience", "Clean environment", "Highly recommend"],
  };

  const getDefaultTagsForCategory = (category: string): string[] => {
    return categoryDefaultTags[category] || categoryDefaultTags["Other"];
  };

  const defaultFocusAreas = getDefaultTagsForCategory(business.category || "Other");
  // Always show defaults, plus any custom tags from business
  const customTags = business.focusAreas && business.focusAreas.length > 0 
    ? business.focusAreas.filter((tag: string) => !defaultFocusAreas.includes(tag))
    : [];
  const tags = [...defaultFocusAreas, ...customTags];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleGenerate = async (isRegeneration = false) => {
    // Check regeneration limit
    if (isRegeneration && regenerationCount >= MAX_REGENERATIONS) {
      return;
    }

    setStep("generate");
    try {
      const result = await generateMutation.mutateAsync({
        businessId: business.id,
        tags: selectedTags,
        experienceType: "great",
        customText,
      });
      setGeneratedReview(result.review);
      setStep("copy");
      
      // Increment regeneration count if this is a regeneration
      if (isRegeneration) {
        setRegenerationCount((prev) => prev + 1);
      }
    } catch (e) {
      console.error(e);
      // Don't increment count on error
    }
  };

  const copyAndRedirect = () => {
    navigator.clipboard.writeText(generatedReview);
    window.open(business.googleReviewUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-strong rounded-3xl p-8 md:p-10 relative z-10 shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {step === "tags" && (
            <motion.div
              key="tags"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">
                  What did you like?
                </h2>
                <p className="text-slate-600">Select tags to help us write your review</p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {tags.map((tag) => (
                  <motion.button
                    key={tag}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border-2",
                      selectedTags.includes(tag)
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg scale-105"
                        : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                    )}
                  >
                    {tag}
                  </motion.button>
                ))}
              </div>

              <Textarea
                placeholder="Anything else you want to mention? (Optional)"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="resize-none bg-white border-slate-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 min-h-[100px]"
                rows={3}
              />

              <Button
                size="lg"
                className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all font-semibold"
                onClick={handleGenerate}
                disabled={selectedTags.length === 0 && !customText}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Review
              </Button>
            </motion.div>
          )}

          {step === "generate" && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">
                Writing your review...
              </h3>
              <p className="text-slate-600">Our AI is crafting the perfect 5-star review</p>
            </motion.div>
          )}

          {step === "copy" && (
            <motion.div
              key="copy"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Check className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">
                  Review Ready!
                </h2>
                <p className="text-slate-600">Review generated based on your inputs</p>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 rounded-2xl border-2 border-slate-200 relative group">
                <Textarea
                  value={generatedReview}
                  onChange={(e) => setGeneratedReview(e.target.value)}
                  className="resize-none bg-transparent border-none text-slate-700 italic leading-relaxed p-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[100px]"
                  placeholder="Your review will appear here..."
                />
                <div className="flex items-center justify-between mt-3">
                  {regenerationCount < MAX_REGENERATIONS ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                      onClick={() => handleGenerate(true)}
                      disabled={generateMutation.isPending}
                      title={`Regenerate (${MAX_REGENERATIONS - regenerationCount} remaining)`}
                    >
                      <RefreshCw className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="text-xs text-slate-500">Regenerate</span>
                    </Button>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-500">
                        Regeneration limit reached
                      </div>
                    </div>
                  )}
                  {regenerationCount > 0 && (
                    <div className="text-xs text-slate-500">
                      Regenerated {regenerationCount} of {MAX_REGENERATIONS} times
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full h-14 text-lg rounded-2xl shadow-xl shadow-green-500/25 hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  onClick={copyAndRedirect}
                >
                  <Copy className="w-5 h-5 mr-2" />
                  Copy & Post on Google
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-center text-slate-500">
                  Clicking this will copy the text and open Google Maps
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
