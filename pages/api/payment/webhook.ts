import rawBody from "raw-body";
import { Readable } from "stream";
import { respData, respErr } from "@/lib/resp";
import crypto from "crypto";
import { NextResponse } from "next/server";
import {findOrderByIdentifier, insertOrder} from '@/models/order';
import {findUserByEmail} from '@/models/user';

export default async function handler(request: Request) {
  if (request.method === 'POST') {
    console.log('webhook');
    const body = await rawBody(Readable.from(Buffer.from(await request.text())));
    const payload = JSON.parse(body.toString());
    const sigString = request.headers.get("x-signature");
    if (!sigString) {
        console.error(`Signature header not found`);
        return respErr("Signature header not found");
    }

    const secret = process.env.LEMONS_SQUEEZY_SIGNATURE_SECRET as string;
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(body).digest("hex"), "utf8");
    const signature = Buffer.from(
      Array.isArray(sigString) ? sigString.join("") : sigString || "",
      "utf8"
    );

    // validate signature
    if (!crypto.timingSafeEqual(digest, signature)) {
        return respErr("Invalid signature");
    }

    const user_email = payload.meta.custom_data && payload.meta.custom_data.email || '';

    if (!user_email) {
      return NextResponse.json({ message: "No userId provided" }, { status: 403 });
    }
    const user = await findUserByEmail(user_email);

    if (!user) return NextResponse.json({ message: "Your account was not found" }, { status: 401 });
  

    const first_order_item = payload.data.attributes.first_order_item || null;

    if (first_order_item && first_order_item.variant_id === parseInt(process.env.LEMON_SQUEEZY_MEMBERSHIP_SINGLE_TIME_VARIANT_ID as string, 10)) {
      try {
        // Check if the webhook event was for this product or not
        if (
          first_order_item.product_id !==
          parseInt(process.env.LEMON_SQUEEZY_PRODUCT_ID as string, 10)
        ) {
          return NextResponse.json({ message: "Invalid product" }, { status: 403 });
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
            return NextResponse.json({ status: 200 });
          }
          default: {
            return NextResponse.json({ message: 'event_name not support' }, { status: 400 });
          }
        }

        
      } catch(e) {
        console.log('single pay deal', e);
        return NextResponse.json({ message: 'single pay something wrong' }, { status: 500 });
      }
    }
    return NextResponse.json({ status: 200 });
  }
   
}