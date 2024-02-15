"use client"
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from 'next/link'
import { defaultLanguagesOptions } from '~/src/app/i18n/settings'
import {  useRouter,usePathname } from "next/navigation";

interface FlagIconProps {
    countryCode: string;
}

function FlagIcon({ countryCode = "" }: FlagIconProps) {

    if (countryCode === "en") {
        countryCode = "gb";
    }
    return (
        <span
            className={`fi fis inline-block mr-2 fi-${countryCode}`}
        />
    );
}

interface Language {
    key: string;
    name: string;
}

const LANGUAGE_SELECTOR_ID = 'language-selector';

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const [languages, setLanguages] = useState<Language[]>(defaultLanguagesOptions);
    const [isOpen, setIsOpen] = useState(true);
    const selectedLanguage = languages.find(language => language.key === i18n.language);


    const handleLanguageChange = async (language: Language) => {
        await i18n.changeLanguage(language.key);
        setIsOpen(false);
      
        // 使用 router.push 进行路由跳转
        const newPath = `/${language.key}/` + pathname.split('/').slice(2).join('/')
        // console.log('asPath',pathname,newPath)
        router.replace(newPath);

    };


    useEffect(() => {
        const handleWindowClick = (event: any) => {
            const target = event.target.closest('button');
            if (target && target.id === LANGUAGE_SELECTOR_ID) {
                return;
            }
            setIsOpen(false);
        }
        window.addEventListener('click', handleWindowClick)
        return () => {
            window.removeEventListener('click', handleWindowClick);
        }
    }, []);

    if (!selectedLanguage) {
        return null;
    }

    return (
        <>
            <div className="z-40 flex items-center">
                <div className="relative inline-block text-left">
                    <div>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            id={LANGUAGE_SELECTOR_ID}
                            aria-haspopup="true"
                            aria-expanded={isOpen}
                        >
                            <FlagIcon countryCode={selectedLanguage.key} />
                            {selectedLanguage.name}
                            <svg
                                className="w-5 h-5 ml-2 -mr-1"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10.293 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                    {isOpen && <div
                        className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="language-selector"
                    >
                        <div className="flex flex-col gap-2 py-1" role="none">
                            {languages.map((language, index) => {
                                return (
                                    <div
                                        key={language.key}
                                        onClick={() => handleLanguageChange(language)}
                                        className={`${selectedLanguage.key === language.key
                                            ? "bg-gray-100 text-gray-900"
                                            : "text-gray-700"
                                            } block px-4 py-2 text-sm text-left items-center inline-flex hover:bg-gray-100 ${index % 2 === 0 ? 'rounded-r' : 'rounded-l'}`}
                                        role="menuitem"
                                    >
                                        <FlagIcon countryCode={language.key} />
                                        <span className="truncate">{language.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>}
                </div>
            </div>
        </>
    );
};