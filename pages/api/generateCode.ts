// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { streamGenerateCode } from '../../service/events/generateCode';

type Data = {
  name: string
}
export const runtime = 'edge';
export default async function handler(req: Request) {
    if (req.method === 'POST') {
        try {
            const { data } = await req.json();
            const stream = new ReadableStream({
                start(controller) {
                    // 初始化时可以进行的操作，例如设置计数器
                    streamGenerateCode(data, controller).finally(() => {
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
