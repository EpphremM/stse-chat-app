import "dotenv/config"
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const ID_RE = /^[a-zA-Z0-9_-]+$/;

export async function POST(req: Request) {
  const secret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  if (!secret || !cloudName || !apiKey) {

    console.log(secret, cloudName, apiKey)

    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as { purpose?: string; roomId?: string; userId?: string };
  let folder: string;

  if (b.purpose === "room" && typeof b.roomId === "string" && ID_RE.test(b.roomId)) {
    folder = `skychat/rooms/${b.roomId}`;
  } else if (
    b.purpose === "avatar" &&
    typeof b.userId === "string" &&
    ID_RE.test(b.userId)
  ) {
    folder = `skychat/avatars/${b.userId}`;
  } else {
    return NextResponse.json({ error: "Invalid purpose or id" }, { status: 400 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, secret);

  return NextResponse.json({
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
  });
}
