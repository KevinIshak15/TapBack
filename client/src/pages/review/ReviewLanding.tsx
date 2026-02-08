import { motion } from "framer-motion";
import { useRoute, useLocation } from "wouter";
import { useBusinessBySlug } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Loader2, Sparkles } from "lucide-react";

export default function ReviewLanding() {
  const [, params] = useRoute("/r/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug || "";
  const { data: business, isLoading } = useBusinessBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
        <div className="text-center">
          <p className="text-xl text-slate-600">Business not found.</p>
        </div>
      </div>
    );
  }

  const handleChoice = (experience: "great" | "concern") => {
    sessionStorage.setItem("review_experience", experience);
    if (experience === "concern") {
      setLocation(`/r/${slug}/feedback`);
    } else {
      setLocation(`/r/${slug}/review`);
    }
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
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glass-strong rounded-3xl p-8 md:p-10 text-center relative z-10 shadow-2xl"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-3">
            How was your experience at {business.name}?
          </h1>
          <p className="text-lg text-slate-600">We value your honest feedback</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleChoice("great")}
            className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-white border-2 border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 group-hover:shadow-xl transition-all">
              <ThumbsUp className="w-10 h-10 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
              It was Great!
            </span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleChoice("concern")}
            className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-white border-2 border-slate-200 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 group-hover:shadow-xl transition-all">
              <ThumbsDown className="w-10 h-10 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-slate-900 text-lg group-hover:text-purple-600 transition-colors">
              I have concerns
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
