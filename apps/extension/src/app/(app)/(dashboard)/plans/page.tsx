"use client";
import type { UserAbilitiesRow } from "@opengpts/types";
import { Button, Divider, Popconfirm, Spin, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { useSessionContext } from "~src/app/context/SessionContext";
import Plans from "~src/components/plans";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);
const now = dayjs();
// const targetTime = '2024-12-25T00:00:00';
// const target = dayjs(targetTime);
// const remainingTime = dayjs.duration(target.diff(now));
// const days = remainingTime.days();

const Page = () => {
    const { session } = useSessionContext();
    const [loading, setLoading] = useState<boolean>(false);
    const prevSubscription = useRef<UserAbilitiesRow>();
    const { subscription, setSubscription } = useSessionContext();
    const handleCancelSubscription = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/lemon/cancel", {
                method: "POST",
                body: JSON.stringify({
                    subscription_id: subscription?.subscription_id,
                }),
            });
            const resData = await res.json()
            const { status } = resData.data.attributes
            const { subscription_id } = resData.data.attributes.first_subscription_item

            if (!res.ok || resData.code !== 0) {
                message.error("fetchCancelSubscription error");
                return
            }
            setSubscription({
                subscription_status: status,
                subscription_id,
                ...resData.data.attributes
            })
            message.success("cancel subscription success")
        } catch (error) {
            message.error("error");
        } finally {
            setLoading(false);
        }
    };
    const handleResumeSubscription = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/lemon/resume", {
                method: "POST",
                body: JSON.stringify({
                    subscription_id: subscription?.subscription_id,
                }),
            });
            const resData = await res.json()
            const { status } = resData.data.attributes
            const { subscription_id } = resData.data.attributes.first_subscription_item

            if (!res.ok || resData.code !== 0) {
                message.error("fetchResumeSubscription error");
                return;
            }
            setSubscription({
                subscription_status: status,
                subscription_id,
                ...resData.data.attributes
            })
            message.success("resume subscription success")
        } catch (error) {
            message.error("error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        prevSubscription.current = subscription;
    }, [subscription]);

    return (
        <div className="  py-[30px] flex-1  min-h-[800px]  px-16 ">
            <Spin spinning={loading}>
                <div className="section">
                    <h2 className="mb-4 text-2xl font-bold">billing</h2>

                    <div className="flex flex-col w-full bg-white border border-gray-200 rounded-lg shadow-sm text-gray-950 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 sm:w-72">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <h3 className="text-xl font-semibold tracking-tight">Current plan:</h3>
                        </div>
                        <div className="flex flex-col items-center p-6 pt-0 grow">
                            <h2 className="text-3xl">😃</h2>
                            <h3 className="flex items-center mt-2 text-2xl text-color-accent">
                                <div className="mb-2">{subscription?.variant_name}</div>
                                {/* {subscription?.subscription_status} */}
                            </h3>
                            <h4 className="text-sm">Renews at:</h4>
                            <h4>{dayjs(subscription?.renews_at).format('YYYY-MM-DD HH:mm:ss')}</h4>
                            <h4 className="mt-4"> left: </h4>
                            <h4>months: {dayjs.duration(dayjs(subscription?.renews_at).diff(now)).months()}  days: {dayjs.duration(dayjs(subscription?.renews_at).diff(now)).days()}</h4>

                            {subscription?.downgrading ? <h4 className="mt-4"> downgrading </h4> : null}

                            {subscription?.subscription_status === "active" ? (
                                <Popconfirm
                                    className="mt-3"
                                    title="cancel subscription"
                                    description="Are you sure to cancel this subscription"
                                    onConfirm={handleCancelSubscription}
                                    // onCancel={cancel}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button>取消续订</Button>
                                </Popconfirm>
                            ) : (
                                <Popconfirm
                                    title="resume subsription"
                                    description="Are you sure to resume this subscription?"
                                    onConfirm={handleResumeSubscription}
                                    // onCancel={cancel}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button>续订</Button>
                                </Popconfirm>
                            )}

                        </div>
                        <div className="flex flex-col items-stretch p-6 pt-0 gap-y-2"></div>
                    </div>

                    <Plans />
                </div>
            </Spin>
        </div>
    );
};
export default Page;
