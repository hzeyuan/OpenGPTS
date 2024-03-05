"use client";
import { useState, useEffect } from "react";
import styles from "./pricing.module.css";
import supabase from "~src/utils/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export interface PricingTierFrequency {
  id: string;
  value: string;
  label: string;
  priceSuffix: string;
  subscription_type: string;
}

export interface PricingTier {
  name: string;
  id: string;
  href: string;
  discountPrice?: string | Record<string, string>;
  price: string | Record<string, string>;
  slug: string;
  description: string | React.ReactNode;
  features: string[];
  featured?: boolean;
  highlighted?: boolean;
  cta?: string;
  soldOut?: boolean;
  subscription_type: string;
}

export const frequencies: PricingTierFrequency[] = [
  {
    id: "1",
    value: "1",
    label: "Monthly",
    priceSuffix: "/month",
    subscription_type: "0",
  },
  {
    id: "2",
    value: "2",
    label: "Annually",
    priceSuffix: "/year",
    subscription_type: "1",
  },
];

const CheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("w-6 h-6", className)}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const cn = (...args: Array<string | boolean | undefined | null>) =>
  args.filter(Boolean).join(" ");

export default function PricingPage({ user }: { user?: User }) {
  const router = useRouter();

  const [frequency, setFrequency] = useState(frequencies[0]);
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [products, setProducts] = useState<any>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<boolean>(false);

  const bannerText = "";

  useEffect(() => {
    //查看用户订阅状态
    getUserAbilities();
    //从lemonsqueezy获取产品列表
    getProductList();
    //从数据库获取订阅列表
    getTiersList(frequency.subscription_type);
  }, [user]);

  async function getUserAbilities() {
    const { data, error } = await supabase
      .from("user_abilities")
      .select("*")
      .eq("email", user?.email);
    console.log("user abilities", user?.email, data);
    if(data?.[0]?.subscription_status === 'active') {
      setSubscriptionStatus(true)
    }
  }

  async function getProductList() {
    const api =
      process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL +
      "/products?filter[store_id]=23099";
    const key = "Bearer " + process.env.NEXT_PUBLIC_LEMONSQUEEZY_KEY;
    const response = await fetch(api, {
      method: "GET",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Accpet: "application/vnd.api+json",
        Authorization: key,
      },
    }).catch((err) => {
      throw err;
    });
    const res = await response.json();
    const list = res.data.filter(
      (obj) => obj.attributes.status === "published"
    );
    setProducts(list);
  }

  async function getTiersList(subscription_type: string) {
    const { data, error } = await supabase
      .from("subscription")
      .select("*")
      .eq("subscription_type", subscription_type);

    const order = ["Basic", "Standard", "Pro"];
    const subscriptionPlans = data?.sort((a, b) => {
      // 获取name值在order数组中的索引，并比较这些索引
      return order.indexOf(a.name) - order.indexOf(b.name);
    });
    setTiers(subscriptionPlans);
  }

  function setFrequencyFn(option) {
    setFrequency(
      frequencies.find((f) => f.value === option.value) as PricingTierFrequency
    );
    getTiersList(option.subscription_type);
  }

  function buyNowBtn(tier: PricingTier) {
    if (!user) {
      router.push("/login");
      return;
    }

    let baseUrl = "https://usesless.lemonsqueezy.com/checkout/buy/" + tier.slug;
    const email = user.email;
    const url = new URL(baseUrl);
    if (email) url.searchParams.append("checkout[email]", email);
    router.push(url.toString());
  }

  return (
    <div
      className={cn("flex flex-col w-full items-center", styles.fancyOverlay)}
    >
      <div className="w-full flex flex-col items-center">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-center">
          <div className="w-full lg:w-auto mx-auto max-w-4xl lg:text-center">
            <h1 className="text-black dark:text-white text-4xl font-semibold max-w-xs sm:max-w-none md:text-6xl !leading-tight">
              Pricing
            </h1>
          </div>

          {bannerText ? (
            <div className="w-full lg:w-auto flex justify-center my-4">
              <p className="w-full px-4 py-3 text-xs bg-slate-100 text-black dark:bg-slate-300/30 dark:text-white/80 rounded-xl">
                {bannerText}
              </p>
            </div>
          ) : null}

          {frequencies.length > 1 ? (
            <div className="mt-16 flex justify-center">
              <div
                role="radiogroup"
                className="grid gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 bg-white dark:bg-black ring-1 ring-inset ring-gray-200/30 dark:ring-gray-800"
                style={{
                  gridTemplateColumns: `repeat(${frequencies.length}, minmax(0, 1fr))`,
                }}
              >
                <p className="sr-only">Payment frequency</p>
                {frequencies.map((option) => (
                  <label
                    className={cn(
                      frequency.value === option.value
                        ? "bg-slate-500/90 text-white dark:bg-slate-900/70 dark:text-white/70"
                        : "bg-transparent text-gray-500 hover:bg-slate-500/10",
                      "cursor-pointer rounded-full px-2.5 py-2 transition-all"
                    )}
                    key={option.value}
                    htmlFor={option.value}
                  >
                    {option.label}

                    <button
                      value={option.value}
                      id={option.value}
                      className="hidden"
                      role="radio"
                      aria-checked={frequency.value === option.value}
                      onClick={() => setFrequencyFn(option)}
                    >
                      {option.label}
                    </button>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-12" aria-hidden="true"></div>
          )}

          <div
            className={cn(
              "isolate mx-auto mt-4 mb-28 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none select-none",
              tiers.length === 2 ? "lg:grid-cols-2" : "",
              tiers.length === 3 ? "lg:grid-cols-3" : ""
            )}
          >
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={cn(
                  tier.featured
                    ? "!bg-gray-900 ring-gray-900 dark:!bg-gray-100 dark:ring-gray-100"
                    : "bg-white dark:bg-gray-900/80 ring-gray-300/70 dark:ring-gray-700",
                  "max-w-xs ring-1 rounded-3xl p-8 xl:p-10",
                  tier.highlighted ? styles.fancyGlassContrast : ""
                )}
              >
                <h3
                  id={tier.id}
                  className={cn(
                    tier.featured
                      ? "text-white dark:text-black"
                      : "text-black dark:text-white",
                    "text-2xl font-bold tracking-tight"
                  )}
                >
                  {tier.name}
                </h3>
                <p
                  className={cn(
                    tier.featured
                      ? "text-gray-300 dark:text-gray-500"
                      : "text-gray-600 dark:text-gray-400",
                    "mt-4 text-sm leading-6"
                  )}
                >
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span
                    className={cn(
                      tier.featured
                        ? "text-white dark:text-black"
                        : "text-black dark:text-white",
                      "text-4xl font-bold tracking-tight",
                      tier.discountPrice && tier.discountPrice[frequency.value]
                        ? "line-through"
                        : ""
                    )}
                  >
                    {typeof tier.price === "string"
                      ? tier.price
                      : tier.price[frequency.value]}
                  </span>

                  {/* <span
                    className={cn(
                      tier.featured ? 'text-white dark:text-black' : 'text-black dark:text-white',
                    )}
                  >
                    {typeof tier.discountPrice === 'string'
                      ? tier.discountPrice
                      : tier.discountPrice[frequency.value]}
                  </span> */}

                  {typeof tier.price !== "string" ? (
                    <span
                      className={cn(
                        tier.featured
                          ? "text-gray-300 dark:text-gray-500"
                          : "dark:text-gray-400 text-gray-600",
                        "text-sm font-semibold leading-6"
                      )}
                    >
                      {frequency.priceSuffix}
                    </span>
                  ) : null}
                </p>
                <a
                  href={tier.href}
                  aria-describedby={tier.id}
                  className={cn(
                    "flex mt-6 shadow-sm",
                    tier.soldOut ? "pointer-events-none" : ""
                  )}
                >
                  <button
                    onClick={() => buyNowBtn(tier)}
                    disabled={subscriptionStatus}
                    className={cn(
                      "w-full inline-flex items-center justify-center font-medium ring-offset-background hover:opacity-80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-black dark:text-white h-12 rounded-md px-6 sm:px-10 text-md",
                      tier.featured || tier.soldOut ? "grayscale" : "",
                      !tier.highlighted && !tier.featured
                        ? "bg-gray-100 dark:bg-gray-600 border border-solid border-gray-300 dark:border-gray-800"
                        : "bg-slate-300/70 text-slate-foreground hover:bg-slate-400/70 dark:bg-slate-700 dark:hover:bg-slate-800/90",
                      tier.featured ? "!bg-gray-100 dark:!bg-black" : ""
                    )}
                  >
                    BUY NOW
                  </button>
                </a>

                <ul
                  className={cn(
                    tier.featured
                      ? "text-gray-300 dark:text-gray-500"
                      : "text-gray-700 dark:text-gray-400",
                    "mt-8 space-y-3 text-sm leading-6 xl:mt-10"
                  )}
                >
                  {tier.features.feature.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon
                        className={cn(
                          tier.featured ? "text-white dark:text-black" : "",
                          tier.highlighted ? "text-slate-500" : "text-gray-500",

                          "h-6 w-5 flex-none"
                        )}
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
