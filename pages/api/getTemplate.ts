// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import templates from '../../templates/templates';

type Data = {
  data: any
}

const encoder = new TextEncoder();

async function getTemplate(fetchUrl: string,  socket: { enqueue: (v: any) => any }) {
    // const response = await fetch('http://localhost:3000/templates/simple_Landing_Page_Tailwind.html', {
    const response = await fetch(fetchUrl, {
        method: 'get',
        headers: new Headers({
            'Content-Type': 'text/html'
        })
    });
    const systemPrompt = await response.text();
    socket.enqueue(encoder.encode(`${JSON.stringify({ value: systemPrompt, type: 'setCode' })}\n`))
    return response;
}

export const runtime = 'edge';
export default async function handler(
  req: Request,
  res: NextApiResponse<Data>
) {

  if (req.method === 'POST') {
    const { data } = await req.json();
    const { id } = data;
    const { list } = templates;
    const template = list.find(template => template.id === id);
    try {
      const stream = new ReadableStream({
        start(controller) {
            // 初始化时可以进行的操作，例如设置计数器
            if (template) {
              getTemplate(template.fetchUrl, controller).finally(() => {
                controller.close();
              })
            }
        },
      });
  
      return new Response(stream);
    } catch(error) {
      console.log(error);
    }

  }
 


}
