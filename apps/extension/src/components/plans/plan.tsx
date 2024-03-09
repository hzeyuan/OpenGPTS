import { cn } from "~src/utils"
import styles from "./pricing.module.css";
import type { PlanRow, UserAbilitiesRow } from "@opengpts/types";
import {Check} from 'lucide-react'


export const Plan: React.FC<{
    plan: PlanRow,
    subscription?: UserAbilitiesRow,
    type: 'monthly' | 'yearly',
    onClick: (plan: PlanRow) => void
}> = ({ plan, subscription, type, onClick }) => {


    const features = (plan.features as any).feature;

    return (
        <div
            key={plan.id}
            className={cn(
                plan.featured
                    ? "!bg-gray-900 ring-gray-900 dark:!bg-gray-100 dark:ring-gray-100"
                    : "bg-white dark:bg-gray-900/80 ring-gray-300/70 dark:ring-gray-700",
                "max-w-xs ring-1 rounded-3xl p-8 xl:p-10",
                plan.highlighted ? styles.fancyGlassContrast : "",
                "min-w-75"
            )}
        >
            <h3
                className={cn(
                    plan.featured
                        ? "text-white dark:text-black"
                        : "text-black dark:text-white",
                    "text-2xl font-bold tracking-tight"
                )}
            >
                {plan.variant_name}
            </h3>
            <p
                className={cn(
                    plan.featured
                        ? "text-gray-300 dark:text-gray-500"
                        : "text-gray-600 dark:text-gray-400",
                    "mt-4 text-sm leading-6 whitespace-normal"
                )}
            >
                {plan.description}
            </p>
            <p className="flex items-baseline mt-6 gap-x-1">
                <span
                    className={cn(
                        plan.featured
                            ? "text-white dark:text-black"
                            : "text-black dark:text-white",
                        "text-4xl font-bold tracking-tight ",
                        // plan.discountPrice === plan.price
                        //     ? "line-through"
                        //     : ""
                    )}
                >
                    ${plan?.price}
                </span>
                <span
                    className={cn(
                        plan.featured
                            ? "text-gray-300 dark:text-gray-500"
                            : "dark:text-gray-400 text-gray-600",
                        "text-sm font-semibold leading-6"
                    )}
                >
                    {type === 'monthly' ? '/month' : '/year'}
                </span>

            </p>
            <a
                className={cn(
                    "flex mt-6 shadow-sm",
                    // plan.soldOut ? "pointer-events-none" : ""
                )}
            >
                <button
                    onClick={() => onClick(plan)}
                    disabled={subscription?.variant_id === plan.variant_id}
                    className={cn(
                        'cursor-pointer',                        
                        "w-full inline-flex items-center justify-center font-medium ring-offset-background hover:opacity-80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-black dark:text-white h-12 rounded-md px-6 sm:px-10 text-md",
                        // plan.featured || plan.soldOut ? "grayscale" : "",
                        !plan.highlighted && !plan.featured
                            ? "bg-gray-100 dark:bg-gray-600 border border-solid border-gray-300 dark:border-gray-800"
                            : "bg-slate-300/70 text-slate-foreground hover:bg-slate-400/70 dark:bg-slate-700 dark:hover:bg-slate-800/90",
                        plan.featured ? "!bg-gray-100 dark:!bg-black" : ""
                    )}
                >
                    {subscription?.variant_id === plan.variant_id
                        ? "Current plan"
                        :
                        <span>Get Started</span>
                    }
                </button>

            </a>

            <ul
                className={cn(
                    plan.featured
                        ? "text-gray-300 dark:text-gray-500"
                        : "text-gray-700 dark:text-gray-400",
                    "mt-8 space-y-3 text-sm leading-6 xl:mt-10"
                )}
            >
                {features?.map((feature: string) => (
                    <li key={feature} className="flex whitespace-normal gap-x-3">
                        <Check />
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    )
}