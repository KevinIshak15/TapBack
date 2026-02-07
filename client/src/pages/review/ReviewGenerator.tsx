import { useState } from "react";
import { useRoute } from "wouter";
import { useBusinessBySlug } from "@/hooks/use-businesses";
import { useGenerateReview } from "@/hooks/use-reviews";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Check, Copy, ExternalLink, RefreshCw } from "lucide-react";
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
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleGenerate = async () => {
    setStep("generate");
    try {
      const result = await generateMutation.mutateAsync({
        businessId: business.id,
        tags: selectedTags,
        experienceType: "great",
        customText
      });
      setGeneratedReview(result.review);
      setStep("copy");
    } catch (e) {
      console.error(e);
      // fallback to manual step or show error
    }
  };

  const copyAndRedirect = () => {
    navigator.clipboard.writeText(generatedReview);
    // Open Google Review URL in new tab
    window.open(business.googleReviewUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-in">
        
        {step === "tags" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-gray-900">What did you like?</h2>
              <p className="text-gray-500">Select tags to help us write your review.</p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border-2",
                    selectedTags.includes(tag)
                      ? "bg-primary/10 border-primary text-primary shadow-sm scale-105"
                      : "bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>

            <Textarea 
              placeholder="Anything else you want to mention? (Optional)"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="resize-none bg-gray-50 border-gray-100"
              rows={3}
            />

            <Button 
              size="lg" 
              className="w-full h-14 text-lg rounded-2xl shadow-lg shadow-primary/25"
              onClick={handleGenerate}
              disabled={selectedTags.length === 0 && !customText}
            >
              <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
              Generate Review
            </Button>
          </div>
        )}

        {step === "generate" && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Writing your review...</h3>
            <p className="text-gray-500">Our AI is crafting the perfect 5-star review.</p>
          </div>
        )}

        {step === "copy" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900">Review Ready!</h2>
              <p className="text-gray-500">Review generated based on your inputs.</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 relative group">
              <p className="text-gray-700 italic">"{generatedReview}"</p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleGenerate()}
              >
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </Button>
            </div>

            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full h-14 text-lg rounded-2xl shadow-lg shadow-green-500/25 bg-green-600 hover:bg-green-700"
                onClick={copyAndRedirect}
              >
                <Copy className="w-5 h-5 mr-2" />
                Copy & Post on Google
              </Button>
              <p className="text-xs text-center text-gray-400">
                Clicking this will copy the text and open Google Maps.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
