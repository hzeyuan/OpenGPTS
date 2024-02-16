import { LayoutGrid, LogIn } from 'lucide-react'
import Link from 'next/link';
import { useAuth } from '~src/hooks/useAuth';
import type { User } from '@supabase/supabase-js';

export const UserMenuItems = ({
  setMobileMenuOpen,
}: {
  user?: Partial<User>;
  setMobileMenuOpen?: any;
}) => {
  const path = window.location.pathname;
  const { logout } = useAuth()
  const handleMobileMenuClick = () => {
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  }

  return (
    <>
      <ul
        className={`flex flex-col gap-5 border-b border-stroke py-4 dark:border-strokedark px-6'
          }`}
      >
        <li>
          <Link
            href='chat'
            className='flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-yellow-500'
          >
            <LayoutGrid size={20} />
            AI Agent Scheduler (Demo App)
          </Link>
        </li>
      </ul>
      <button
        onClick={() => logout()}
        className={`cursor-pointer flex items-center gap-3.5 py-4 text-sm font-medium duration-300 ease-in-out hover:text-yellow-500 px-6'
          }`}
      >
        <LogIn size={18} />
        Log Out
      </button>
    </>
  );
};
