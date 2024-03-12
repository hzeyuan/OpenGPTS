import { NextRequest, NextResponse } from "next/server";
const crypto = require("crypto");
import supabase from "~src/utils/supabase";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

enum SubscriptionLevel {
  Basic = "basic",
  Standard = "standard",
  Pro = "pro",
}

const subscriptionLevels: Record<SubscriptionLevel, number> = {
  [SubscriptionLevel.Basic]: 1,
  [SubscriptionLevel.Standard]: 2,
  [SubscriptionLevel.Pro]: 3,
};

type ComparisonResult = "upgrade" | "downgrade" | "same";

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

async function updateSubscriptionStatus(body: {
  data: {
    attributes: {
      user_email: string;
      status: string;
      product_id: number;
      product_name: string;
      variant_id: number;
      variant_name: string;
      renews_at: string;
      first_subscription_item: any;
    };
  };
}) {
  const {
    user_email: email,
    status,
    product_id,
    product_name,
    variant_id,
    variant_name,
    renews_at,
    first_subscription_item,
  } = body.data.attributes;

  let update_data = {
    email,
    subscription_status: status,
    product_id,
    product_name,
    variant_id,
    variant_name,
    renews_at,
    subscription_id: first_subscription_item.subscription_id,
  };

  if (status === "active") {
    const { data: subscription_info, error: info_error } = await supabase
      .from("plans")
      .select("*")
      .eq("product_id", product_id)
      .eq("variant_id", variant_id)
      .single();
    if (info_error) {
      return NextResponse.json({
        message: "get subscription_info error",
        code: -1,
      });
    }
    const { data: user_info, error: user_error } = await supabase
      .from("user_abilities")
      .select("*")
      .eq("email", email)
      .single();

    if (user_error) {
      return NextResponse.json({
        message: "get user abilities error",
        code: -1,
      });
    }
    const { power } = subscription_info;
    // const { variant_name: user_variant_name } = user_info;
    const user_variant_name = user_info!.variant_name!;
    // user_info?.variant_name
    const result = compareSubscriptions(user_variant_name ,variant_name);
    if (result === "upgrade") {
      (update_data as any).power = power;
    }
    if (result === "downgrade") {
    }
  }

  const { data, error } = await supabase.from("user_abilities").upsert(
    {
      ...update_data,
    },
    {
      onConflict: "email",
    }
  );
}

async function createUserAbilities(body: {
  data: {
    attributes: {
      user_email: any;
      status: any;
      product_name: any;
      variant_name: any;
      product_id: any;
      variant_id: any;
      first_subscription_item: any;
    };
  };
}) {
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

async function recordUserSubscription(body: {
  data: {
    attributes: {
      user_email: any;
      status: any;
      product_name: any;
      variant_name: any;
    };
  };
  meta: { event_name: any };
}) {
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

  const { error } = await supabase.from("user_subscription_history").insert({
    event_name,
    email,
    subscription_type: subscription_type,
    subscription_name: variant_name,
    payment_status: status,
    status,
    details: body,
  });
  if (error) {
    console.log("error", error);
  }
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
  const { name } = params;
  return Response.json(req.url);
}

function compareSubscriptions(
  oldSubscription: SubscriptionLevel,
  newSubscription: SubscriptionLevel
): ComparisonResult {
  const oldLevel = subscriptionLevels[oldSubscription];
  const newLevel = subscriptionLevels[newSubscription];

  if (newLevel > oldLevel) {
    return "upgrade";
  } else if (newLevel < oldLevel) {
    return "downgrade";
  } else {
    return "same";
  }
}
