import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-helpers';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, username, name, role, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[v0] Users GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const updateData: Record<string, string> = {};

    if (body.name && typeof body.name === 'string' && body.name.trim().length > 0) {
      updateData.name = body.name.trim();
    }

    if (body.role && typeof body.role === 'string') {
      const validRoles = ['admin', 'manager', 'editor'];
      if (validRoles.includes(body.role)) {
        updateData.role = body.role;
      }
    }

    if (body.username && typeof body.username === 'string' && body.username.trim().length > 0) {
      const { data: duplicateUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('username', body.username.trim())
        .neq('id', userId)
        .single();

      if (duplicateUser) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      }

      updateData.username = body.username.trim();
    }

    if (body.password && typeof body.password === 'string' && body.password.length >= 6) {
      updateData.password_hash = await bcrypt.hash(body.password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', userId)
      .select('id, username, name, role, created_at')
      .single();

    if (error) throw error;

    return NextResponse.json(user);
  } catch (error) {
    console.error('[v0] Users PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    if (userId === auth.session.userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user sessions
    await supabase
      .from('sessions')
      .delete()
      .eq('user_id', userId)
      .eq('user_type', 'admin');

    // Delete user
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Users DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
