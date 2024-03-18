import React, { useRef, useState,useMemo } from "react";
import Logo from "~assets/icon.png";
import Link from "next/link";
import useLayoutStore from '~src/store/useLayoutStore';
// import SidebarLinkGroup from './SidebarLinkGroup';
import {
  MoreHorizontal,
  MessageCircleMore,
  FlaskRound,
  LibraryBig,
  MousePointerSquare,
  LogOut,
  Settings2,
  Wrench,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import QQIcon from "~assets/qq.svg";
import githubIcon from "~assets/github.svg";
import EmailIcon from "~assets/email.svg";
import twitterIcon from "~assets/twitter.svg";
import { usePathname, useRouter } from "next/navigation";
import type { MenuProps } from "antd/es/menu";
import { useTranslation } from "../i18n/client";
import { Dropdown, Popover, message } from "antd";
import { useSessionContext } from "../context/SessionContext";

interface SidebarProps {
  // sidebarOpen: boolean;
  // setSidebarOpen: (arg: boolean) => void;
  lng: string;
}

const shakeAnimation = {
  scale: 0.85,
  rotate: [0, 5, -5, 5, -5, 0],
  transition: {
    duration: 0.1,
  },
};

const sidebarVariants: Variants = {
  open: {
    width: "240px", // example value
    opacity: 1,
    visibility: "visible", // Ensure this is a valid CSS visibility value
    transition: {
      width: {
        duration: 0.3,
        ease: "easeInOut",
      },
      opacity: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  },
  collapsed: {
    width: "0%", // example value
    opacity: 0,
    visibility: "hidden", // Ensure this is a valid CSS visibility value
    transition: {
      width: {
        duration: 0.3,
        ease: "easeInOut",
      },
      opacity: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  },
};

const Sidebar = ({  lng }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const sidebar = useRef<any>(null);
  const { session, logout } = useSessionContext();
  const { t } = useTranslation(lng);
  // const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const sidebarOpen = useLayoutStore(state => state.exposed);
  const sidebarAnimation = useMemo(()=>sidebarOpen ? "open" : "collapsed",[sidebarOpen]);
  
  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "logout") {
      logout();
      message.success("Logout successfully");
      router.replace("/");
    } else if (e.key === "settings") {
      router.push("/settings");
    }
  };

  return (

    <motion.aside
      initial={false}
      ref={sidebar}
      animate={sidebarAnimation}
      transition={{ duration: 0 }}
      variants={sidebarVariants}
      // bg-[#faebd7e0]
      className={`absolute  bg-gray-100 dark:bg-black   border-solid border-r border-r-gray-200    dark:border-r-gray-800 left-0 top-0  z-100 flex h-screen w-60 flex-col overflow-y-hidden  duration-300 ease-linear  lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-5 pt-3 lg:pt-5.5">
        <Link href="/">
          <img src={Logo.src} alt="Logo" width={40} />
        </Link>
      </div>
      <div className="flex flex-col justify-between w-full h-full">
        {/* <!-- SIDEBAR HEADER --> */}
        <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
          {/* <!-- Sidebar Menu --> */}
          <nav className="px-4 py-4 ">
            <Link href="/home" className="flex  items-center justify-center  bg-[var(--opengpts-option-card-bg-color)] rounded-lg  text-sm my-4 px-4 py-3">
              <MousePointerSquare className="w-4 h-4" />
              {<span className="ml-2 cursor-pointer">{t("仪表盘")}</span>}
            </Link>
            <div className="flex  items-center justify-center  bg-[var(--opengpts-option-card-bg-color)] rounded-lg  text-sm my-4 px-4 py-3">
              <MousePointerSquare className="w-4 h-4" />
              {sidebarOpen && <span className="ml-2 cursor-pointer">{t("Discover")}</span>}
            </div>

            {/* <!-- Menu Group --> */}
            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold ">{t("AI Models")}</h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                {/* <!-- Menu Item Dashboard --> */}
                <Link
                  href={"/chat"}
                  className={`${pathname.includes("/chat") ? "bg-white dark:bg-[var(--opengpts-option-card-bg-color)]" : ""
                    } group relative flex items-center gap-2.5 rounded py-2 px-4 font-medium  duration-300 ease-in-out  hover:bg-white dark:hover:bg-[var(--opengpts-option-card-bg-color)]`}
                >
                  <MessageCircleMore />
                  {sidebarOpen && <span>{t("Chat")}</span>}
                </Link>

                <li>
                  <Link
                    href="/knowledge"
                    className={`${pathname.includes("/knowledge") ? "bg-white dark:bg-[var(--opengpts-option-card-bg-color)]" : ""
                      } group relative flex items-center gap-2.5 rounded py-2 px-4 font-medium  duration-300 ease-in-out hover:bg-white dark:hover:bg-[var(--opengpts-option-card-bg-color)] `}
                  >
                    <LibraryBig />
                    {sidebarOpen && <span>{t("Knowledge")}</span>}
                  </Link>
                </li>

                <li>
                  <Link
                    href="/tools"
                    className={`${pathname.includes("/tools") ? "bg-white dark:bg-[var(--opengpts-option-card-bg-color)]" : ""
                      } group relative flex items-center gap-2.5 rounded py-2 px-4 font-medium  duration-300 ease-in-out hover:bg-white dark:hover:bg-[var(--opengpts-option-card-bg-color)] `}
                  >
                    <Wrench />
                    {sidebarOpen && <span>{t("Tools")}</span>}
                  </Link>
                </li>

                <h3 className="mb-4 ml-4 text-sm font-semibold ">{t("RPA")}</h3>

                <li>
                  <Link
                    href="/rpa/test"
                    className={`${pathname.includes("/rpa/test") ? "bg-white dark:bg-[var(--opengpts-option-card-bg-color)]" : ""
                      } group relative flex items-center gap-2.5 rounded py-2 px-4 font-medium  duration-300 ease-in-out hover:bg-white dark:hover:bg-[var(--opengpts-option-card-bg-color)] `}
                  >
                    {/* <FunctionSquare /> */}
                    <FlaskRound />
                    {sidebarOpen && <span>{t("RPA TEST")}</span>}
                  </Link>
                </li>

                <li>
                  <Link
                    href="/rpa/workflow"
                    className={`${pathname.includes("/rpa/workflow")
                      ? "bg-white dark:bg-[var(--opengpts-option-card-bg-color)]"
                      : ""
                      } group relative flex items-center gap-2.5 rounded py-2 px-4 font-medium  duration-300 ease-in-out hover:bg-white dark:hover:bg-[var(--opengpts-option-card-bg-color)] `}
                  >
                    <LibraryBig />
                    {sidebarOpen && <span>{t("RPA Workflow")}</span>}
                  </Link>
                </li>

                <h3 className="mt-4 ml-4 text-sm font-semibold ">{t("Bot")}</h3>

                {/* <li>
                  <Link
                    href="/rpa/test"
                    className={`${pathname.includes('/rpa/test') ? 'bg-white dark:bg-[var(--opengpts-option-card-bg-color)]' : ''} group relative flex items-center gap-2.5 rounded py-2 px-4 font-medium  duration-300 ease-in-out hover:bg-white dark:hover:bg-[var(--opengpts-option-card-bg-color)] `
                    }
                  >
                    <LibraryBig />
                    <span>{t('RPA TEST')}</span>
                  </Link>
                </li> */}

                {/* <!-- Menu Item Settings --> */}
              </ul>
            </div>
          </nav>
          {/* <!-- Sidebar Menu --> */}
        </div>
        {/* <!-- SIDEBAR FOOTER --> */}
        <div className="flex flex-col items-center w-full gap-3 p-4">
          {/* <div className='flex items-center w-full'>
            <div className='pr-2'><DarkModeSwitcher /></div>
            <LanguageSwitcher />
          </div> */}

          <div className="flex justify-center w-full mt-1 cursor-pointer ">
            <Dropdown
              trigger={["click"]}
              placement="top"
              className="w-full flex  items-center justify-between  bg-[var(--opengpts-option-box-bg-color)] rounded-lg  text-sm my-4 px-4 py-3"
              menu={{
                items: [
                  {
                    key: "settings",
                    label: (
                      <div className="flex items-center">
                        <Settings2 className="w-4 h-4 mr-1" />
                        <span>{t("Settings")}</span>
                      </div>
                    ),
                  },
                  {
                    key: "logout",
                    label: (
                      <div className="flex items-center">
                        <LogOut className="w-4 h-4 mr-1" />
                        <span>{t("Log Out")}</span>
                      </div>
                    ),
                  },
                ],
                onClick: handleMenuClick,
              }}
            >
              <div className="flex  items-center justify-between  bg-[var(--opengpts-option-card-bg-color)] rounded-lg  text-sm px-4 py-3">
                <span className="w-full mr-2">{session?.user?.email || "未登录"}</span>
                <MoreHorizontal className="w-4 h-4" />
              </div>
            </Dropdown>
          </div>
          <div className="flex gap-2 ">
            <Popover
              title="My Email:yixotieq@gmail.com"
              content="if you have an idea or any question, you can contact me by email"
            >
              <div className="opengpts-sidebarr-widgets-list-wrapper">
                <div
                  onClick={() => {
                    window.open("mailto:yixotieq@gmail.com");
                  }}
                  className="p-2 bg-[var(--opengpts-sidebar-bg-color)] dark:bg- rounded w-9 h-9"
                >
                  <motion.img
                    className="w-full cursor-pointer"
                    whileTap={shakeAnimation}
                    src={EmailIcon?.src || EmailIcon}
                  />
                </div>
              </div>
            </Popover>
            <div className="opengpts-sidebarr-widgets-list-wrapper">
              <div
                onClick={() => {
                  window.open("https://github.com/hzeyuan/OpenGPTS");
                }}
                className="p-2 bg-[var(--opengpts-sidebar-bg-color)] rounded w-9 h-9"
              >
                <motion.img
                  whileTap={shakeAnimation}
                  className="w-full cursor-pointer"
                  src={githubIcon?.src || githubIcon}
                />
              </div>
            </div>
            <div className="opengpts-sidebarr-widgets-list-wrapper">
              <Popover title="QQ:860859251">
                <div
                  onClick={() => {
                    window.open(
                      "http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=bS8gPGax2ObMgdipbTacRX-1gzKwqF60&authKey=o51MRTMX%2FyDJRdBHqT5BPMsP0N3Nqytmta7nwzG9dh6iXMWtu1IVkFQJjnNYyNPS&noverify=0&group_code=860859251"
                    );
                  }}
                  className="p-2 bg-[var(--opengpts-sidebar-bg-color)] rounded w-9 h-9"
                >
                  <motion.img
                    whileTap={shakeAnimation}
                    className="w-full cursor-pointer"
                    src={QQIcon?.src || QQIcon}
                  />
                </div>
              </Popover>
            </div>
            <div className="opengpts-sidebarr-widgets-list-wrapper">
              <div
                onClick={() => {
                  window.open("https://twitter.com/FeigelC35583");
                }}
                className="p-2 bg-[var(--opengpts-sidebar-bg-color)] rounded w-9 h-9"
              >
                <motion.img
                  whileTap={shakeAnimation}
                  className="w-full cursor-pointer"
                  src={twitterIcon?.src || twitterIcon}
                />
              </div>
            </div>
            {/* <div className="opengpts-sidebarr-widgets-list-wrapper">
              <div onClick={handleSetting} className='p-2 bg-white rounded w-9 h-9'>
                <motion.img whileTap={shakeAnimation}
                  style={{ cursor: 'pointer' }} src={settingIcon} />
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </motion.aside>


  );
};

export default Sidebar;
