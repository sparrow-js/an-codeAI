import { createClient } from '@supabase/supabase-js';
import { withDb } from '@/db/edge-db';
import { deploy } from '@/db/schema';
import { eq } from 'drizzle-orm';

const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;
const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL || '', NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

interface RequestBody {
  clientId: string;
  status: string;
}

interface ResponseData {
  success?: boolean;
  error?: string;
}

export async function POST(req: Request) {
  const { clientId, status } = (await req.json()) as RequestBody;

  if (!clientId || !status) {
    return new Response(JSON.stringify({ error: `Missing clientId ${clientId} or status ${status}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await supabase.channel(`private:${clientId}`).send({
      type: 'broadcast',
      event: 'message',
      payload: { status, appId: clientId },
    });

    await withDb(db => 
      db.update(deploy).set({ hostingStatus: status }).where(eq(deploy.chatId, clientId))
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('推送失败:', error);
    return new Response(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}