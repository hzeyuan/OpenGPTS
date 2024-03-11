
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
        console.log('responese fetchCancelSubscription', await response.json())
        const data = await response.json()
        const { status, user_email: email } = data.attributes
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
            throw new Error("fetchCancelSubscription error");
        }
        return UserAbilities
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
        console.log('responese fetchResumeSubscription', await response.json())
        const resData = await response.json()
        const { status, user_email: email } = resData.attributes
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
            throw new Error("fetchResumeSubscription error");
        }
        return UserAbilities
    } catch (error) {
        throw new Error("fetchResumeSubscription error");
    }
}

export const fetchChangeSubscription = async (subscription_id: number, product_id: number, variant_id: number) => {
    console.log("subscription_id", subscription_id, product_id, variant_id)
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
        console.log('responese', response)
    } catch (error) {
        console.log('error', error)
    }
}
