import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-session';
import { supabase } from '@/lib/db/client';
import { executeBot } from '@/lib/bots/bot-executor';

/**
 * POST - Execute a bot manually
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { botId } = body;

    if (!botId) {
      return NextResponse.json(
        { error: 'Bot ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user from session
    const user = await requireAuth();

    // Verify bot belongs to user
    const { data: bot, error: checkError } = await supabase
      .from('ai_bots')
      .select('id, user_id, name, type, status')
      .eq('id', botId)
      .single();

    if (checkError || !bot || bot.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Bot not found or unauthorized' },
        { status: 404 }
      );
    }

    // Execute the bot
    const result = await executeBot(botId);

    return NextResponse.json({
      success: result.success,
      bot: {
        id: bot.id,
        name: bot.name,
        type: bot.type,
      },
      execution: result,
    });
  } catch (error) {
    console.error('Error in POST /api/bots/execute:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
