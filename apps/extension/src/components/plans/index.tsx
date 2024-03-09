"use client";
import { useState, useEffect, useMemo } from "react";
import styles from "./pricing.module.css";
import supabase from "~src/utils/supabase";
import { useRouter } from "next/navigation";
import { fetchChangeSubscription } from '~src/app/services/lemon'
import { sortBy } from 'lodash-es'
import { useSessionContext } from "~src/app/context/SessionContext";
import { cn } from "~src/utils"
import { Plan } from "./plan";
import type { PlanRow } from "@opengpts/types";
export interface PricingTierFrequency {
  id: string;
  value: string;
  label: string;
  priceSuffix: string;
  product_name: string;
}

// export interface PricingTier {
//   product_name: string;
//   variant_name: string;
//   id: string;
//   href: string;
//   discountPrice?: string | Record<string, string>;
//   price: string | Record<string, string>;
//   slug: string;
//   description: string | React.ReactNode;
//   features: string[];
//   featured?: boolean;
//   highlighted?: boolean;
//   cta?: string;
//   soldOut?: boolean;
//   variant_id: number;
//   product_id: number;
// }

export const PLAN_TYPES: PricingTierFrequency[] = [
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





const Plans: React.FC<{
  isUI?: boolean
}> = (props) => {
  const router = useRouter();
  const { session } = useSessionContext();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [plansType, setPlansType] = useState<'monthly' | 'yearly'>('monthly')
  const bannerText = "";
  const { subscription } = useSessionContext()


  useEffect(() => {
    //查看用户订阅状态
    //从lemonsqueezy获取产品列表
    // getProductList();
    //从数据库获取订阅列表
    getPlansList();
  }, [session?.user]);


  function handleClickPlan(plan: PlanRow) {
    const user = session?.user;
    if (!user) {
      router.push("/login");
      return;
    }
    if (props.isUI) {
      router.push("/plans");
      return
    }
    // handleChangeSubscription(tier)
    const isSubscribed = subscription?.subscription_status === 'active' || subscription?.subscription_status === 'cancelled'
    if (!isSubscribed) {
      let baseUrl = "https://usesless.lemonsqueezy.com/checkout/buy/" + plan.slug;
      const email = user.email;
      const url = new URL(baseUrl);
      if (email) url.searchParams.append("checkout[email]", email);
      router.push(url.toString());
      return
    }
  }


  async function getPlansList() {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
    if (data) {
      setPlans(data)
    }
  }

  const planList = useMemo(() => {
    return sortBy(plans?.filter(item => item.product_name === plansType), ['price'])
  }, [plans, plansType])


  return (
    <div
      className={cn("flex flex-col items-center", styles.fancyOverlay)}
    >
      <div className="flex flex-col items-center w-full">
        <div className="flex flex-col items-center w-full px-6 mx-auto max-w-7xl lg:px-8">
          {/* <div className="w-full max-w-4xl mx-auto lg:w-auto lg:text-center">
            <h1 className="text-black dark:text-white text-4xl font-semibold max-w-xs sm:max-w-none md:text-6xl !leading-tight">
              Pricing
            </h1>
          </div> */}

          {bannerText ? (
            <div className="flex justify-center w-full my-4 lg:w-auto">
              <p className="w-full px-4 py-3 text-xs text-black bg-slate-100 dark:bg-slate-300/30 dark:text-white/80 rounded-xl">
                {bannerText}
              </p>
            </div>
          ) : null}


          <div className="flex justify-center mt-16">
            <div
              role="radiogroup"
              className="grid p-1 text-xs font-semibold leading-5 text-center bg-white rounded-full gap-x-1 dark:bg-black ring-1 ring-inset ring-gray-200/30 dark:ring-gray-800"
              style={{
                gridTemplateColumns: `repeat(${PLAN_TYPES.length}, minmax(0, 1fr))`,
              }}
            >
              <p className="sr-only">Payment frequency</p>
              {PLAN_TYPES.map((option) => (
                <label
                  className={cn(
                    plansType === option.product_name
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
                    aria-checked={plansType === option.product_name}
                    onClick={() => setPlansType(option.product_name === 'monthly' ? 'monthly' : 'yearly')}
                  >
                    {option.label}
                  </button>
                </label>
              ))}
            </div>
          </div>


          <div className="w-full overflow-x-auto horizontal-scroll-container whitespace-nowrap">
            <div
              className={cn(
                "isolate flex mx-auto justify-center mt-4 mb-28 max-w-md gap-8 lg:mx-0 lg:max-w-none select-none",
              )}
            >
              {planList.map((plan) => (
                <Plan
                  key={plan.id}
                  plan={plan}
                  type={plansType}
                  subscription={subscription}
                  onClick={handleClickPlan}
                ></Plan>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


export default Plans;