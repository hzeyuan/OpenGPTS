import React, { useEffect, useState } from "react"
// import logo from "data-base64:~assets/icon.png"
import { useStorage } from "@plasmohq/storage/hook"
import { useTranslation } from 'react-i18next';
import '../i18n.js';
import "./index.css"
import '../global.css'
import { opengptsStorage } from '~src/store';
import { ConfigProvider, theme as themeStyle, type RadioChangeEvent, Divider, Typography, Radio, Space, Menu } from "antd"
import ModeSelector from "~src/components/ModeSelector.jsx";
import useColorMode from "~src/hooks/useColorMode.jsx";
const { Title, Text } = Typography;
function IndexOptions() {
    const { t, i18n } = useTranslation();


    const { theme, setTheme } = useColorMode();

    const [language, setLanguage] = useStorage({
        key: "opengpts-language",
        instance: opengptsStorage,
    }, 'en')

    const [activeKey, setActiveKey] = useState('general')
    const menus = [{
        key: 'general',
        label: t('General'),
    },
    ]




    const handleChangeTheme = (e: RadioChangeEvent) => {
        setTheme(e.target.value)
    }

    const handleChangeLanguage = (e: RadioChangeEvent) => {
        i18n.changeLanguage(e.target.value);
        setLanguage(e.target.value)
    };



    useEffect(() => {
        i18n.changeLanguage(language);
    }, [])


    const renderArea = (key: string) => {
        switch (key) {
            case 'general':
                return (
                    <div className="section">
                        <Title level={2}>{t('General')}</Title>
                        <Divider />
                        <div className="sub-section">
                            <Title level={3}>{t('howToUse')}</Title>
                            <div className='content-box'>
                                <div className="option-box">
                                    <ModeSelector />
                                </div>
                            </div>
                        </div>

                        <Divider />
                        <div className="sub-section">
                            <Title level={3}>{t('Theme')}</Title>
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
                            <Title level={3}>{t('Language')}</Title>
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

                );
            default:
                return null;
        }
    }





    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-gpts-theme', 'dark');
        } else if (theme === 'light') {
            document.documentElement.setAttribute('data-gpts-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-gpts-theme');
        }

    }, [theme]);


    return (
        <ConfigProvider
            theme={{
                algorithm: theme === 'dark' ? themeStyle.darkAlgorithm : themeStyle.defaultAlgorithm,
                components: {
                    Input: {
                        colorBgContainer: 'var(--opengpts-option-card-bg-color)',
                        colorText: 'var(--opengpts-primary-text-color)'
                    },
                    Drawer: {
                    }
                }
            }}
        >
            <main className="flex overflow-hidden option-page ">
                <div
                    className="inner-container flex h-full overflow-y-auto w-[1200px]  mt-12  mx-auto mb-0 "
                >
                    <div className="menu-area card">
                        <div className="flex items-center px-5 py-2">
                            {/* <img className="w-8 h-8 logo" src={logo.toString()} alt="" /> */}
                            <div className="text-2xl font-semibold ms-2"><Text style={{
                                fontSize: '20px',
                            }}>OpenGPTS</Text></div>
                        </div>
                        <Menu items={menus}
                            selectedKeys={[activeKey]}
                            onSelect={({ key }) => {
                                setActiveKey(key)
                            }}
                        ></Menu>
                    </div>
                    <div className="option-area card px-[40px] py-[30px] flex-1  min-h-[800px]  ms-72 ">
                        <div className="section">
                            {renderArea(activeKey)}
                        </div>
                    </div>
                </div>
            </main>
        </ConfigProvider>

    )
}

export default IndexOptions
