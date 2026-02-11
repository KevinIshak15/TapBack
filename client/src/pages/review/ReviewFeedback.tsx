import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useBusinessBySlug } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getReviewTheme,
  getReviewThemeStyle,
  getReviewCardStyle,
  getPrimaryButtonStyle,
  getSecondaryButtonStyle,
} from "@/lib/reviewThemes";
import { ReviewFlowLayout } from "@/components/ReviewFlowLayout";

const CARD_BASE_CLASS = "w-full max-w-md p-8";

export default function ReviewFeedback() {
  const [, params] = useRoute("/r/:slug/feedback");
  const [, setLocation] = useLocation();
  const slug = params?.slug || "";
  const { data: business } = useBusinessBySlug(slug);
  const { toast } = useToast();
  const [feedback, setFeedback] = useState("");
  const theme = getReviewTheme(business?.reviewTheme);
  const themeStyle = getReviewThemeStyle(theme);

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
    <ReviewFlowLayout companyName={business.name} style={themeStyle}>
      <div className={CARD_BASE_CLASS} style={getReviewCardStyle(theme)}>
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          }}
        >
          <MessageSquare className="w-7 h-7 text-white" />
        </div>

        <h2
          className="text-xl font-semibold mb-2 text-center"
          style={{ color: theme.text }}
        >
          We&apos;re sorry to hear that
        </h2>
        <p
          className="mb-6 text-center text-sm leading-relaxed opacity-80"
          style={{ color: theme.text }}
        >
          Please tell us what went wrong so we can fix it. This message goes
          privately to management.
        </p>

        <div
          className="flex items-center gap-2 p-3 rounded-xl mb-6"
          style={{
            background: theme.backgroundAccent,
            border: `1px solid ${theme.primary}40`,
          }}
        >
          <Shield className="w-5 h-5 flex-shrink-0" style={{ color: theme.primary }} />
          <p className="text-sm opacity-90" style={{ color: theme.text }}>
            Your feedback is private and will not be posted publicly
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Textarea
            placeholder="Tell us about your experience..."
            className="min-h-[120px] resize-none rounded-xl transition-all"
            style={{
              borderColor: theme.backgroundAccent,
              background: theme.backgroundAccent,
              color: theme.text,
            }}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-semibold"
            style={getPrimaryButtonStyle(theme)}
          >
            <Send className="w-4 h-4 mr-2" />
            Send Feedback
          </Button>

          <div
            className="text-center pt-4 border-t text-sm"
            style={{ borderColor: theme.backgroundAccent }}
          >
            <a
              href={business.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-80 hover:underline"
              style={{ color: theme.text }}
            >
              I still want to post a public review
            </a>
          </div>
        </form>
      </div>
    </ReviewFlowLayout>
  );
}
