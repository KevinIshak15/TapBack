import { useState } from "react";
import { motion } from "framer-motion";
import { useRoute, useLocation } from "wouter";
import { useBusinessBySlug } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, MessageSquare, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReviewFeedback() {
  const [, params] = useRoute("/r/:slug/feedback");
  const [, setLocation] = useLocation();
  const slug = params?.slug || "";
  const { data: business } = useBusinessBySlug(slug);
  const { toast } = useToast();
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Thank you",
      description: "Your feedback has been sent directly to the owner.",
    });
    setLocation(`/r/${slug}`);
  };

  if (!business) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glass-strong rounded-3xl p-8 md:p-10 relative z-10 shadow-2xl"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="ghost"
            className="mb-6 pl-0 hover:bg-transparent rounded-xl"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl font-display font-bold text-slate-900 mb-3 text-center">
            We're sorry to hear that
          </h2>
          <p className="text-slate-600 mb-8 text-center leading-relaxed">
            Please tell us what went wrong so we can fix it. This message goes
            privately to management.
          </p>

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200 mb-6">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              Your feedback is private and will not be posted publicly
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Textarea
                placeholder="Tell us about your experience..."
                className="min-h-[150px] bg-white border-slate-200 resize-none rounded-xl focus:border-orange-500 focus:ring-orange-500/20 transition-all"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Feedback
            </Button>

            <div className="text-center pt-4 border-t border-slate-200">
              <a
                href={business.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-500 hover:text-slate-700 hover:underline transition-colors"
              >
                I still want to post a public review
              </a>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
