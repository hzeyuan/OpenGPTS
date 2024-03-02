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
import './DefaultLayout.css'
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
  // const [session, setSession] = useState<Session | null>(null)
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


  // useEffect(() => {
  //   const { data: authListener } = supabase.auth.onAuthStateChange(
  //     (event, session) => {
  //       if (event === 'SIGNED_OUT') {
  //         setSession(null)
  //       } else if (session) {
  //         console.log('session',session)
  //         setSession(session)
  //       }
  //     })

  //   return () => {
  //     authListener.subscription.unsubscribe();
  //   }
  // }, [])


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
          {/* <SessionContext.Provider value={session}> */}
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

                <div
                  style={{
                    zIndex: 9999
                  }}
                  className="fixed z-90 top-1/2   -translate-y-[50%]"

                // style="transform: translateX(260px) translateY(-50%) rotate(0deg) translateZ(0px);"
                >
                  <button className='rotate-on-hover' onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <span className="" data-state="closed">
                      <div className="flex h-[72px] w-8 items-center justify-center">
                        <div className="flex flex-col items-center w-6 h-6">
                          <div
                            className="w-1 h-3 rounded-full rotate-left translate-y-[0.15rem]  transform     "
                            style={{
                              background: "var(--opengpts-primary-color)",
                              // transform: "translateY(0.15rem)   translateZ(0px)",
                            }}
                          ></div>
                          <div
                            className="w-1 h-3 rounded-full rotate-right   translate-y-[-0.15rem]  transform  "
                            style={{
                              background: "var(--opengpts-primary-color)",
                              // transform: "translateY(-0.15rem)    translateZ(0px)",
                            }}
                          ></div>
                        </div>
                      </div>
                      <span
                        style={{
                          position: "absolute",
                          border: "0px",
                          width: "1px",
                          height: "1px",
                          padding: "0px",
                          margin: "-1px",
                          overflow: "hidden",
                          clip: "rect(0px, 0px, 0px, 0px)",
                          whiteSpace: "nowrap",
                          overflowWrap: "normal",

                        }}
                      >
                        关闭侧边栏
                      </span>
                    </span>
                  </button>
                </div>


                {/* <!-- ===== Main Content Start ===== --> */}
                <main className='h-full '>


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
          {/* </SessionContext.Provider> */}
        </StyleProvider>
      </ConfigProvider>
    </RootContext.Provider>



  );
};

export default DefaultLayout;
