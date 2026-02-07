import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useBusinessBySlug } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
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
    // Here we would submit private feedback to backend
    toast({
      title: "Thank you",
      description: "Your feedback has been sent directly to the owner."
    });
    // Redirect to a thank you page or back to home
    setLocation(`/r/${slug}`);
  };

  if (!business) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 animate-in">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
          We're sorry to hear that.
        </h2>
        <p className="text-gray-500 mb-6">
          Please tell us what went wrong so we can fix it. This message goes privately to management.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Tell us about your experience..."
            className="min-h-[150px] bg-gray-50 border-gray-200 resize-none rounded-xl"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
          
          <Button type="submit" className="w-full h-12 rounded-xl text-lg">
            <Send className="w-4 h-4 mr-2" /> Send Feedback
          </Button>

          <div className="text-center pt-4">
            <a href={business.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 underline">
              I still want to post a public review
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
