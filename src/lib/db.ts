// ============================================================
//  Supabase (Postgres) — сховище відповідей RSVP
//  Сайт лишається статичним; базу тримає Supabase.
//
//  ↓↓↓  ЗАМІНИ ці два рядки на дані зі свого проєкту:
//  Supabase → Project Settings → API → Project URL + anon public key
// ============================================================
const SUPABASE_URL = 'https://kiybgslbstvwukxmktwv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpeWJnc2xic3R2d3VreG1rdHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjA2ODgsImV4cCI6MjA5NjM5NjY4OH0.AyhyGkvX1hcyWqb36VJASjIJVyQzcyvxH4FIyDFVnRc';

export interface RsvpRow {
  code: string;
  guest_name: string;
  present: string;
  ceremony: string;
  updated_at?: string;
}

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

/** Зберегти/оновити відповідь гостя (upsert по первинному ключу `code`). */
export async function saveRsvp(row: RsvpRow): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rsvp`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    throw new Error(`saveRsvp failed: ${res.status} ${await res.text()}`);
  }
}

/** Прочитати відповідь одного гостя за кодом (null, якщо ще не відповідав). */
export async function fetchRsvp(code: string): Promise<RsvpRow | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/rsvp?code=eq.${encodeURIComponent(code)}&select=*`,
    { headers },
  );
  if (!res.ok) {
    throw new Error(`fetchRsvp failed: ${res.status} ${await res.text()}`);
  }
  const rows: RsvpRow[] = await res.json();
  return rows[0] ?? null;
}

/** Прочитати всі відповіді (для екрана адміна). */
export async function fetchAllRsvp(): Promise<RsvpRow[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/rsvp?select=*&order=updated_at.desc`,
    { headers },
  );
  if (!res.ok) {
    throw new Error(`fetchAllRsvp failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}
