
"use client"
import { useState, useEffect } from 'react'
import './index.css'
import { useStorage } from "@plasmohq/storage/hook";
import type { ThemeMode } from '@opengpts/types'
import type { UserAbilities } from '@opengpts/types/user'
import { Settings2 } from "lucide-react";
import { Menu, Radio, Space, Divider, Button, type RadioChangeEvent } from "antd";
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
import { fetchCancelSubscription, fetchResumeSubscription } from '~src/app/services/lemon'


const SettingsPage = () => {
    const { session } = useSessionContext()
    const { t, i18n } = useTranslation();
    const [activeKey, setActiveKey] = useState('general')
    const [userAbilities, setUserAbilities] = useState<UserAbilities>();
    const menus = [{
        key: 'general',
        label: t('General'),

    },
    {
        key: 'billing',
        label: 'billing'
    }
    ]
    const { theme, setTheme } = useRootContext();
    const [language, setLanguage] = useStorage({
        key: "opengpts-language",
        instance: opengptsStorage
    }, 'en')

    useEffect(() => {
        getUserAbilities()
    }, [])

    async function getUserAbilities() {
        if (session?.user) {
            const { data, error } = await supabase
                .from("user_abilities")
                .select("*")
                .eq("email", session?.user.email)
                .single();
            console.log("user abilities", data);
            if (data) {
                setUserAbilities(data);
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
    const handleCancelSubscription = () => {
        fetchCancelSubscription(userAbilities?.subscription_id)
    }
    const handleResumeSubscription = () => {
        fetchResumeSubscription(userAbilities?.subscription_id)
    }

    

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
                        <div className="section">
                            <h2 className='text-2xl font-bold'>billing</h2>
                            <Divider />
                            <ProCard
                                title="当前计划："
                                style={{ maxWidth: 300 }}
                                boxShadow
                            >
                                {userAbilities?.subscription_status === 'active' ? (<Button
                                    onClick={() => {
                                        handleCancelSubscription()
                                    }}
                                >取消续订</Button>) : (<Button
                                    onClick={() => {
                                        handleResumeSubscription()
                                    }}
                                >续订</Button>)}

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
                    </div>
                }


            </div>
        </main>
    )
}

export default SettingsPage;