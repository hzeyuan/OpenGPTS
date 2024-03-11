
import { NextRequest, NextResponse } from "next/server";
import { fetchCancelSubscription, fetchResumeSubscription, fetchChangeSubscription } from '~src/app/services/lemon'
export async function POST(req: NextRequest, { params }: {
    params: {
        name: string
    }
}) {
    const { name } = params
    if (!name) {
        return NextResponse.json({
            code: -1,
            message: 'subscription name is required'
        });
    }
    const { subscription_id, product_id, variant_id } = await req.json()
    if (!subscription_id) {
        return NextResponse.json({
            code: -1,
            message: 'subscription_id is required'
        });
    }
    let data;
    if (name === 'cancel') {
        data = await fetchCancelSubscription(subscription_id)
    }
    if (name === 'resume') {
        data = await fetchResumeSubscription(subscription_id)
    }
    if (name === 'change') {
        if (!product_id || !variant_id) {
            return NextResponse.json({
                code: -1,
                message: 'product_id and variant_id is required'
            });
        }
        data = await fetchChangeSubscription(subscription_id, product_id, variant_id)
    }

    return NextResponse.json({
        code: 0,
        message: 'success',
        data,
    });
}
