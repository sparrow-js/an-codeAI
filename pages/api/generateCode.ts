// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { streamGenerateCode } from '../../service/events/generateCode';
import absoluteUrl from 'next-absolute-url'
import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs";


type Data = {
  name: string
}
export const runtime = 'edge';
export default async function handler(req: Request) {
    if (req.method === 'POST') {
        const { userId, user } = getAuth(req as any);

        let user_email = '';
        if (userId) {
            const user =  await clerkClient.users.getUser(userId);
            user_email = user.emailAddresses[0].emailAddress;
        }
        try {
            const { data } = await req.json();
            const stream = new ReadableStream({
                start(controller) {
                    // 初始化时可以进行的操作，例如设置计数器
                    streamGenerateCode(data, controller, user_email).finally(() => {
                        controller.close();
                    });
                },
            });

            return new Response(stream);
        } catch (error) {
            console.log(error);
        }
    }
}
