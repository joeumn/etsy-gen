import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import { logError } from '@/lib/logger';
import { handleAPIError } from '@/lib/errors';

/**
 * Team Members API
 * Manages team collaboration and member management
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamOwnerId, memberUserId, role, permissions } = body;

    if (!teamOwnerId || !memberUserId) {
      return NextResponse.json(
        { success: false, error: 'Team owner ID and member user ID are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('team_members')
      .insert({
        team_owner_id: teamOwnerId,
        member_user_id: memberUserId,
        role: role || 'member',
        permissions,
        is_active: true,
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Team member added successfully',
      member: data,
    });
  } catch (error) {
    logError(error, 'TeamMembers');
    const { response, statusCode } = handleAPIError(error, '/api/team/members');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teamOwnerId = searchParams.get('teamOwnerId');

    if (!teamOwnerId) {
      return NextResponse.json(
        { success: false, error: 'Team owner ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        member:member_user_id (
          id,
          email,
          name,
          avatar_url
        )
      `)
      .eq('team_owner_id', teamOwnerId)
      .order('joined_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      members: data || [],
    });
  } catch (error) {
    logError(error, 'TeamMembers');
    const { response, statusCode } = handleAPIError(error, '/api/team/members');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, role, permissions, isActive } = body;

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (role !== undefined) updates.role = role;
    if (permissions !== undefined) updates.permissions = permissions;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Team member updated successfully',
      member: data,
    });
  } catch (error) {
    logError(error, 'TeamMembers');
    const { response, statusCode } = handleAPIError(error, '/api/team/members');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully',
    });
  } catch (error) {
    logError(error, 'TeamMembers');
    const { response, statusCode } = handleAPIError(error, '/api/team/members');
    return NextResponse.json(response, { status: statusCode });
  }
}
