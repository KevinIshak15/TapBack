import OpenAI from "openai";

/**
 * Centralized OpenAI client service
 * Lazy initialization to ensure environment variables are loaded
 */
let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OpenAI API key. Please set OPENAI_API_KEY or AI_INTEGRATIONS_OPENAI_API_KEY environment variable.");
    }
    _openai = new OpenAI({
      apiKey: apiKey,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  return _openai;
}

export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return getOpenAI()[prop as keyof OpenAI];
  }
});

/**
 * Generate a review using OpenAI
 */
export async function generateReview(params: {
  businessName: string;
  category: string;
  experienceType: string;
  tags: string[];
  customText?: string;
  variation?: number; // 1-based: first regeneration = 1, second = 2, etc.
}): Promise<string> {
  const { businessName, category, experienceType, tags, customText, variation } = params;

  const variationInstruction =
    variation != null && variation >= 1
      ? `

IMPORTANT — This is a regeneration (version ${variation + 1}): Write a completely DIFFERENT review. Use different wording, a different opening sentence, and different sentence structure. Do not repeat the same phrases or idea order. Keep the same length and tone.`
      : "";

  const prompt = `Write a short Google review (2-5 sentences) for a business named "${businessName}" (${category}).

Experience type: ${experienceType}
User selected tags: ${tags.length > 0 ? tags.join(", ") : "None"}
User additional notes: ${customText || "None"}

Requirements:
- Length: 2-5 sentences
- Tone: Authentic, human, natural. No emojis.
- Do not sound robotic or overly enthusiastic.
${experienceType === "concern" ? "- If experience is a concern, be constructive but clear." : ""}${variationInstruction}`;

  const messages: Array<{ role: "system" | "user"; content: string }> = [
    { role: "user", content: prompt }
  ];

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages,
    max_tokens: 200,
    temperature: variation != null && variation >= 1 ? 0.9 : 0.7,
  });

  return response.choices[0]?.message?.content?.trim() || "Great experience!";
}
