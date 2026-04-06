import { NextRequest, NextResponse } from 'next/server';
import { dbAll, dbUpsertSetting } from '@/lib/database';
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
    const rows = await dbAll<SettingRow>('settings');
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = requireAdminAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();

    if (Array.isArray(body)) {
      for (const item of body) {
        const key = sanitizeString(item.key, 100);
        if (key && ALLOWED_SETTING_KEYS.includes(key) && item.value !== undefined) {
          await dbUpsertSetting(key, String(item.value).slice(0, 1000));
        }
      }
    } else if (body.key && body.value !== undefined) {
      const key = sanitizeString(body.key, 100);
      if (!key || !ALLOWED_SETTING_KEYS.includes(key)) {
        return NextResponse.json({ error: 'Invalid or disallowed setting key.' }, { status: 400 });
      }
      await dbUpsertSetting(key, String(body.value).slice(0, 1000));
    } else {
      return NextResponse.json(
        { error: 'Formato inválido. Envie { key, value } ou um array de { key, value }.' },
        { status: 400 },
      );
    }

    const rows = await dbAll<SettingRow>('settings');
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
