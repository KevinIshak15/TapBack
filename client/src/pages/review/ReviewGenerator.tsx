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

  if (!business) return null;

  const defaultFocusAreas = ["Service", "Quality", "Speed", "Price", "Atmosphere"];
  const tags = business.focusAreas?.length ? business.focusAreas : defaultFocusAreas;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleGenerate = async () => {
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
    } catch (e) {
      console.error(e);
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
                <p className="text-slate-700 italic leading-relaxed">"{generatedReview}"</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                  onClick={handleGenerate}
                >
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                </Button>
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
