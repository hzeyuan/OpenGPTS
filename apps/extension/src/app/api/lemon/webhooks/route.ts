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
  //order_created
  if (body?.meta.event_name === "order_created") {
    const { user_email: email, status } = body.data.attributes;
    const name = body.meta.event_name;
    const { error } = await supabase
      .from("subscription")
      .insert({ subscription_type: name, email, status, details: body });
  }
  //subscription_updated
  if (body?.meta.event_name === "subscription_updated") {
    const {
      status: payment_status,
      user_email: email,
      status,
    } = body.data.attributes;
    const name = body.meta.event_name;
    //查询用户并确认支付状态
    try {
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
          .update({ payment_status })
          .eq("email", email);
      }
    } catch (error) {
        console.log('error',error)
    }
    const { error } = await supabase
      .from("subscription")
      .insert({ subscription_type: name, email, status, details: body });
  }
  //subscription_created
  if (body?.meta.event_name === "subscription_created") {
    const { user_email: email, status } = body.data.attributes;
    const name = body.meta.event_name;
    const { error } = await supabase
      .from("subscription")
      .insert({ subscription_type: name, email, status, details: body });
  }
  //subscription_payment_success
  if (body?.meta.event_name === "subscription_payment_success") {
    const { user_email: email, status } = body.data.attributes;
    const name = body.meta.event_name;
    const { error } = await supabase
      .from("subscription")
      .insert({ subscription_type: name, email, status, details: body });
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
