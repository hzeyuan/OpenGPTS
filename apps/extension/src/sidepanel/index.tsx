import '~/src/i18n.js';
import "./index.css"
import '../base.css'
import logo from "data-base64:~assets/icon.png"
import chatTabIcon from '~assets/chat-tab.svg'
import { motion } from 'framer-motion';
import Browser from 'webextension-polyfill';
import { useState, useEffect } from "react"
import { Tabs, Tab, TabList, TabPanel } from 'react-tabs';

import { StyleProvider } from "@ant-design/cssinjs"
import { ConfigProvider, theme as themeStyle } from "antd"
import { sendToBackground } from "@plasmohq/messaging";
import { useMessage } from "@plasmohq/messaging/hook";
import { useStorage } from "@plasmohq/storage/hook";
import { Storage } from "@plasmohq/storage";
import type { ThemeMode } from "~index";
import { useTranslation } from 'react-i18next';
import GPTsCreatorPanel from '~src/components/GPTsCreatorPanel';



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
        sendToBackground({
            name: "openOptionsPage",
            extensionId: Browser.runtime.id // 确保这是您的扩展ID
        });
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
                        colorBgContainer: 'var(--gptreat-option-card-bg-color)',
                        colorText: 'var(--gptreat-primary-text-color)'
                    },
                    Drawer: {

                    },
                }
            }}
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
                                <div className="switch-bar bg-[var(--gptreat-switchbar-bg-color)] flex flex-col items-center gap-4 h-full">
                                    <div className="opengpts-sidebarr-wrapper">
                                        <div className="opengpts-sidebarr-header-content">
                                            <div className="opengpts-sidebarr-logo">
                                                <img src={logo}></img>
                                            </div>
                                            <div className="opengpts-sidebarr-widgets-list-wrapper">

                                                {tabs.map((item, index) =>
                                                    <Tab
                                                        key={item.title}
                                                        className={`outline-none opengpts-sidebarr-tab ${tabIndex === index && 'bg-[var(--gptreat-sidebar-bg-color)]'} hover:bg-[var(--gptreat-sidebar-bg-color)]`}
                                                    >
                                                        <motion.img
                                                            className="cursor-pointer"
                                                            whileTap={shakeAnimation}
                                                            src={item.icon} />

                                                    </Tab>
                                                )}
                                                <Tab tabIndex='create' className='opengpts-sidebarr-tab  outline-none hover:bg-[var(--gptreat-sidebar-bg-color)]'>
                                                    <motion.svg
                                                        className="outline-none cursor-pointer"
                                                        viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1445" width="100%" height="100%"
                                                        whileTap={{
                                                            scale: 0.85,
                                                            fill: 'var(--gptreat-primary-color)',
                                                            transition: {
                                                                duration: 0.2
                                                            }
                                                        }}
                                                    >
                                                        <path d="M474 152m8 0l60 0q8 0 8 8l0 704q0 8-8 8l-60 0q-8 0-8-8l0-704q0-8 8-8Z" fill="#000000" p-id="1446"></path><path d="M168 474m8 0l672 0q8 0 8 8l0 60q0 8-8 8l-672 0q-8 0-8-8l0-60q0-8 8-8Z" fill="#000000" p-id="1447"></path></motion.svg>
                                                </Tab>
                                            </div>
                                        </div>
                                        <div className="opengpts-sidebarr-footer ">
                                            <div className="opengpts-sidebarr-widgets-list-wrapper">
                                                <div className='opengpts-sidebarr-tab'>
                                                    <motion.img whileTap={shakeAnimation}
                                                        onClick={handleSetting}
                                                        style={{ cursor: 'pointer' }} src="chrome-extension://afdfpkhbdpioonfeknablodaejkklbdn/img/icon_settings.svg" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabList>
                            {tabs.map(item => <TabPanel key={item.title} selectedClassName='flex-1  overflow-scroll'>{item.panel}</TabPanel>)}
                        </div>
                    </Tabs>

                </div>
            </StyleProvider >
        </ConfigProvider >

    )
}

export default IndexSidePanel
