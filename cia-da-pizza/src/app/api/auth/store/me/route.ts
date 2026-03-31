import { NextRequest, NextResponse } from 'next/server';
import { requireStoreAuth } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const auth = requireStoreAuth(request);
    if (auth.error) return auth.error;

    return NextResponse.json({
      store_id: auth.session.storeId,
      store_name: auth.session.storeName,
      username: auth.session.username,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
