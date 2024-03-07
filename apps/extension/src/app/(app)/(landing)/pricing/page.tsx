"use client";
import { useState, useEffect } from "react";
import styles from "./pricing.module.css";
import supabase from "~src/utils/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { fetchChangeSubscription } from '~src/app/services/lemon'
import type { UserAbilities } from '@opengpts/types/user'
import { Popconfirm } from "antd"
export interface PricingTierFrequency {
  id: string;
  value: string;
  label: string;
  priceSuffix: string;
  product_name: string;
}

export interface PricingTier {
  product_name: string;
  variant_name: string;
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
  variant_id: number;
  product_id: number;
}

export const frequencies: PricingTierFrequency[] = [
  {
    id: "1",
    value: "1",
    label: "Monthly",
    priceSuffix: "/month",
    product_name: "monthly",
  },
  {
    id: "2",
    value: "2",
    label: "Annually",
    priceSuffix: "/year",
    product_name: "yearly",
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
  const pathname = usePathname();

  const [frequency, setFrequency] = useState(frequencies[0]);
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [plans, setPlans] = useState<PricingTier[]>()
  const [products, setProducts] = useState<any>([]);
  const [userAbilities, setUserAbilities] = useState<UserAbilities>();
  const [tempData, setTempData] = useState<UserAbilities>();

  const bannerText = "";

  useEffect(() => {
    //查看用户订阅状态
    fetchUserAbilites()
    //从lemonsqueezy获取产品列表
    getProductList();
    //从数据库获取订阅列表
    getTiersList(frequency.product_name);
  }, [user]);

  async function fetchUserAbilites() {
    const data = await getUserAbilities()
    setTempData(data)
  }

  async function getUserAbilities() {
    const { data, error } = await supabase
      .from("user_abilities")
      .select("*")
      .eq("email", user?.email)
      .single();
    console.log("user abilities", data);
    if (data) {
      setUserAbilities(data);
      return data
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
      (obj: any) => obj.attributes.status === "published"
    );
    setProducts(list);
  }

  async function getTiersList(product_name: string) {
    const { data, error } = await supabase
      .from("subscription")
      .select("*")
    if (data) {
      setPlans(data)
      initialTier(data)
    }
  }
  function initialTier(data: PricingTier[]) {
    const order = ["basic", "standard", "pro"];
    const plans = data?.filter(item => item.product_name === 'monthly').sort((a, b) => {
      // 获取name值在order数组中的索引，并比较这些索引
      return order.indexOf(a.variant_name) - order.indexOf(b.variant_name);
    });
    setTiers(plans);

  }

  function setFrequencyFn(option: PricingTierFrequency) {
    setFrequency(
      frequencies.find((f) => f.value === option.value) as PricingTierFrequency
    );
    const order = ["basic", "standard", "pro"];
    const freqPlan = plans?.filter(item => item.product_name === option.product_name).sort((a, b) => {
      // 获取name值在order数组中的索引，并比较这些索引
      return order.indexOf(a.variant_name) - order.indexOf(b.variant_name);
    });
    setTiers(freqPlan)
  }

  function buyNowBtn(tier: PricingTier) {
    if (!user) {
      router.push("/login");
      return;
    } else {
      if (userAbilities) {
        if (pathname == '/settings') {
          console.log('change plane')
          handleChangeSubscription(tier)
        } else {
          router.push("/settings");
          return;
        }
      } else {
        let baseUrl =
          "https://usesless.lemonsqueezy.com/checkout/buy/" + tier.slug;
        const email = user.email;
        const url = new URL(baseUrl);
        if (email) url.searchParams.append("checkout[email]", email);
        router.push(url.toString());
      }
    }

  }

  const handleChangeSubscription = (tier: PricingTier) => {
    fetchChangeSubscription(userAbilities?.subscription_id, tier.product_id, tier.variant_id)
    fetchDataWithTimer()
  }

  const fetchDataWithTimer = async () => {
    let totalTime = 0;
    const intervalId = setInterval(async () => {
      try {
        const data = await getUserAbilities()
        if (JSON.stringify(tempData) !== JSON.stringify(data)) {
          // 数据变化，清除计时器
          clearInterval(intervalId);
          console.log('数据变化，停止请求');
        } else {
          console.log('继续请求')
        }
        // 如果数据相同，不做任何操作，计时器会继续工作

        totalTime += 500; // 每次请求后增加时间
        if (totalTime >= 10000) {
          // 达到10秒，清除计时器
          clearInterval(intervalId);
          console.log('10秒到了，停止请求');
        }
      } catch (error) {
        console.error('请求失败:', error);
        clearInterval(intervalId); // 请求失败也应当清除计时器
      }
    }, 2000); // 每2秒执行一次请求

   

  };
  function handleConfirm(tier: PricingTier) {
      buyNowBtn(tier)
  }

  return (
    <div
      className={cn("flex flex-col items-center", styles.fancyOverlay)}
    >
      <div className="w-full flex flex-col items-center">
        <div className="w-full mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-center">
          {/* <div className="w-full lg:w-auto mx-auto max-w-4xl lg:text-center">
            <h1 className="text-black dark:text-white text-4xl font-semibold max-w-xs sm:max-w-none md:text-6xl !leading-tight">
              Pricing
            </h1>
          </div> */}

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
          <div className="w-full horizontal-scroll-container overflow-x-auto whitespace-nowrap">
            <div
              className={cn(
                "isolate flex mx-auto mt-4 mb-28 max-w-md gap-8 lg:mx-0 lg:max-w-none select-none",
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
                    tier.highlighted ? styles.fancyGlassContrast : "",
                    "min-w-75"
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
                    {tier.variant_name}
                  </h3>
                  <p
                    className={cn(
                      tier.featured
                        ? "text-gray-300 dark:text-gray-500"
                        : "text-gray-600 dark:text-gray-400",
                      "mt-4 text-sm leading-6 whitespace-normal"
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
                        ? '$' + tier.price
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

                    {typeof tier.price == "string" ? (
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
                    {userAbilities && pathname === "/settings" ? (
                      <button
                        // onClick={() => buyNowBtn(tier)}
                        disabled={
                          userAbilities?.product_name == tier.product_name &&
                          userAbilities?.variant_name == tier.variant_name
                        }
                        className={cn(
                          "w-full inline-flex items-center justify-center font-medium ring-offset-background hover:opacity-80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-black dark:text-white h-12 rounded-md px-6 sm:px-10 text-md",
                          tier.featured || tier.soldOut ? "grayscale" : "",
                          !tier.highlighted && !tier.featured
                            ? "bg-gray-100 dark:bg-gray-600 border border-solid border-gray-300 dark:border-gray-800"
                            : "bg-slate-300/70 text-slate-foreground hover:bg-slate-400/70 dark:bg-slate-700 dark:hover:bg-slate-800/90",
                          tier.featured ? "!bg-gray-100 dark:!bg-black" : ""
                        )}
                      >
                        {userAbilities?.product_name == tier.product_name &&
                          userAbilities?.variant_name == tier.variant_name
                          ? "CURRENTT PLAN"
                          :
                          <Popconfirm
                            title="change subscription"
                            description="Are you sure to change this subscription"
                            onConfirm={() => handleConfirm(tier)}
                            // onCancel={cancel}
                            okText="Yes"
                            cancelText="No"
                          >
                            CHANGE PLAN
                          </Popconfirm>
                        }
                      </button>
                    ) : (
                      <button
                        onClick={() => buyNowBtn(tier)}
                        className={cn(
                          "w-full inline-flex items-center justify-center font-medium ring-offset-background hover:opacity-80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-black dark:text-white h-12 rounded-md px-6 sm:px-10 text-md",
                          tier.featured || tier.soldOut ? "grayscale" : "",
                          !tier.highlighted && !tier.featured
                            ? "bg-gray-100 dark:bg-gray-600 border border-solid border-gray-300 dark:border-gray-800"
                            : "bg-slate-300/70 text-slate-foreground hover:bg-slate-400/70 dark:bg-slate-700 dark:hover:bg-slate-800/90",
                          tier.featured ? "!bg-gray-100 dark:!bg-black" : ""
                        )}
                      >
                        Get started
                      </button>
                    )}
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
                      <li key={feature} className="flex gap-x-3 whitespace-normal">
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
    </div>
  );
}
