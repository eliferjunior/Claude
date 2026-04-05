import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const STORE_SAFE_COLUMNS = 'id, name, address, phone, whatsapp, opening_hours, closing_hours, active, is_delivery, lat, lng, allows_delivery, allows_pickup, allows_reservation, allows_dine_in, whatsapp_number, whatsapp_message, login_username, max_reservations, max_reservation_guests, max_reservations_per_slot';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    let query = supabase
      .from('stores')
      .select(STORE_SAFE_COLUMNS)
      .order('name', { ascending: true });

    if (active) {
      query = query.eq('active', active === '1');
    }

    const { data: stores, error } = await query;

    if (error) throw error;

    return NextResponse.json(stores);
  } catch (error) {
    console.error('[v0] Stores GET error:', error);
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

    const { data: store, error } = await supabase
      .from('stores')
      .insert({
        name,
        address: sanitizeString(body.address, 500),
        phone: sanitizeString(body.phone, 30),
        whatsapp: sanitizeString(body.whatsapp, 30),
        opening_hours: sanitizeString(body.opening_hours, 10),
        closing_hours: sanitizeString(body.closing_hours, 10),
        is_delivery: body.is_delivery ?? false,
        lat: body.lat ?? null,
        lng: body.lng ?? null,
        allows_delivery: body.allows_delivery ?? true,
        allows_pickup: body.allows_pickup ?? true,
        allows_reservation: body.allows_reservation ?? true,
        allows_dine_in: body.allows_dine_in ?? true,
        whatsapp_number: sanitizeString(body.whatsapp_number, 30) ?? '',
        whatsapp_message: sanitizeString(body.whatsapp_message, 500) ?? 'Olá! Gostaria de fazer um pedido.',
      })
      .select(STORE_SAFE_COLUMNS)
      .single();

    if (error) throw error;

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error('[v0] Stores POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
