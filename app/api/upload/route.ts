import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export const runtime = "edge";

export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new Response("Missing BLOB_READ_WRITE_TOKEN. Don't forget to add that to your .env file.", {
      status: 401,
    });
  }

  const file = req.body || "";
  const filename =  `${uuidv4()}-${req.headers.get("x-vercel-filename")}` || `${uuidv4()}.png`;
  const contentType = req.headers.get("content-type") || "image/png";
  const fileType = `.${contentType.split("/")[1]}`;

  // construct final filename based on content-type if not provided
  const finalName = filename.includes(fileType) ? filename : `${filename}${fileType}`;
  const blob = await put(finalName, file, {
    contentType,
    access: "public",
  });

  return NextResponse.json(blob);
}
