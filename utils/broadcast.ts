import { createClient } from '@supabase/supabase-js';


const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;
const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL || '', NEXT_PUBLIC_SUPABASE_ANON_KEY || '');



export const broadcast = async (clientId: string, event: string , payload: any) => {
  await supabase.channel(`private:${clientId}`).send({
    type: 'broadcast',
    event: event,
    payload: payload,
  });
};
