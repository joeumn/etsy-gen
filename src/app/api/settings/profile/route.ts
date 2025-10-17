import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const profileUpdateSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty" }).max(255),
  avatar_url: z.string().url({ message: "Invalid URL format" }).optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const parsedData = profileUpdateSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsedData.error.flatten() }, { status: 400 });
    }

    const { name, avatar_url } = parsedData.data;

    const { data, error } = await supabase
      .from('users')
      .update({ name, avatar_url: avatar_url || null })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profile updated successfully', user: data });
  } catch (e) {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}