import type { PosterData, PosterRenderOptions, TemplateMetadata } from "./types";
import { metadata as minimalMeta, render as renderMinimal } from "./templates/minimal-professional";
import { metadata as modernCafeMeta, render as renderModernCafe } from "./templates/modern-cafe";
import { metadata as elegantBoutiqueMeta, render as renderElegantBoutique } from "./templates/elegant-boutique";
import { metadata as structuredStepsMeta, render as renderStructuredSteps } from "./templates/structured-steps";
import { metadata as darkPremiumMeta, render as renderDarkPremium } from "./templates/dark-premium";
import { metadata as friendlyCasualMeta, render as renderFriendlyCasual } from "./templates/friendly-casual";
import { metadata as googleCornersMeta, render as renderGoogleCorners } from "./templates/google-corners";
import { metadata as elegantPastelMeta, render as renderElegantPastel } from "./templates/elegant-pastel";
import { metadata as friendlyBlobsMeta, render as renderFriendlyBlobs } from "./templates/friendly-blobs";
import { metadata as tealStepsMeta, render as renderTealSteps } from "./templates/teal-steps";

export interface TemplateEntry {
  metadata: TemplateMetadata;
  render: (data: PosterData, options: PosterRenderOptions) => string;
}

const templates: Record<string, TemplateEntry> = {
  "minimal-professional": { metadata: minimalMeta, render: renderMinimal },
  "google-corners": { metadata: googleCornersMeta, render: renderGoogleCorners },
  "modern-cafe": { metadata: modernCafeMeta, render: renderModernCafe },
  "elegant-boutique": { metadata: elegantBoutiqueMeta, render: renderElegantBoutique },
  "elegant-pastel": { metadata: elegantPastelMeta, render: renderElegantPastel },
  "structured-steps": { metadata: structuredStepsMeta, render: renderStructuredSteps },
  "teal-steps": { metadata: tealStepsMeta, render: renderTealSteps },
  "dark-premium": { metadata: darkPremiumMeta, render: renderDarkPremium },
  "friendly-casual": { metadata: friendlyCasualMeta, render: renderFriendlyCasual },
  "friendly-blobs": { metadata: friendlyBlobsMeta, render: renderFriendlyBlobs },
};

export function getTemplateIds(): string[] {
  return Object.keys(templates);
}

export function getTemplateMetadata(id: string): TemplateMetadata | null {
  return templates[id]?.metadata ?? null;
}

export function renderTemplate(
  templateId: string,
  data: PosterData,
  options: PosterRenderOptions
): string {
  const t = templates[templateId];
  if (!t) throw new Error(`Unknown template: ${templateId}`);
  return t.render(data, options);
}

export function listTemplates(): { id: string; name: string; description: string; previewThumbnailUrl?: string }[] {
  return Object.entries(templates).map(([id, t]) => ({
    id,
    name: t.metadata.name,
    description: t.metadata.description,
    previewThumbnailUrl: t.metadata.previewThumbnailUrl,
  }));
}
