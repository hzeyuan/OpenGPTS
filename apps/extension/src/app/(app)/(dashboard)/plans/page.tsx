"use client"
import type { UserAbilitiesRow } from "@opengpts/types";
import { Button, Divider, Popconfirm, Spin, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { useSessionContext } from "~src/app/context/SessionContext";
import { getUserAbilities } from "~src/app/services/user";
import Plans from "~src/components/plans"

const Page = () => {
    const { session } = useSessionContext()
    const [loading, setLoading] = useState<boolean>(false);
    const prevSubscription = useRef<UserAbilitiesRow>();
    const { subscription, setSubscription } = useSessionContext()
    const handleCancelSubscription = async () => {
        try {
            setLoading(true)
            await fetch('/api/lemon/fetchCancelSubscription', {
                method: 'POST',
                body: JSON.stringify({
                    subscription_id: subscription?.subscription_id
                })
            })
            fetchDataWithTimer()
        } catch (error) {
            message.error('error')
            setLoading(false)
        } finally {
        }
    }
    const handleResumeSubscription = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/lemon/fetchResumeSubscription', {
                method: 'POST',
                body: JSON.stringify({
                    subscription_id: subscription?.subscription_id
                })
            })
            fetchDataWithTimer()
        } catch (error) {
            message.error('error')
            setLoading(false)
        }

    }

    const fetchDataWithTimer = async () => {
        let count = 0;
        const intervalId = setInterval(async () => {
            try {
                if (!session?.user) return;
                const email = session?.user.email!
                const data = await getUserAbilities(email)
                count += 1; // 每次请求后增加时间
                if (count >= 10) {
                    clearInterval(intervalId);
                    throw new Error('请求超时');
                }
                if (prevSubscription?.current?.subscription_id === data.subscription_id) return;
                // 数据变化，清除计时器
                clearInterval(intervalId);
                setLoading(false)
                setSubscription(data)
            } catch (error) {
                console.error('请求失败:', error);
                clearInterval(intervalId);
                setLoading(false)
                // 请求失败也应当清除计时器

            }
        }, 2000); // 每2秒执行一次请求

    };

    useEffect(() => {
        prevSubscription.current = subscription;
    }, [subscription]);


    return (
        <div className="  py-[30px] flex-1  min-h-[800px]  px-16 ">
            <Spin spinning={loading}>
                <div className="section">
                    <h2 className='text-2xl font-bold'>billing</h2>
                    <Divider />
                    <div
                        title="当前计划："
                        style={{ maxWidth: 300 }}

                    >
                        {subscription?.subscription_status === 'active' ? (
                            <Popconfirm
                                title="cancel subscription"
                                description="Are you sure to cancel this subscription"
                                onConfirm={handleCancelSubscription}
                                // onCancel={cancel}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button>取消续订</Button>
                            </Popconfirm>

                        ) : (<Popconfirm
                            title="resume subsription"
                            description="Are you sure to resume this subscription?"
                            onConfirm={handleResumeSubscription}
                            // onCancel={cancel}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button>续订</Button>
                        </Popconfirm>)}

                        <div>
                            计划：
                        </div>
                        <div>
                            {subscription?.product_name}
                        </div>
                        <div>
                            {subscription?.variant_name}
                        </div>
                        <Divider />
                        <div>
                            状态：
                        </div>
                        <p>{subscription?.subscription_status}</p>
                        <Divider />
                    </div>
                    <Plans
                    />
                </div>
            </Spin>

        </div>
    )
}
export default Page