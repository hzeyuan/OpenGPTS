import React from 'react';
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
// import logo from '~assets/icon.png'
import supabase from '~src/utils/supabase';

const Login = () => {
    return (
        <div className='flex justify-center w-full mt-64'>
            <div className="flex justify-center ">
                <div className="w-[420px] rounded-2xl border border-slate-200  px-10 py-6 pb-4">
                    <div className="mb-2 text-center md:mb-4">
                        <a href="javascript:void(0)" className="inline-block max-w-[160px] mx-auto" target="_blank">
                            {/* <img className='w-10 h-10' src={logo.toString()} alt="logo" /> */}
                        </a>
                    </div>
                    <Auth
                        supabaseClient={supabase}
                        appearance={{ theme: ThemeSupa }}
                        providers={["google"]}
                        theme="light"
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;