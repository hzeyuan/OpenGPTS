

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
        console.log('responese', response)
    } catch (error) {
        console.log('error', error)
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
        console.log('responese', response)
    } catch (error) {
        console.log('error', error)
    }
}

export const fetchChangeSubscription = async (subscription_id: number, product_id: number, variant_id: number) => {
    console.log("subscription_id",subscription_id,product_id,variant_id)
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
