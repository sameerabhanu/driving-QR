export interface AiContent {
    tagline: string;
    benefits: string[];
}

const DEFAULT_BENEFITS = [
    "Professional Service",
    "Customer Focused Approach",
    "Fast Response",
    "Easy Communication",
    "Reliable Support",
];

function buildFallbackContent(businessName: string, businessType: string): AiContent {
    const normalizedType = businessType.trim() || "Local Business";
    const normalizedName = businessName.trim() || normalizedType;

    return {
        tagline: `${normalizedName} for ${normalizedType}`.slice(0, 255),
        benefits: DEFAULT_BENEFITS,
    };
}

function extractJsonPayload(content: string): string {
    const trimmed = content.trim();

    if (trimmed.startsWith("```")) {
        const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (fenced?.[1]) {
            return fenced[1].trim();
        }
    }

    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
        return trimmed.slice(firstBrace, lastBrace + 1);
    }

    return trimmed;
}

function normalizeAiContent(parsed: unknown, businessName: string, businessType: string): AiContent {
    if (!parsed || typeof parsed !== "object") {
        throw new Error("AI response was not an object");
    }

    const candidate = parsed as { tagline?: unknown; benefits?: unknown };
    const tagline = typeof candidate.tagline === "string" ? candidate.tagline.trim() : "";
    const benefits = Array.isArray(candidate.benefits)
        ? candidate.benefits
            .map((item) => String(item).trim())
            .filter(Boolean)
            .slice(0, 5)
        : [];

    return {
        tagline: (tagline || buildFallbackContent(businessName, businessType).tagline).slice(0, 255),
        benefits:
            benefits.length === 5
                ? benefits.map((item) => item.slice(0, 120))
                : DEFAULT_BENEFITS,
    };
}

export async function generateBusinessContent(
    businessName: string,
    businessType: string
): Promise<AiContent> {
    const systemPrompt = `You are a backend content generator for local business landing pages. 
Analyze the following input:
Business Name: ${businessName}
Business Type: ${businessType}

Generate exactly:
1. One short, professional tagline (max 60 chars).
2. Five short, generic business benefits.

CRITICAL RULES:
- Return the response in strict JSON format: {"tagline": "", "benefits": ["", "", "", "", ""]}
- Only use generic industry benefits (e.g., "Professional Service", "Flexible Scheduling", "Customer Focused Approach").
- DO NOT invent years of experience, customer counts, certifications, awards, or business-specific claims. 
- The output must be 100% safe and true for ANY business within this category.`;

    if (!process.env.GROQ_API_KEY) {
        console.warn("GROQ_API_KEY environment variable is not set. Using fallback AI content.");
        return buildFallbackContent(businessName, businessType);
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                    {
                        role: "user",
                        content: `Business Name: ${businessName}\nBusiness Type: ${businessType}`,
                    },
                ],
                response_format: { type: "json_object" },
                temperature: 0.2,
                max_tokens: 300,
            }),
            cache: "no-store",
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Groq API error:", error);
            return buildFallbackContent(businessName, businessType);
        }

        const data = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
        };

        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            console.error("Groq API returned no content", data);
            return buildFallbackContent(businessName, businessType);
        }

        const parsed = JSON.parse(extractJsonPayload(content));
        return normalizeAiContent(parsed, businessName, businessType);
    } catch (error) {
        console.error("Failed to generate or parse Groq response:", error);
        return buildFallbackContent(businessName, businessType);
    }
}
