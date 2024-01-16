// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import templates from '../../templates/templates';

type Data = {
  data: any
}

export const runtime = 'edge';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log('******1111', req.query);
  const { id } = req.query;
  const { list } = templates;
  const template = list.find(template => template.id === id);
  console.log('******11', template?.fetchUrl);
  if (template) {
    console.log('******', template.fetchUrl);
    const response = await fetch('https://raw.githubusercontent.com/sparrow-js/ant-codeAI/accurate-output/templates/simple_Landing_Page_Tailwind.html', {
        method: 'get',
        headers: new Headers({
            'Content-Type': 'text/html'
        })
      });
      const systemPrompt = await response.text();
      res.status(200).json({
          data: JSON.stringify({ value: systemPrompt, type: 'setCode' })
      })
  }

  res.status(200).json({ 
    data: {}
  })
}
