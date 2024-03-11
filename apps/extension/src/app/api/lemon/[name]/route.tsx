
import { NextRequest, NextResponse } from "next/server";
import { fetchCancelSubscription, fetchResumeSubscription, fetchChangeSubscription } from '~src/app/services/lemon'
export async function POST(req: NextRequest, { params }: {
    params: {
        name: string
    }
}) {
    const { name } = params
    const data = await req.json()
    if(name === 'fetchCancelSubscription') {
         fetchCancelSubscription(data.subscription_id)
    }
    if(name === 'fetchResumeSubscription') {
        fetchResumeSubscription(data.subscription_id)
    }
    if(name === 'fetchChangeSubscription') {
        fetchChangeSubscription(data.subscription_id,data.product_id, data.variant_id)
    }
    if (!name) {
        return NextResponse.json({
            code: -1,
            message: 'subscription name is required'
        });
    }
    return NextResponse.json({
        code: 0,
        message: 'success',
    });
}
