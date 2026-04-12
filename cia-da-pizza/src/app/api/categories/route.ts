import { NextRequest, NextResponse } from 'next/server';
import { dbAll, dbInsert, dbGet } from '@/lib/database';
import { requireAdminAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await dbAll('categories', { orderBy: 'order_position' });

    return NextResponse.json(categories);
  } catch (error) {
    // Error logged silently
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();

    const name = sanitizeString(body.name, 200);
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const orderPosition = Number.isFinite(body.order_position)
      ? Math.max(0, Math.min(body.order_position, 9999))
      : 0;

    const inserted = await dbInsert('categories', { name, order_position: orderPosition });

    const category = await dbGet('categories', { id: (inserted as { id: number }).id });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    // Error logged silently
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
