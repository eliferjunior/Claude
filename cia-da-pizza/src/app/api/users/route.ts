import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-helpers';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) return auth.error;

    const { data: users, error } = await supabase
      .from('admin_users')
      .select('id, username, name, role, created_at')
      .order('id', { ascending: true });

    if (error) throw error;

    return NextResponse.json(users);
  } catch (error) {
    console.error('[v0] Users GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { username, password, name, role } = body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password is required and must be at least 6 characters' },
        { status: 400 },
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const validRoles = ['admin', 'manager', 'editor'];
    const userRole = role && validRoles.includes(role) ? role : 'admin';

    const { data: existing } = await supabase
      .from('admin_users')
      .select('id')
      .eq('username', username.trim())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('admin_users')
      .insert({
        username: username.trim(),
        password_hash: passwordHash,
        name: name.trim(),
        role: userRole,
      })
      .select('id, username, name, role, created_at')
      .single();

    if (error) throw error;

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('[v0] Users POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
