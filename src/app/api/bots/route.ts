import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import { requireAuth } from '@/lib/auth-session';

// GET - List all bots for a user
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const user = await requireAuth();

    // Get all bots for the user
    const { data: bots, error } = await supabase
      .from('ai_bots')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bots:', error);
      return NextResponse.json({ error: 'Failed to fetch bots' }, { status: 500 });
    }

    return NextResponse.json({ bots: bots || [] });
  } catch (error) {
    console.error('Error in GET /api/bots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new bot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, description, config } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Get authenticated user from session
    const user = await requireAuth();

    // Validate bot type
    const validTypes = ['scanner', 'generator', 'analytics', 'optimizer', 'custom'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid bot type' }, { status: 400 });
    }

    // Create the bot
    const { data: bot, error } = await supabase
      .from('ai_bots')
      .insert({
        user_id: user.id,
        name,
        type,
        description: description || '',
        config: config || {},
        status: 'paused',
        tasks_completed: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating bot:', error);
      return NextResponse.json({ error: 'Failed to create bot' }, { status: 500 });
    }

    return NextResponse.json({ bot }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/bots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a bot
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { botId, name, type, status, description, config } = body;

    if (!botId) {
      return NextResponse.json(
        { error: 'Bot ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user from session
    const user = await requireAuth();

    // Verify bot belongs to user
    const { data: existingBot, error: checkError } = await supabase
      .from('ai_bots')
      .select('user_id')
      .eq('id', botId)
      .single();

    if (checkError || !existingBot || existingBot.user_id !== user.id) {
      return NextResponse.json({ error: 'Bot not found or unauthorized' }, { status: 404 });
    }

    // Build update object
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type;
    if (status !== undefined) updates.status = status;
    if (description !== undefined) updates.description = description;
    if (config !== undefined) updates.config = config;

    // Update status-related fields
    if (status === 'active') {
      updates.next_run_at = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now
    } else if (status === 'paused') {
      updates.next_run_at = null;
    }

    // Update the bot
    const { data: bot, error } = await supabase
      .from('ai_bots')
      .update(updates)
      .eq('id', botId)
      .select()
      .single();

    if (error) {
      console.error('Error updating bot:', error);
      return NextResponse.json({ error: 'Failed to update bot' }, { status: 500 });
    }

    return NextResponse.json({ bot });
  } catch (error) {
    console.error('Error in PUT /api/bots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a bot
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get('botId');

    if (!botId) {
      return NextResponse.json(
        { error: 'Bot ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user from session
    const user = await requireAuth();

    // Verify bot belongs to user and delete
    const { error } = await supabase
      .from('ai_bots')
      .delete()
      .eq('id', botId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting bot:', error);
      return NextResponse.json({ error: 'Failed to delete bot' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/bots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
