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
    recordUserSubscription(body);
  }
  //subscription_created
  if (body?.meta.event_name === "subscription_created") {
    const { status } = body.data.attributes;
    if (status === "active") {
      createUserAbilities(body);
    }
  }
  //subscription_updated
  if (body?.meta.event_name === "subscription_updated") {
    const { status } = body.data.attributes;
    //更新订阅
    updateSubscriptionStatus(body);
    //订阅信息记录
    recordUserSubscription(body);
  }
  if (body?.meta.event_name === "subscription_expired") {
    updateSubscriptionStatus(body);
  }
  //subscription_created
  if (body?.meta.event_name === "subscription_created") {
    recordUserSubscription(body);
  }
  //subscription_payment_success
  if (body?.meta.event_name === "subscription_payment_success") {
    recordUserSubscription(body);
  }

  return Response.json(rawBody);
}

async function updateSubscriptionStatus(body) {
  const {
    user_email: email,
    status,
    product_id,
    product_name,
    variant_id,
    variant_name,
    first_subscription_item
  } = body.data.attributes;
  
  const { data, error } = await supabase.from("user_abilities").upsert(
    {
      email,
      subscription_status: status,
      product_id,
      product_name,
      variant_id,
      variant_name,
      subscription_id: first_subscription_item.subscription_id,
    },
    {
      onConflict: "email",
    }
  );
}

async function createUserAbilities(body) {
  const {
    user_email: email,
    status,
    product_name,
    variant_name,
    product_id,
    variant_id,
    first_subscription_item,
  } = body.data.attributes;
  const { data: subscription_info, error: info_error } = await supabase
    .from("subscription")
    .select("*")
    .eq("product_id", product_id)
    .eq("variant_id", variant_id)
    .single();
  console.log("subscription_info", subscription_info);
  const { power } = subscription_info;

  const { data, error } = await supabase.from("user_abilities").upsert(
    {
      email,
      subscription_status: status,
      product_name,
      variant_name,
      product_id,
      variant_id,
      subscription_id: first_subscription_item.subscription_id,
      power,
    },
    {
      onConflict: "email",
    }
  );
}

async function recordUserSubscription(body) {
  const {
    user_email: email,
    status,
    product_name,
    variant_name,
  } = body.data.attributes;
  const event_name = body.meta.event_name;
  let subscription_type;
  switch (product_name) {
    case "monthly":
      subscription_type = "0";
      break;
    case "yearly":
      subscription_type = "1";
      break;
    default:
      break;
  }

  const { error } = await supabase.from("user_subscription").insert({
    event_name,
    email,
    subscription_type: subscription_type,
    subscription_name: variant_name,
    payment_status: status,
    status,
    details: body,
  });
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
