import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useBusinessBySlug } from "@/hooks/use-businesses";
import { Loader2 } from "lucide-react";
import {
  getReviewTheme,
  getReviewThemeStyle,
  getReviewCardStyle,
  getPrimaryButtonStyle,
  getSecondaryButtonStyle,
} from "@/lib/reviewThemes";
import { ReviewFlowLayout } from "@/components/ReviewFlowLayout";

const CARD_BASE_CLASS = "w-full max-w-md p-8";

// Fixed logo display size so all logos appear the same size regardless of upload dimensions.
// Uploaded logos are converted to transparent PNG; this area has no background so transparency shows.
const LOGO_DISPLAY_HEIGHT = 120; // px
const LOGO_DISPLAY_MAX_WIDTH = 240; // px

export default function ReviewLanding() {
  const [, params] = useRoute("/r/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug || "";
  const { data: business, isLoading } = useBusinessBySlug(slug);
  const theme = getReviewTheme(business?.reviewTheme);
  const themeStyle = getReviewThemeStyle(theme);
  const [logoError, setLogoError] = useState(false);

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

  const handleGreat = () => setLocation(`/r/${slug}/review`);
  const handleConcern = () => setLocation(`/r/${slug}/feedback`);
  const showLogo = Boolean(business.logo) && !logoError;

  return (
    <ReviewFlowLayout companyName={business.name} style={themeStyle}>
      <div className={CARD_BASE_CLASS} style={getReviewCardStyle(theme)}>
        <h1
          className="text-xl font-semibold text-center mb-6 sm:mb-8 leading-snug px-1"
          style={{ color: theme.text }}
        >
          How was your experience with {business.name}?
        </h1>
        {showLogo && (
          <div
            className="flex justify-center items-center mb-6 sm:mb-8"
            style={{
              minHeight: LOGO_DISPLAY_HEIGHT,
              minWidth: "100%",
            }}
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
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleGreat}
            className="w-full py-4 px-6 rounded-xl text-base font-semibold transition-opacity hover:opacity-95 active:opacity-90"
            style={getPrimaryButtonStyle(theme)}
          >
            Great experience
          </button>
          <button
            type="button"
            onClick={handleConcern}
            className="w-full py-4 px-6 rounded-xl text-base font-semibold transition-colors hover:opacity-90"
            style={getSecondaryButtonStyle(theme)}
          >
            I have a concern
          </button>
        </div>
      </div>
    </ReviewFlowLayout>
  );
}
