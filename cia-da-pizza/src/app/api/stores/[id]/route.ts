import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAnyAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

const STORE_SAFE_COLUMNS = 'id, name, address, phone, whatsapp, opening_hours, closing_hours, active, is_delivery, lat, lng, allows_delivery, allows_pickup, allows_reservation, allows_dine_in, whatsapp_number, whatsapp_message, login_username, max_reservations, max_reservation_guests, max_reservations_per_slot';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAnyAuth(request);
    if (auth.error) return auth.error;

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);

    const { data: store, error } = await supabase
      .from('stores')
      .select(STORE_SAFE_COLUMNS)
      .eq('id', id)
      .single();

    if (error || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Store users can only get their own store
    if (auth.session.type === 'store' && auth.session.store.storeId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error('[v0] Stores GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAnyAuth(request);
    if (auth.error) return auth.error;

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);

    // Store users can only update their own store
    if (auth.session.type === 'store' && auth.session.store.storeId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const { data: existing, error: existingError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = sanitizeString(body.name, 200);
    if (body.address !== undefined) updateData.address = sanitizeString(body.address, 500);
    if (body.phone !== undefined) updateData.phone = sanitizeString(body.phone, 30);
    if (body.whatsapp !== undefined) updateData.whatsapp = sanitizeString(body.whatsapp, 30);
    if (body.opening_hours !== undefined) updateData.opening_hours = sanitizeString(body.opening_hours, 10);
    if (body.closing_hours !== undefined) updateData.closing_hours = sanitizeString(body.closing_hours, 10);
    if (body.active !== undefined) updateData.active = Boolean(body.active);
    if (body.is_delivery !== undefined) updateData.is_delivery = Boolean(body.is_delivery);
    if (body.lat !== undefined) updateData.lat = body.lat;
    if (body.lng !== undefined) updateData.lng = body.lng;
    if (body.allows_delivery !== undefined) updateData.allows_delivery = Boolean(body.allows_delivery);
    if (body.allows_pickup !== undefined) updateData.allows_pickup = Boolean(body.allows_pickup);
    if (body.allows_reservation !== undefined) updateData.allows_reservation = Boolean(body.allows_reservation);
    if (body.allows_dine_in !== undefined) updateData.allows_dine_in = Boolean(body.allows_dine_in);
    if (body.whatsapp_number !== undefined) updateData.whatsapp_number = sanitizeString(body.whatsapp_number, 30);
    if (body.whatsapp_message !== undefined) updateData.whatsapp_message = sanitizeString(body.whatsapp_message, 500);
    if (Number.isFinite(body.max_reservations)) updateData.max_reservations = body.max_reservations;
    if (Number.isFinite(body.max_reservation_guests)) updateData.max_reservation_guests = body.max_reservation_guests;

    const { data: store, error } = await supabase
      .from('stores')
      .update(updateData)
      .eq('id', id)
      .select(STORE_SAFE_COLUMNS)
      .single();

    if (error) throw error;

    return NextResponse.json(store);
  } catch (error) {
    console.error('[v0] Stores PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
