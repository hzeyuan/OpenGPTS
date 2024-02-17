import type { User } from '@supabase/supabase-js';
import DropdownUser from '~src/components/User/DropdownUser';
import DarkModeSwitcher from '~src/components/common/DarkModeSwitcher';
import {LanguageSwitcher } from '~src/components/common/LanguageSwitcher'

import { useTranslation } from '../i18n/client';

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
  user?: User;
  lng: string
}) => {

  const { t } = useTranslation(props.lng);

  return (
    <header className='sticky top-0 flex w-full bg-white z-999 dark:bg-boxdark dark:drop-shadow-none'>
      <div className='flex items-center justify-between flex-grow px-8 py-5 shadow sm:justify-end sm:gap-5 '>
        <div className='flex items-center gap-2 sm:gap-4 lg:hidden'>
          {/* <!-- Hamburger Toggle BTN --> */}

          <button
            aria-controls='sidebar'
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className='z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden'
          >
            <span className='relative block h-5.5 w-5.5 cursor-pointer'>
              <span className='absolute right-0 w-full h-full du-block'>
                <span
                  className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && '!w-full delay-300'
                    }`}
                ></span>
                <span
                  className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && 'delay-400 !w-full'
                    }`}
                ></span>
                <span
                  className={`relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && '!w-full delay-500'
                    }`}
                ></span>
              </span>
              <span className='absolute right-0 w-full h-full rotate-45'>
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && '!h-0 !delay-[0]'
                    }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && '!h-0 !delay-200'
                    }`}
                ></span>
              </span>
            </span>
          </button>

          {/* <!-- Hamburger Toggle BTN --> */}

        </div>

        <ul className='flex items-center gap-2 2xsm:gap-4'>
          {/* <!-- Dark Mode Toggler --> */}
          <DarkModeSwitcher />
          {/* <!-- Dark Mode Toggler --> */}
          <LanguageSwitcher></LanguageSwitcher>

          {/* <Trans i18nKey="languageSwitcher" t={t}>
            Switch from <strong>{props.lng }</strong> to:{' '}
          </Trans>
          {languages.filter((l) => props.lng !== l).map((l, index) => {
            return (
              <span key={l}>
                {index > 0 && (' or ')}
                <Link href={`/${l}`}>
                  {l}
                </Link>
              </span>
            )
          })} */}
          {/* <!-- Chat Notification Area --> */}
          {/* <MessageButton /> */}
          {/* <!-- Chat Notification Area --> */}
        </ul>

        <div className='flex items-center gap-3 2xsm:gap-7'>

          {/* <!-- User Area --> */}
          {!!props.user && <DropdownUser user={props.user} />}
          {/* <!-- User Area --> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
