
"use client"
import { useState, useEffect } from 'react'
import './index.css'
import { useStorage } from "@plasmohq/storage/hook";
import type { ThemeMode } from '@opengpts/types'
import type { UserAbilities } from '@opengpts/types/user'
import { Settings2 } from "lucide-react";
import { Menu, Radio, Space, Divider, Button, type RadioChangeEvent, Popconfirm, Spin, message } from "antd";
import { useTranslation } from 'react-i18next';
import { useRootContext } from '~src/app/layout/DefaultLayout';
import ModeSelector from '~src/components/ModeSelector';
import { opengptsStorage } from '~src/store';
import {
    ProCard,
} from '@ant-design/pro-components';
import supabase from "~src/utils/supabase";
import { useSessionContext } from '~src/app/context/SessionContext';
import PricingPage from '../../(landing)/pricing/page';


const SettingsPage = () => {
    const { session } = useSessionContext()
    const { t, i18n } = useTranslation();
    const [activeKey, setActiveKey] = useState('general')
    const [userAbilities, setUserAbilities] = useState<UserAbilities>();
    const [tempData, setTempData] = useState<UserAbilities>();
    const [loading, setLoading] = useState<boolean>(false);

    const menus = [{
        key: 'general',
        label: t('General'),

    },
    {
        key: 'billing',
        label: t('Billing')
    }
    ]
    const { theme, setTheme } = useRootContext();
    const [language, setLanguage] = useStorage({
        key: "opengpts-language",
        instance: opengptsStorage
    }, 'en')

    useEffect(() => {
        fetchUserAbilities()
    }, [])
    async function fetchUserAbilities() {
        const tempdata = await getUserAbilities()
        setTempData(tempdata)
    }
    async function getUserAbilities() {
        if (session?.user) {
            const { data, error } = await supabase
                .from("user_abilities")
                .select("*")
                .eq("email", session?.user.email)
                .single();
            if (data) {
                setUserAbilities(data);
                return data
            }
        }

    }

    const handleChangeTheme = (e: RadioChangeEvent) => {
        const theme: ThemeMode = e.target.value;
        setTheme(theme)
    }

    const handleChangeLanguage = (e: RadioChangeEvent) => {
        i18n.changeLanguage(e.target.value);
        setLanguage(e.target.value)
    };
    const handleCancelSubscription = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/lemon/fetchCancelSubscription', {
                method: 'POST',
                body: JSON.stringify({
                    subscription_id: userAbilities?.subscription_id
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
                    subscription_id: userAbilities?.subscription_id
                })
            })
            fetchDataWithTimer()
        } catch (error) {
            message.error('error')
            setLoading(false)
        }

    }

    const fetchDataWithTimer = async () => {
        let totalTime = 0;
        const intervalId = setInterval(async () => {
            try {
                const data = await getUserAbilities()
                if (JSON.stringify(tempData) !== JSON.stringify(data)) {
                    // 数据变化，清除计时器
                    clearInterval(intervalId);
                    console.log('数据变化，停止请求');
                    setLoading(false)

                } else {
                    console.log('继续请求')
                }
                // 如果数据相同，不做任何操作，计时器会继续工作

                totalTime += 500; // 每次请求后增加时间
                if (totalTime >= 10000) {
                    // 达到10秒，清除计时器
                    clearInterval(intervalId);
                    console.log('10秒到了，停止请求');

                }
            } catch (error) {
                console.error('请求失败:', error);
                clearInterval(intervalId); // 请求失败也应当清除计时器

            } finally {
                setLoading(false)
            }
        }, 2000); // 每2秒执行一次请求

    };



    return (

        <main className="flex overflow-hidden option-page ">
            <div
                className="inner-container flex h-full  w-[1300px]   mb-0 "
            >
                <div className="menu-area card">
                    <div className="flex items-center px-5 py-2">
                        <Settings2 className='w-8 h-8' />
                        <div className="text-2xl font-semibold ms-2"><span style={{
                            fontSize: '20px',
                        }}>{t('Settings')}</span></div>
                    </div>
                    <Menu items={menus}
                        selectedKeys={[activeKey]}
                        onSelect={({ key }) => {
                            setActiveKey(key)
                        }}
                    ></Menu>
                </div>
                {activeKey == 'general' &&
                    <div className="option-area card px-[40px] py-[30px] flex-1  min-h-[800px]  ms-72 ">
                        <div className="section">
                            <h2 className='text-2xl font-bold'>{t('General')}</h2>
                            <Divider />
                            <div className="sub-section">
                                <h3 className='text-xl font-semibold '>{t('howToUse')}</h3>
                                <div className='content-box'>
                                    <div className="option-box">
                                        <ModeSelector />
                                    </div>
                                </div>
                            </div>
                            <Divider />
                            <div className="sub-section">
                                <h3 className='text-xl font-semibold'>{t('Theme')}</h3>
                                <div className='content-box'>
                                    <div className="option-box">
                                        <Radio.Group value={theme} onChange={handleChangeTheme}>
                                            <Space direction="vertical">
                                                <Radio value={'auto'}> <span className='text-base font-bold'>{t('Auto')}</span></Radio>
                                                <Radio value={'light'}><span className='text-base font-bold'>{t('Light')}</span></Radio>
                                                <Radio value={'dark'}><span className='text-base font-bold'> {t('Dark')}</span></Radio>
                                            </Space>
                                        </Radio.Group>
                                    </div>
                                </div>
                            </div>
                            <div className="sub-section">
                                <h3 className='text-xl font-semibold' >{t('Language')}</h3>
                                <div className='content-box'>
                                    <div className="option-box">
                                        <Radio.Group value={language} onChange={handleChangeLanguage}>
                                            <Space direction="vertical">
                                                <Radio value={'en'}><span className='text-base font-bold'>English</span></Radio>
                                                <Radio value={'zh'}><span className='text-base font-bold'>中文</span></Radio>
                                            </Space>
                                        </Radio.Group>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>}

                {activeKey == 'billing' &&
                    <div className="option-area card px-[40px] py-[30px] flex-1  min-h-[800px]  ms-72 ">
                        <Spin spinning={loading}>
                            <div className="section">
                                <h2 className='text-2xl font-bold'>billing</h2>
                                <Divider />
                                <ProCard
                                    title="当前计划："
                                    style={{ maxWidth: 300 }}
                                    boxShadow
                                >
                                    {userAbilities?.subscription_status === 'active' ? (
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
                                        {userAbilities?.product_name}
                                    </div>
                                    <div>
                                        {userAbilities?.variant_name}
                                    </div>
                                    <Divider />
                                    <div>
                                        状态：
                                    </div>
                                    <p>{userAbilities?.subscription_status}</p>
                                    <Divider />
                                </ProCard>
                                <PricingPage user={session?.user} />
                            </div>
                        </Spin>

                    </div>
                }


            </div>
        </main>
    )
}

export default SettingsPage;