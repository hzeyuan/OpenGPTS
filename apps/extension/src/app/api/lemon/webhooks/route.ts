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
  //subscription_updated
  if (body?.meta.event_name === "subscription_updated") {
    //查询用户创建能力表
    updateUserAbilities(body);
    //订阅信息记录
    recordUserSubscription(body);
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

async function updateUserAbilities(body) {
  const { user_email: email, status, product_name } = body.data.attributes;
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
  //订阅为激活状态时
  if (status === "active") {
    const { data: existingData, error } = await supabase
      .from("user_abilities")
      .upsert(
        {
          email,
          subscription_status: status,
          subscription_type,
        },
        {
          onConflict: "email",
        }
      )
      .select()
      .single();
    //更新次数
    if (existingData) {
      const newPower = existingData.power + 20; // 增加20
      console.log('newPower', newPower)
      const { data: updateData, error: updateError } = await supabase
        .from("user_abilities")
        .update({ power: newPower }) // 更新power字段
        .eq("email", email); // 确定更新哪条记录

      if (updateError) {
        console.error("更新power值时出错:", updateError);
      } else {
        console.log("成功更新power值", updateData);
      }
    } else {
      console.log("没有找到对应的记录");
    }
  }
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
