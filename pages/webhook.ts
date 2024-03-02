import rawBody from "raw-body";
import { Readable } from "stream";
import { respData, respErr } from "@/lib/resp";
import crypto from "crypto";
import { NextResponse } from "next/server";
import {findOrderByIdentifier, insertOrder} from '@/models/order';
import {findUserByEmail} from '@/models/user';
import { buffer } from 'micro'
import type { NextApiResponse, NextApiRequest } from 'next'
export interface ResBody extends NextApiRequest {
  body: {
    meta: {
      event_name: 'order_created' | 'order_refunded'
      custom_data: {
        // this is where any custom checkout parameters will be accessible
        // details: https://docs.lemonsqueezy.com/api/checkouts#create-a-checkout
        userId: string
      }
    }
    data: {
      id: string
      attributes: {
        identifier: string
      }
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(request: ResBody, res: NextApiResponse) {
  if (request.method === 'POST') {
    console.log('webhook');
    const body = (await buffer(request)).toString('utf-8');
    const payload = JSON.parse(body.toString());
    const sigString = request.headers['x-signature'] as string;
    if (!sigString) {
        console.error(`Signature header not found`);
        return res.status(403).json({message: "Signature header not found"});
    }


    const secret = process.env.LEMONS_SQUEEZY_SIGNATURE_SECRET as string;
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(body).digest("hex"), "utf8");
    const signature = Buffer.from(request.headers['x-signature'] as string, 'utf8');


    // validate signature
    if (!crypto.timingSafeEqual(digest, signature)) {
        return res.status(403).json({
          message: "Invalid signature"
        });
    }

    const user_email = payload.meta.custom_data && payload.meta.custom_data.email || '';

    if (!user_email) {
      return res.status(403).json({ message: "No userId provided" });
    }
    const user = await findUserByEmail(user_email);
    if (!user) return res.status(403).json({ message: "Your account was not found" });
  

    const first_order_item = payload.data.attributes.first_order_item || null;

    if (first_order_item && first_order_item.variant_id === parseInt(process.env.LEMON_SQUEEZY_MEMBERSHIP_SINGLE_TIME_VARIANT_ID as string, 10)) {
      try {
        // Check if the webhook event was for this product or not
        if (
          first_order_item.product_id !==
          parseInt(process.env.LEMON_SQUEEZY_PRODUCT_ID as string, 10)
        ) {
          return res.status(403).json({ message: "Invalid product" });
        }

        switch (payload.meta.event_name) {
          case "order_created": {

            const identifier = payload.data.attributes.identifier;
            const order = await findOrderByIdentifier(identifier);

            const currentDate = new Date();
            const oneMonthLater = new Date(currentDate);
            oneMonthLater.setMonth(currentDate.getMonth() + 1);
        
            const expired_at = oneMonthLater.toISOString();
        
            if (!order) {
              const res = await insertOrder({
                order_no: first_order_item.order_id.toString(),
                identifier: identifier,
                created_at: payload.data.attributes.created_at,
                user_email: payload.meta.custom_data.email,
                expired_at: expired_at,
                order_status: payload.data.attributes.status,
                paied_at: payload.data.attributes.created_at,
                credits: 5,
                used_credits: 0,
                customer_id: payload.data.attributes.customer_id,
                variant_id: first_order_item.variant_id,
              });
              console.log('pay_success');
            }
            return res.status(200).json({received: true});
          }
          default: {
            return res.status(400).json({ message: 'event_name not support' });
          }
        }

        
      } catch(e) {
        console.log('single pay deal', e);
        return res.status(500).json({ message: 'single pay something wrong' });
      }
    }
    return res.status(200).json({received: true});
  }
   
}