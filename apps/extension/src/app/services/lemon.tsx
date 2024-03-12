
import supabase from "~src/utils/supabase";


/**
 * Fetches and cancels a subscription.
 * @param subscription_id - The ID of the subscription to cancel.
 * @returns The user abilities after the subscription is cancelled.
 */
export const fetchCancelSubscription = async (subscription_id: number) => {
    try {
        const api =
            process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL +
            `/subscriptions/${subscription_id}`;
        const key = "Bearer " + process.env.NEXT_PUBLIC_LEMONSQUEEZY_KEY;
        const response = await fetch(api, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/vnd.api+json",
                Accpet: "application/vnd.api+json",
                Authorization: key,
            },
        })
        const resData = await response.json()
        const { status, user_email: email } = resData.data.attributes
        const { data: UserAbilities, error } = await supabase.from("user_abilities").upsert(
            {
                email,
                subscription_status: status,
            },
            {
                onConflict: "email",
            }
        );
        if (error) {
            throw new Error("fetchCancelSubscription.upsert error");
        }
        return resData.data
    } catch (error) {
        throw new Error("fetchCancelSubscription error");
    }
}

export const fetchResumeSubscription = async (subscription_id: number) => {
    const data = {
        data: {
            type: "subscriptions",
            id: subscription_id.toString(),
            attributes: {
                cancelled: false
            }
        }
    }
    try {
        console.log('resume')
        const api =
            process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL +
            `/subscriptions/${subscription_id}`;
        const key = "Bearer " + process.env.NEXT_PUBLIC_LEMONSQUEEZY_KEY;
        const response = await fetch(api, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/vnd.api+json",
                Accpet: "application/vnd.api+json",
                Authorization: key,
            },
            body: JSON.stringify(data)
        })
        const resData = await response.json()
        const { status, user_email: email } = resData.data.attributes

        const { data: UserAbilities, error } = await supabase.from("user_abilities").upsert(
            {
                email,
                subscription_status: status,
            },
            {
                onConflict: "email",
            }
        );
        if (error) {
            throw new Error("fetchResumeSubscription.upsert error");
        }
        return resData.data
    } catch (error) {
        throw new Error("fetchResumeSubscription error");
    }
}

export const fetchChangeSubscription = async (subscription_id: number, product_id: number, variant_id: number) => {
    const data = {
        data: {
            type: "subscriptions",
            id: subscription_id.toString(),
            attributes: {
                product_id: product_id.toString(),
                variant_id: variant_id.toString(),
            }
        }
    }
    try {
        const api =
            process.env.NEXT_PUBLIC_LEMONSQUEEZY_URL +
            `/subscriptions/${subscription_id}`;
        const key = "Bearer " + process.env.NEXT_PUBLIC_LEMONSQUEEZY_KEY;
        const response = await fetch(api, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/vnd.api+json",
                Accpet: "application/vnd.api+json",
                Authorization: key,
            },
            body: JSON.stringify(data)
        })
        const resData = await response.json()
        const { status, user_email: email, variant_id, product_id, product_name, variant_name } = resData.data.attributes

        const { error } = await supabase.from("user_abilities").upsert(
            {
                email,
                subscription_status: status,
                variant_id,
                product_id,
                product_name,
                variant_name
            },
            {
                onConflict: "email",
            }
        );
        if (error) {
            throw new Error("fetchChangeSubscription.upsert error");
        }
        return resData.data

    } catch (error) {
        throw new Error("fetchChangeSubscription error");

    }
}
