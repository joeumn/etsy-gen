import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apis = [
      { name: "Google AI (Gemini)", key: "GOOGLE_AI_API_KEY" },
      { name: "OpenAI", key: "OPENAI_API_KEY" },
      { name: "Etsy", key: "ETSY_API_KEY" },
      { name: "Shopify", key: "SHOPIFY_ACCESS_TOKEN" },
      { name: "Perplexity", key: "PERPLEXITY_API_KEY" },
    ];

    const configured = apis.filter(api => process.env[api.key]).length;
    const configuredApis = apis.filter(api => process.env[api.key]).map(api => api.name);

    return NextResponse.json({
      ok: true,
      configured,
      total: apis.length,
      apis: configuredApis,
      message: `${configured}/${apis.length} APIs configured`,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Failed to check APIs", configured: 0 },
      { status: 500 }
    );
  }
}
