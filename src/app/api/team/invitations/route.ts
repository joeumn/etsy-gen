import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/admin-client';
import { logError } from '@/lib/logger';
import { handleAPIError } from '@/lib/errors';
import crypto from 'crypto';

/**
 * Team Invitations API
 * Manages team member invitations
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamOwnerId, email, role } = body;

    if (!teamOwnerId || !email) {
      return NextResponse.json(
        { success: false, error: 'Team owner ID and email are required' },
        { status: 400 }
      );
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const { data, error } = await supabase
      .from('team_invitations')
      .insert({
        team_owner_id: teamOwnerId,
        email,
        role: role || 'member',
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // In a real implementation, send invitation email here
    // await sendInvitationEmail(email, token);

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      invitation: {
        id: data.id,
        email: data.email,
        token: data.token,
        expiresAt: data.expires_at,
      },
    });
  } catch (error) {
    logError(error, 'TeamInvitations');
    const { response, statusCode } = handleAPIError(error, '/api/team/invitations');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teamOwnerId = searchParams.get('teamOwnerId');
    const token = searchParams.get('token');

    if (token) {
      // Verify invitation by token
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .is('accepted_at', null)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired invitation' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        invitation: data,
      });
    }

    if (teamOwnerId) {
      // List all invitations for team owner
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('team_owner_id', teamOwnerId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        invitations: data || [],
      });
    }

    return NextResponse.json(
      { success: false, error: 'Team owner ID or token is required' },
      { status: 400 }
    );
  } catch (error) {
    logError(error, 'TeamInvitations');
    const { response, statusCode } = handleAPIError(error, '/api/team/invitations');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, memberUserId } = body;

    if (!token || !memberUserId) {
      return NextResponse.json(
        { success: false, error: 'Token and member user ID are required' },
        { status: 400 }
      );
    }

    // Get invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .is('accepted_at', null)
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invitation' },
        { status: 400 }
      );
    }

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from('team_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    if (updateError) {
      throw updateError;
    }

    // Add team member
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_owner_id: invitation.team_owner_id,
        member_user_id: memberUserId,
        role: invitation.role,
        is_active: true,
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (memberError) {
      throw memberError;
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      member,
    });
  } catch (error) {
    logError(error, 'TeamInvitations');
    const { response, statusCode } = handleAPIError(error, '/api/team/invitations');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const invitationId = searchParams.get('invitationId');

    if (!invitationId) {
      return NextResponse.json(
        { success: false, error: 'Invitation ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('team_invitations')
      .delete()
      .eq('id', invitationId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation cancelled successfully',
    });
  } catch (error) {
    logError(error, 'TeamInvitations');
    const { response, statusCode } = handleAPIError(error, '/api/team/invitations');
    return NextResponse.json(response, { status: statusCode });
  }
}
