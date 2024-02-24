import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { clerkClient } from "@clerk/nextjs";
import { User } from "@/types/user";
import { genUuid } from "@/lib";
import { findUserByEmail, insertUser } from "@/models/user";
import { getUserCredits } from "@/service/order";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const user =  await clerkClient.users.getUser(userId);

  try {
    const email = user.emailAddresses[0].emailAddress;



    const user_credits = await getUserCredits(email);
    return res.status(200).json({ credits: user_credits });

  } catch (e) {
    console.log("get user info failed");
    return res.status(200).json({ error: 'get user info failed' });
  }
  // Load any data your application needs for the API route
}