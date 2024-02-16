"use client"
import React,{ useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useAuth } from "~src/hooks/useAuth";

const LoginPage = () => {

  const supabase = createClientComponentClient();
  const router = useRouter();
  useAuth({
    onSignIn:()=>{
      router.refresh();
      router.replace('/chat')
    }
   });


  return (

    <div className='flex flex-col justify-center min-h-full pt-10 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='px-4 py-8 bg-white shadow-xl ring-1 ring-gray-900/10 sm:rounded-lg sm:px-10 dark:bg-white dark:text-gray-900'>
          <div className=''>
            <div className='mt-1 mb-2'>
              <h2 className='text-2xl font-bold '>Log in to your account</h2>
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
    </div>
  );
};

export default LoginPage;