
"use client"
import { useState } from 'react'
import './index.css'
import { useStorage } from "@plasmohq/storage/hook";
import type { ThemeMode } from '@opengpts/types'
import { Settings2 } from "lucide-react";
import { Menu, Radio, Space, Divider, Button, type RadioChangeEvent, Popconfirm, Spin, message } from "antd";
import { useTranslation } from 'react-i18next';
import { useRootContext } from '~src/app/layout/DefaultLayout';
import ModeSelector from '~src/components/ModeSelector';
import { opengptsStorage } from '~src/store';
import { useSessionContext } from '~src/app/context/SessionContext';


const SettingsPage = () => {
    const { session } = useSessionContext()
    const { t, i18n } = useTranslation();
    const [activeKey, setActiveKey] = useState('general')
    const [loading, setLoading] = useState<boolean>(false);

    const menus = [{
        key: 'general',
        label: t('General'),

    }
    ]
    const { theme, setTheme } = useRootContext();
    const [language, setLanguage] = useStorage({
        key: "opengpts-language",
        instance: opengptsStorage
    }, 'en')


    const handleChangeTheme = (e: RadioChangeEvent) => {
        const theme: ThemeMode = e.target.value;
        setTheme(theme)
    }

    const handleChangeLanguage = (e: RadioChangeEvent) => {
        i18n.changeLanguage(e.target.value);
        setLanguage(e.target.value)
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


            </div>
        </main>
    )
}

export default SettingsPage;