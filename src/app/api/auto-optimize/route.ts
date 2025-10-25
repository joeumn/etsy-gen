import { NextRequest, NextResponse } from 'next/server';
import { AIProviderFactory } from '@/lib/ai/aiFactory';
import { supabase } from '@/lib/supabase/admin-client';

export async function GET(request: NextRequest) {
    const authToken = (request.headers.get('authorization') || '').split('Bearer ')[1];
    if (process.env.CRON_SECRET && authToken !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (process.env.ENABLE_STAGE4_AUTOOPTIMIZE !== 'true') {
        return NextResponse.json({ message: 'Auto-optimize feature is not enabled.' });
    }
    console.log("Starting auto-optimize job...");

    try {
        // 1. Pull performance metrics from the last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: earnings, error: earningsError } = await supabase
            .from('earnings')
            .select('total_revenue, total_sales, marketplace, created_at')
            .gte('created_at', sevenDaysAgo);

        if (earningsError) throw earningsError;

        const { data: traffic, error: trafficError } = await supabase
            .from('traffic_sources')
            .select('platform, clicks, conversions')
            .gte('created_at', sevenDaysAgo);

        if (trafficError) throw trafficError;

        // 2. Use AI to analyze the data and generate a report
        const aiProvider = await AIProviderFactory.getProvider();
        const analysisPrompt = `
            You are an AI Business Analyst. Analyze the following performance data for a digital product business and provide a concise report with actionable recommendations.

            **Last 7 Days Performance Data:**
            - **Earnings:** ${JSON.stringify(earnings)}
            - **Traffic:** ${JSON.stringify(traffic)}

            **Your Task:**
            1.  Provide a brief, 2-3 sentence summary of the overall performance.
            2.  Identify the top-performing marketplace or traffic source.
            3.  Identify one key area for improvement.
            4.  Suggest three concrete, actionable recommendations to increase profit by at least 15%.

            **Return your response as a JSON object with "summary" and "actions" keys.** The "actions" key should contain an array of strings.
        `;
        
        const reportContent = await aiProvider.generateListingContent({
            title: 'Performance Analysis', description: analysisPrompt,
            tags: [], price: 0, category: '', seoKeywords: [],
        }, 'system');

        let parsedReport;
        try {
            const jsonMatch = reportContent.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("No JSON found in AI report.");
            parsedReport = JSON.parse(jsonMatch[0]);
        } catch(e) {
            console.error("Failed to parse AI report:", e);
            parsedReport = { summary: "Could not generate AI report due to a parsing error.", actions: [] };
        }

        // 3. Log the report to the database
        const { data, error: insertError } = await supabase
            .from('auto_reports')
            .insert({
                summary: parsedReport.summary,
                actions: { recommendations: parsedReport.actions }
            });

        if (insertError) throw insertError;

        console.log("Auto-optimize job completed. Report generated.");
        return NextResponse.json({ message: 'Auto-optimize job executed successfully.', report: parsedReport });

    } catch (error) {
        console.error("Error in auto-optimize job:", error);
        return NextResponse.json({ error: 'Failed to execute auto-optimize job.' }, { status: 500 });
    }
}
