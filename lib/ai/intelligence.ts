// lib/ai/intelligence.ts
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

// This is the TypeScript interface for our report
export interface MarketIntelligenceReport {
  trend: string;
  targetAudience: string;
  topKeywords: string[];
  pricingSuggestion: string;
  analysis: string;
  sourceURLs: { title: string; url: string }[];
}

// Initialize Perplexity client using OpenAI SDK (Perplexity is OpenAI-compatible)
function getPerplexityClient() {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY is not set');
  }

  return new OpenAI({
    apiKey,
    baseURL: 'https://api.perplexity.ai',
  });
}

export async function getAndSaveMarketIntelligence(
  topic: string,
  userId: string
): Promise<MarketIntelligenceReport> {
  const perplexity = getPerplexityClient();

  // Build the prompt for market intelligence
  const prompt = `Analyze the market for "${topic}" and provide:
1. Current market trend (1-2 sentences)
2. Target audience demographics and preferences
3. Top 5 keywords for SEO and marketing
4. Pricing suggestion based on competitor analysis
5. Overall market analysis and opportunities
6. Include source URLs for your findings

Format your response as JSON with these fields:
{
  "trend": "string",
  "targetAudience": "string",
  "topKeywords": ["keyword1", "keyword2", ...],
  "pricingSuggestion": "string",
  "analysis": "string",
  "sourceURLs": [{"title": "string", "url": "string"}, ...]
}`;

  try {
    // Call Perplexity API
    const response = await perplexity.chat.completions.create({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are a market research expert. Provide detailed, data-driven insights about market trends and opportunities.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from Perplexity API');
    }

    // Parse the response (try to extract JSON from markdown code blocks if present)
    let reportData: MarketIntelligenceReport;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      reportData = JSON.parse(jsonString);
    } catch (parseError) {
      // If parsing fails, create a fallback structure
      reportData = {
        trend: 'Unable to parse structured data',
        targetAudience: 'See analysis for details',
        topKeywords: [],
        pricingSuggestion: 'See analysis for details',
        analysis: content,
        sourceURLs: [],
      };
    }

    // Save to database
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('MarketReports')
      .insert({
        userId: userId,
        topic: topic,
        reportData: reportData,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save market report:', error);
      throw new Error(`Failed to save report: ${error.message}`);
    }

    return reportData;
  } catch (error) {
    console.error('Market intelligence error:', error);
    throw error;
  }
}

// Function to get all market reports for a user
export async function getUserMarketReports(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('MarketReports')
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch reports: ${error.message}`);
  }

  return data;
}

// Function to get a specific report
export async function getMarketReport(reportId: string, userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('MarketReports')
    .select('*')
    .eq('id', reportId)
    .eq('userId', userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch report: ${error.message}`);
  }

  return data;
}

// Function to delete a report
export async function deleteMarketReport(reportId: string, userId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('MarketReports')
    .delete()
    .eq('id', reportId)
    .eq('userId', userId);

  if (error) {
    throw new Error(`Failed to delete report: ${error.message}`);
  }

  return { success: true };
}
