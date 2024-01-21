import '~/src/i18n.js';
import "./index.css"
import '../base.css'
import logo from "data-base64:~assets/icon.png"
import chatTabIcon from '~assets/chat-tab.svg'
import { motion } from 'framer-motion';
import { useState, useEffect } from "react"
import { Tabs, Tab, TabList, TabPanel } from 'react-tabs';

import { StyleProvider } from "@ant-design/cssinjs"
import { ConfigProvider, theme as themeStyle } from "antd"
import { useMessage } from "@plasmohq/messaging/hook";
import { useStorage } from "@plasmohq/storage/hook";
import { Storage } from "@plasmohq/storage";
import type { ThemeMode } from "~index";
import { useTranslation } from 'react-i18next';
import GPTsCreatorPanel from '~src/components/GPTsCreatorPanel';
import settingIcon from '~assets/settings.svg';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';


const shakeAnimation = {
    scale: 0.85,
    rotate: [0, 5, -5, 5, -5, 0], // 这里的数值可以根据需要调整以实现不同程度的抖动
    transition: {
        duration: 0.2
    }
};


function IndexSidePanel() {

    const [tabIndex, setTabIndex] = useState(0);
    const { t, i18n } = useTranslation();


    const [theme] = useStorage<ThemeMode>({
        key: "theme",
        instance: new Storage({
            area: "local"
        }),

    }, 'auto')

    const [language] = useStorage({
        key: "language",
        instance: new Storage({
            area: "local"
        })
    }, 'en')



    useMessage<string, string>(async (req, res) => {
        console.log('name', req.name)
        if (req.name === 'onTabUpdated') {
            const data = req.body as unknown as {
                tab: chrome.tabs.Tab
            }
            setTabs((prevTabs) => prevTabs.map((tab) => {
                if (tab.index === 1 && data.tab?.favIconUrl) {
                    return {
                        ...tab,
                        icon: data.tab.favIconUrl
                    }
                }
                return tab;
            })
            );
        }
    })
    const [tabs, setTabs] = useState([
        {
            index: 0,
            title: 'chatBot',
            content: '你可以随时和我聊天',
            icon: chatTabIcon,
            panel: <GPTsCreatorPanel />
        },
    ])


    const handleSetting = () => {
        chrome.runtime.openOptionsPage()
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

    useEffect(() => {
        console.log('language', language)
        i18n?.changeLanguage(language)
    }, [])

    useEffect(() => {
        console.log("切换语言", language)
        i18n?.changeLanguage(language)
    }, [language])


    return (

        <ConfigProvider
            theme={{
                algorithm: theme === 'dark' ? themeStyle.darkAlgorithm : themeStyle.defaultAlgorithm,
                components: {
                    Input: {
                        colorBgContainer: 'var(--opengpts-option-card-bg-color)',
                        colorText: 'var(--opengpts-primary-text-color)'
                    }
                }
            }}
            locale={language === 'en' ? enUS : zhCN}
        >
            <StyleProvider >
                <div
                    id='opengpts-sidebar'
                >
                    <Tabs className='h-full' selectedIndex={tabIndex}
                        onSelect={index => {
                            setTabIndex(index);
                        }}>
                        <div className="flex w-full h-full overflow-hidden">
                            <TabList className='letTabBar'>
                                <div className="switch-bar bg-[var(--opengpts-switchbar-bg-color)] flex flex-col items-center gap-4 h-full">
                                    <div className="opengpts-sidebarr-wrapper">
                                        <div className="opengpts-sidebarr-header-content">
                                            <div className="opengpts-sidebarr-logo">
                                                <img src={logo}></img>
                                            </div>
                                            <div className="opengpts-sidebarr-widgets-list-wrapper">

                                                {tabs.map((item, index) =>
                                                    <Tab
                                                        key={item.title}
                                                        className={`outline-none opengpts-sidebarr-tab ${tabIndex === index && 'bg-[var(--opengpts-sidebar-bg-color)]'} hover:bg-[var(--opengpts-sidebar-bg-color)]`}
                                                    >
                                                        <motion.img
                                                            className="cursor-pointer"
                                                            whileTap={shakeAnimation}
                                                            src={item.icon} />

                                                    </Tab>
                                                )}
                                            </div>
                                        </div>
                                        <div className="opengpts-sidebarr-footer ">
                                            <div className="opengpts-sidebarr-widgets-list-wrapper">
                                                <div className='opengpts-sidebarr-tab'>
                                                    <motion.img whileTap={shakeAnimation}
                                                        onClick={handleSetting}
                                                        style={{ cursor: 'pointer' }} src={settingIcon} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabList>
                            {/* <div className='bg-[var(--opengpts-option-card-bg-color)]'> */}
                            {tabs.map(item => <TabPanel key={item.title} selectedClassName='flex-1  overflow-scroll'>{item.panel}</TabPanel>)}
                            {/* </div> */}
                        </div>
                    </Tabs>

                </div>
            </StyleProvider >
        </ConfigProvider >

    )
}

export default IndexSidePanel
