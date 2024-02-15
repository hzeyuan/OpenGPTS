import { useEffect } from 'react';
import { useStorage } from '@plasmohq/storage/hook';
import { Storage } from "@plasmohq/storage"
import { opengptsStorage } from '~src/store';
import type { ThemeMode } from '@opengpts/types';
export default function useColorMode() {

  const storage = new Storage({
    area: "sync",
    allCopied: true
  })

  const [theme, setTheme] = useStorage<ThemeMode>({
    key: "opengpts-theme",
    instance: opengptsStorage,
  }, 'light')


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-gpts-theme', 'dark');
      document.documentElement.classList.add('dark'); 
    } else {
      document.documentElement.setAttribute('data-gpts-theme', 'light');
      document.documentElement.classList.remove('dark'); 
    }
  }, [theme]);
  return { theme, setTheme };
};

