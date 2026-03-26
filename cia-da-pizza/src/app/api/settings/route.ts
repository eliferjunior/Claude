import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

type SettingRow = {
  key: string;
  value: string;
};

export async function GET() {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all() as SettingRow[];
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const upsert = db.prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    );

    if (Array.isArray(body)) {
      const updateMany = db.transaction(() => {
        for (const item of body) {
          if (item.key && item.value !== undefined) {
            upsert.run(item.key, String(item.value));
          }
        }
      });
      updateMany();
    } else if (body.key && body.value !== undefined) {
      upsert.run(body.key, String(body.value));
    } else {
      return NextResponse.json(
        { error: 'Formato inválido. Envie { key, value } ou um array de { key, value }.' },
        { status: 400 },
      );
    }

    const rows = db.prepare('SELECT key, value FROM settings').all() as SettingRow[];
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
