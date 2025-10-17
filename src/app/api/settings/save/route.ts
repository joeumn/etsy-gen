import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const settingsSchema = z.object({
    aiProvider: z.string(),
    aiKeys: z.object({
        gemini: z.string().optional(),
        openai: z.string().optional(),
        anthropic: z.string().optional(),
        azureOpenAI: z.string().optional(),
    }).optional(),
    etsy: z.object({
        connected: z.boolean(),
        apiKey: z.string().optional(),
    }).optional(),
    amazon: z.object({
        connected: z.boolean(),
        accessKey: z.string().optional(),
        secretKey: z.string().optional(),
        region: z.string().optional(),
    }).optional(),
    shopify: z.object({
        connected: z.boolean(),
        accessToken: z.string().optional(),
        shopDomain: z.string().optional(),
    }).optional(),
    notifications: z.object({
        email: z.boolean(),
        push: z.boolean(),
        weeklyReport: z.boolean(),
        newTrends: z.boolean(),
    }).optional(),
});

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    try {
        const { data: { session }, } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await request.json();
        const parsedSettings = settingsSchema.safeParse(body);

        if (!parsedSettings.success) {
            return NextResponse.json({ error: 'Invalid settings format', details: parsedSettings.error.flatten() }, { status: 400 });
        }

        const { aiProvider, aiKeys, etsy, amazon, shopify, notifications } = parsedSettings.data;

        const { error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: userId,
                // The column names in the DB are snake_case
                ai_provider: aiProvider,
                ai_keys: aiKeys,
                marketplace_connections: { etsy, amazon, shopify },
                notifications: notifications,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

        if (error) {
            console.error('Error saving settings:', error);
            return NextResponse.json({ error: 'Failed to save settings to the database.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Settings saved successfully' });

    } catch (error) {
        console.error('An unexpected error occurred in settings save route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}