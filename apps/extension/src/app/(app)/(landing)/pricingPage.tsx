import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

type Product = {
  name: string;
  id: string;
  price_formatted: string;
  store_id: number;
  buy_now_url?: string;
  description: string;
  features: string[];
  bestDeal?: boolean;
  status: string;
};

const PricingPage = ({ user }: { user?: User }) => {
  const router = useRouter();
  const [tiers, setTiers] = useState<Product[]>([]);
  const [isStripePaymentLoading, setIsStripePaymentLoading] = useState<
    boolean | string
  >(false);

  useEffect(() => {
    const api =
      process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL +
      "/products?filter[store_id]=23099";
    const key = "Bearer " + process.env.NEXT_PUBLIC_LEMONSQUEEZY_KEY;
    getProductList(api, key);
  }, []);

  async function getProductList(api: string, key: string) {
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
    const products = res.data
      .map((item) => {
        return {
          id: item.id,
          name: item.attributes.name,
          store_id: item.attributes.store_id,
          buy_now_url: item.attributes.buy_now_url,
          price_formatted: item.attributes.price_formatted,
          bestDeal: true,
          status: item.attributes.status,
        };
      })
      .filter((obj) => obj.status === "published");
    setTiers(products);
  }

  async function handleBuyNowClick(item: Product) {
    if (!user) {
      router.push("/login");
      return;
    }
    console.log("user", user);
    const product = await getProductVariants(item.id);
    console.log('product', product.data[0].attributes.slug)
    //拼接checkout连接
    const baseUrl = new URL(
      `https://usesless.lemonsqueezy.com/checkout/buy/${product.data[0].attributes.slug}`
    );

    const email = user.email;

    const url = new URL(baseUrl);
    if (email) url.searchParams.append("checkout[email]", email);
    router.push(url.toString())

  }
  function createHeaders() {
    const headers = new Headers();
    headers.append("Accept", "application/vnd.api+json");
    headers.append("Content-Type", "application/vnd.api+json");
    headers.append(
      "Authorization",
      `Bearer ${process.env.NEXT_PUBLIC_LEMONSQUEEZY_KEY}`
    );
    return headers;
  }

  function createRequestOptions(method: string, headers: Headers): RequestInit {
    return {
      method,
      headers,
      redirect: "follow",
      cache: "no-store",
    };
  }
  async function getProductVariants(productId: string) {
    const url = `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL}/variants?filter[product_id]=${productId}`;
    const headers = createHeaders();
    const requestOptions = createRequestOptions("GET", headers);

    const response: Response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }


  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div id="pricing" className="mx-auto max-w-4xl text-center">
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            Pick your <span className="text-yellow-500">pricing</span>
          </h2>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-white">
          Stripe subscriptions and secure webhooks are built-in. Just add your
          Stripe Product IDs! Try it out below with test credit card number{" "}
          <span className="px-2 py-1 bg-gray-100 rounded-md text-gray-500">
            4242 4242 4242 4242 4242
          </span>
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 lg:gap-x-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col  ${
                tier.bestDeal ? "ring-2" : "ring-1 lg:mt-8"
              } grow justify-between rounded-3xl ring-gray-900/10 dark:ring-gray-100/10 overflow-hidden p-8 xl:p-10`}
            >
              {tier.bestDeal && (
                <div
                  className="absolute top-0 right-0 -z-10 w-full h-full transform-gpu blur-3xl"
                  aria-hidden="true"
                >
                  <div
                    className="absolute w-full h-full bg-gradient-to-br from-amber-400 to-purple-300 opacity-30 dark:opacity-50"
                    style={{
                      clipPath: "circle(670% at 50% 50%)",
                    }}
                  />
                </div>
              )}
              <div className="mb-8">
                <div className="flex items-center justify-between gap-x-4">
                  <h3
                    id={tier.id}
                    className="text-gray-900 text-lg font-semibold leading-8 dark:text-white"
                  >
                    {tier.name}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-white">
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1 dark:text-white">
                  <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {tier.price_formatted}
                  </span>
                  {/* <span className="text-sm font-semibold leading-6 text-gray-600 dark:text-white">
                    /month
                  </span> */}
                </p>
                {/* <ul
                  role="list"
                  className="mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-white"
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <AiFillCheckCircle className='h-6 w-5 flex-none text-yellow-500' aria-hidden='true' />
                      {feature}
                    </li>
                  ))}
                </ul> */}
              </div>
              {!!user ? (
                <a
                  onClick={() => handleBuyNowClick(tier)}
                  aria-describedby="manage-subscription"
                  className={`
                          ${
                            tier.id === "enterprise-tier"
                              ? "opacity-50 cursor-not-allowed"
                              : "opacity-100 cursor-pointer"
                          }
                          ${
                            tier.bestDeal
                              ? "bg-yellow-500 text-white hover:text-white shadow-sm hover:bg-yellow-400"
                              : "text-gray-600  ring-1 ring-inset ring-purple-200 hover:ring-purple-400"
                          }
                          'mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400'
                        `}
                >
                  {"BUY NOW"}
                </a>
              ) : (
                <button
                  onClick={() => handleBuyNowClick(tier)}
                  aria-describedby={tier.id}
                  className={`dark:text-white
                          ${
                            tier.id === "enterprise-tier"
                              ? "opacity-50 cursor-not-allowed"
                              : "opacity-100 cursor-pointer"
                          }
                          ${
                            tier.bestDeal
                              ? "bg-yellow-500 text-white hover:text-white shadow-sm hover:bg-yellow-400"
                              : "text-gray-600  ring-1 ring-inset ring-purple-200 hover:ring-purple-400"
                          }
                          ${
                            isStripePaymentLoading === tier.id
                              ? "cursor-wait"
                              : null
                          }
                          'mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400'
                        `}
                >
                  {tier.id === "enterprise-tier"
                    ? "Contact us"
                    : !!user
                    ? "Buy plan"
                    : "Log in to buy plan"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default PricingPage;
