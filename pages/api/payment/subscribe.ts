import { currentUser } from "@clerk/nextjs";
import { respData, respErr } from "@/lib/resp";
import {axios} from '@/lib/axios'
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { userId } = getAuth(req as any);
    if (!userId) {
      return respErr("not login");
    }

    const user =  await clerkClient.users.getUser(userId);

    const checkout = await axios.post(
        `${process.env.LEMON_SQUEEZY_HOST}/checkouts`,
        {  
          data: {
            type: "checkouts",
            attributes: { 
              checkout_data: { 
                custom: { 
                  email: user.emailAddresses[0].emailAddress, 
                  userId: user.id, 
                  username: user.firstName, 
                  type: 'single' 
                } 
              } 
            },
            relationships: {
              store: { 
                data: { 
                  type: "stores",
                   id: process.env.LEMON_SQUEEZY_STORE_ID 
                  } 
                },
              variant: { 
                data: { type: "variants", id: '255600' } },
            },
          }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
            Accept: 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
          }
        }
    );
    const {data} = checkout;
    return res.status(200).json(data.attributes);
  }
}