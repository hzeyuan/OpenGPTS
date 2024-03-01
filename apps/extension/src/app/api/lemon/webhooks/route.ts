import { NextRequest, NextResponse } from "next/server";
const crypto = require("crypto");
import supabase from "~src/utils/supabase";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const headers = req.headers.get("X-Signature");
  const secret = process.env.NEXT_PUBLIC_LEMONSQUEEZY_WEBHOOKS;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const signature = Buffer.from(headers || "", "utf8");

  if (!crypto.timingSafeEqual(digest, signature)) {
    throw new Error("Invalid signature.");
  }
  const body = JSON.parse(rawBody);
  if (body?.meta.event_name === "order_created") {
    console.log("order_created");
  }
  if (body?.meta.event_name === "subscription_updated") {
    const email = body.data.attributes.user_email;
    const payment_status = body.data.attributes.status;
    const { data, error } = await supabase
      .from("user_subscription")
      .select("*")
      .eq("email", email);
    if (data?.length == 0) {
      const { error } = await supabase
        .from("user_subscription")
        .insert({ email, payment_status });
    } else {
      const { error } = await supabase
        .from("user_subscription")
        .update({ payment_status})
        .eq("email", email)
    }
  }
  if (body?.meta.event_name === "subscription_created") {
    console.log("subscription_created");
  }
  if (body?.meta.event_name === "subscription_payment_success") {
    console.log("subscription_payment_success");
  }

  return Response.json(rawBody);
}

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      name: string;
    };
  }
) {
  console.log("req", req.url);
  const { name } = params;
  console.log("123", req);
  return Response.json(req.url);
}
