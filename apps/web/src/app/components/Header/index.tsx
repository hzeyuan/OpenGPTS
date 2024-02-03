"use client";

import { BsGithub, BsTwitter } from "react-icons/bs";

import { usePathname } from "next/navigation";

export default () => {
  const pathname = usePathname();
  return (
    <header className="w-full px-4 mx-auto mt-8 max-w-7xl md:px-10 md:mt-12">
      <div className="flex items-center">
        <h1 className="text-lg font-medium md:text-3xl ">
          <a
            className="px-3 py-3 text-white bg-center bg-cover cursor-pointer md:px-4 md:py-4 m"
            href="/"
            style={{
              backgroundImage: "url('/brand.svg')",
            }}
          >
            OPENGPTS
          </a>
        </h1>

        <div className="flex-1">
          <ul className="items-center hidden float-right mr-4 text-lg md:flex text-slate-700">
            <li className="mx-4">
              <a
                href="/extension"
                target="_self"
                className={
                  pathname === "/extension"
                    ? "text-[#2752f4]"
                    : "hover:text-[#2752f4]"
                }
              >
                Extension
              </a>
            </li>
            <li className="mx-4">
              <a
                href="https://chat.openai.com/g/g-EBKM6RsBl-gpts-works"
                target="_blank"
                className="hover:text-[#2752f4]"
              >
                GPTs Store
              </a>
            </li>
            <li className="mx-4">
              <a
                href="https://github.com/hzeyuan/OpenGPTS"
                target="_blank"
                className="hover:text-[#2752f4]"
              >
                <BsGithub className="text-xl" />
              </a>
            </li>
            <li className="mx-4">
              <a
                href="https://twitter.com/FeigelC35583"
                target="_blank"
                className="hover:text-[#2752f4]"
              >
                <BsTwitter className="text-xl" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};
