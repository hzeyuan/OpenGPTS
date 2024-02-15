"use client"
import { useState, type ReactNode, type FC, useEffect, createContext, useContext } from 'react';
import Sidebar from './Sidebar';
import { StyleProvider } from '@ant-design/cssinjs'
import { ConfigProvider, theme as themeStyle } from "antd"
import { useStorage } from '@plasmohq/storage/hook'
import { Storage } from "@plasmohq/storage";
import type { ThemeMode } from '@opengpts/types'
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { useTranslation } from '../i18n/client';
import useColorMode from '~src/hooks/useColorMode';

interface Props {
  children?: ReactNode;
  lng: string
}

interface RootContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}


const RootContext = createContext<RootContextType>({
  theme: 'light',
  setTheme: () => { }
});

export const useRootContext = () => useContext(RootContext);

const DefaultLayout: FC<Props> = ({ children, lng }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation(lng);
  const { theme, setTheme } = useColorMode();

  const [language] = useStorage({
    key: "opengpts-language",
    instance: new Storage({
      area: "sync",
      allCopied: true
    })
  }, 'en')

  useEffect(() => {
  }, [language]);

  useEffect(() => {
    console.log('theme', theme)
  }
    , [theme]);

  return (
    <RootContext.Provider value={{ theme, setTheme }}>
      <ConfigProvider
        theme={{
          algorithm: theme === 'dark' ? themeStyle.darkAlgorithm : themeStyle.defaultAlgorithm,
          components: {
          }
        }}
        locale={language === 'en' ? enUS : zhCN}
      >
        <StyleProvider >
          <div className="dark:bg-[var(--opengpts-sidebar-bg-color)] dark:text-white">
            {/* <!-- ===== Page Wrapper Start ===== --> */}
            <div className="flex h-screen overflow-hidden">
              {/* <!-- ===== Sidebar Start ===== --> */}
              <Sidebar lng={lng} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
              {/* <!-- ===== Sidebar End ===== --> */}

              {/* <!-- ===== Content Area Start ===== --> */}
              <div className="relative flex flex-col flex-1 overflow-x-hidden overflow-y-auto">
                {/* <!-- ===== Header Start ===== --> */}
                {/* <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} /> */}
                {/* <!-- ===== Header End ===== --> */}

                {/* <!-- ===== Main Content Start ===== --> */}
                <main className='h-full'>
                  <div className="h-full mx-auto">
                    {children}
                  </div>
                </main>
                {/* <!-- ===== Main Content End ===== --> */}
              </div>
              {/* <!-- ===== Content Area End ===== --> */}
            </div>
            {/* <!-- ===== Page Wrapper End ===== --> */}
          </div>
        </StyleProvider>
      </ConfigProvider>
    </RootContext.Provider>



  );
};

export default DefaultLayout;
