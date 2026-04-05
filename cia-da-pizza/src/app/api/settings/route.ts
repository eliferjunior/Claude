import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth-helpers';
import { sanitizeString } from '@/lib/auth';

type SettingRow = {
  key: string;
  value: string;
};

// Allowlist of setting keys that can be modified
const ALLOWED_SETTING_KEYS = [
  'whatsapp_enabled',
  'whatsapp_number',
  'whatsapp_default_message',
  'company_name',
  'company_logo_url',
  'company_instagram',
  'company_facebook',
  'primary_color',
  'secondary_color',
  'delivery_fee',
];

export async function GET() {
  try {
    const { data: rows, error } = await supabase
      .from('settings')
      .select('key, value');

    if (error) throw error;

    const settings: Record<string, string> = {};
    for (const row of (rows as SettingRow[]) || []) {
      settings[row.key] = row.value;
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('[v0] Settings GET error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();

    if (Array.isArray(body)) {
      for (const item of body) {
        const key = sanitizeString(item.key, 100);
        if (key && ALLOWED_SETTING_KEYS.includes(key) && item.value !== undefined) {
          await supabase
            .from('settings')
            .upsert({ key, value: String(item.value).slice(0, 1000) }, { onConflict: 'key' });
        }
      }
    } else if (body.key && body.value !== undefined) {
      const key = sanitizeString(body.key, 100);
      if (!key || !ALLOWED_SETTING_KEYS.includes(key)) {
        return NextResponse.json({ error: 'Invalid or disallowed setting key.' }, { status: 400 });
      }
      await supabase
        .from('settings')
        .upsert({ key, value: String(body.value).slice(0, 1000) }, { onConflict: 'key' });
    } else {
      return NextResponse.json(
        { error: 'Formato inválido. Envie { key, value } ou um array de { key, value }.' },
        { status: 400 },
      );
    }

    const { data: rows, error } = await supabase
      .from('settings')
      .select('key, value');

    if (error) throw error;

    const settings: Record<string, string> = {};
    for (const row of (rows as SettingRow[]) || []) {
      settings[row.key] = row.value;
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('[v0] Settings PUT error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
