import { createClient } from '@supabase/supabase-js';
import { withDb } from '@/db/edge-db';
import { deploy, temporaryStorage } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { pushFiles } from '@/utils/git/push-files';

const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;
const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL || '', NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

interface RequestBody {
  clientId: string;
  status: string;
  url?: string;
  event: string;
  // Additional fields for various events
  source_repo?: string;
  repo_name?: string;
  repo_url?: string;
  branch?: string;
  app_name?: string;
  app_url?: string;
  docker_image?: string;
  machine_count?: number;
  error?: string;
  timestamp: string;
}

interface ResponseData {
  success?: boolean;
  error?: string;
}

// Map event types to their corresponding status fields
const eventToStatusField: Record<string, string> = {
  'clone_repository': 'repoStatus',
  'create_repository': 'repoStatus',
  'push_repository': 'repoStatus',
  'create_fly_app': 'machineStatus',
  'deploy_fly_app': 'machineStatus',
  'scale_fly_app': 'machineStatus',
  'reset_wireguard': 'machineStatus',
  'sync_fly_machine': 'machineStatus',
};

export async function POST(req: Request) {
  const data = (await req.json()) as RequestBody;
  const { clientId, status, url, event, ...additionalData } = data;

  if (!clientId || !status) {
    return new Response(JSON.stringify({ error: `Missing clientId ${clientId} or status ${status}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Strip "app-" prefix from clientId for database operations if it exists
  const dbClientId = clientId.startsWith('app-') ? clientId.substring(4) : clientId;

  try {
    // Send real-time update via Supabase with all event data
    await supabase.channel(`private:${clientId}`).send({
      type: 'broadcast',
      event: 'startup',
      payload: {
        status,
        appId: clientId,
        url,
        event,
        ...additionalData
      },
    });

    // Get the corresponding status field for this event
    const statusField = eventToStatusField[event];
    if (event === 'push_repository' && status === 'pushed') {
      const temp = await withDb(db =>
        db.select()
          .from(temporaryStorage)
          .where(eq(temporaryStorage.key, dbClientId))
          .limit(1)
      );
      if (temp && temp.length > 0 && temp[0].value.files) {
        const res = await pushFiles({
          token: process.env.NEXT_PUBLIC_GITHUB_TOKEN || '',
          owner: 'wordixai',
          repo: `repo-${clientId.replace('app-', '')}`,
          files: temp[0].value.files,
          message: 'Initial push after repo created',
        });
        if (res.success) {
          // 可选：删除暂存
          await withDb(db =>
            db.delete(temporaryStorage)
              .where(eq(temporaryStorage.key, dbClientId))
          );
        }
      }
    }

    // Update deploy status in database with additional metadata
    await withDb(db => 
      db.update(deploy)
        .set({
          [statusField]: status,
          ...(url ? { url } : {}),
          metadata: {
            ...additionalData,
            lastEvent: event,
            lastEventTimestamp: additionalData.timestamp
          }
        })
        .where(eq(deploy.chatId, dbClientId))
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Startup callback failed:', error);
    return new Response(JSON.stringify({ error: 'Failed to process startup callback' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
