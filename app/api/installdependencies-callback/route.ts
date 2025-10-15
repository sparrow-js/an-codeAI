import { broadcast } from '@/utils/broadcast';


interface RequestBody {
  clientId: string;
  status: string;
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
    await broadcast(clientId, 'message', { 
      chatId: clientId,
      status: status,
      type: 'install'
    });

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