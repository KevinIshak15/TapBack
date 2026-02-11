/**
 * Categories and review tags for the business settings and customer review flow.
 * - 5 default tags per category: chosen for Google (natural phrases that match Place Topics,
 *   "People often mention", and local SEO — what customers actually write in reviews).
 * - Optional extras: max 2, from a bank of 4 or max 1 custom.
 */

/** All categories available in the searchable dropdown (order for display). */
export const CATEGORIES = [
  "Restaurant",
  "Cafe",
  "Retail",
  "Service",
  "Healthcare",
  "Dental Clinic",
  "Walking Clinic",
  "Pharmacy",
  "Beauty & Wellness",
  "Automotive",
  "Home Services",
  "Education",
  "Entertainment",
  "Fitness & Sports",
  "Real Estate",
  "Legal",
  "Financial",
  "Travel & Hospitality",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

/**
 * Five tags per category — tuned for Google reviews & Place Topics:
 * natural, category-specific phrases customers use (food quality, service, atmosphere, value, etc.).
 */
export const CATEGORY_DEFAULT_TAGS: Record<string, string[]> = {
  Restaurant: ["Great food", "Friendly staff", "Would recommend", "Good atmosphere", "Good value"],
  Cafe: ["Great coffee", "Cozy atmosphere", "Friendly staff", "Would come again", "Quick service"],
  Retail: ["Helpful staff", "Good selection", "Would recommend", "Easy to find", "Clean store"],
  Service: ["Professional service", "On time", "Would recommend", "Quality work", "Easy to work with"],
  Healthcare: ["Caring staff", "Professional", "Clean facility", "Would recommend", "Well organized"],
  "Dental Clinic": ["Gentle care", "Clean office", "Friendly staff", "Would recommend", "Comfortable visit"],
  "Walking Clinic": ["Quick visit", "Caring staff", "Walk-in friendly", "Would recommend", "Professional care"],
  Pharmacy: ["Helpful staff", "Quick service", "Knowledgeable", "Would recommend", "Well stocked"],
  "Beauty & Wellness": ["Great results", "Friendly staff", "Relaxing", "Would recommend", "Clean space"],
  Automotive: ["Honest service", "Quick turnaround", "Fair pricing", "Would recommend", "Quality work"],
  "Home Services": ["On time", "Professional", "Quality work", "Would recommend", "Clean work"],
  Education: ["Supportive staff", "Clear instruction", "Would recommend", "Helpful", "Great experience"],
  Entertainment: ["Great experience", "Fun atmosphere", "Friendly staff", "Would come again", "Well organized"],
  "Fitness & Sports": ["Clean facility", "Great workouts", "Friendly staff", "Would recommend", "Welcoming"],
  "Real Estate": ["Professional agent", "Responsive", "Smooth process", "Would recommend", "Helpful"],
  Legal: ["Professional", "Clear communication", "Responsive", "Would recommend", "Helpful"],
  Financial: ["Clear advice", "Professional", "Easy process", "Would recommend", "Trustworthy"],
  "Travel & Hospitality": ["Friendly staff", "Clean rooms", "Comfortable stay", "Would recommend", "Great location"],
  Other: ["Great service", "Friendly staff", "Would recommend", "Professional", "Clean place"],
};

/** Bank of 4 optional tags — business can add up to 2 extras from these or max 1 custom. */
export const OPTIONAL_TAG_BANK = [
  "Highly recommend",
  "Would come again",
  "Great value",
  "Quick service",
] as const;

export function getDefaultTagsForCategory(category: string): string[] {
  return CATEGORY_DEFAULT_TAGS[category] ?? CATEGORY_DEFAULT_TAGS["Other"];
}

/**
 * Full list of tags for the review flow: 5 category defaults + up to 2 saved extras (from bank or custom).
 */
export function getEffectiveReviewTags(category: string, focusAreas: string[] | undefined): string[] {
  const defaults = getDefaultTagsForCategory(category || "Other");
  const extras = (focusAreas ?? []).filter((t) => t.trim().length > 0);
  return [...defaults, ...extras];
}

export function isOptionalBankTag(tag: string): boolean {
  return (OPTIONAL_TAG_BANK as readonly string[]).includes(tag);
}
