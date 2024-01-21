import "./globals.css";
import "react-lazy-load-image-component/src/effects/blur.css";

import { Inter } from "next/font/google";
import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Gradient from './components/Gradient'
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GPTs Works - Third-party GPTs store",
  description:
    "GPTs Works is a Third-party GPTs store. Support seach GPTs by chatting.",
  keywords:
    "GPTs, GPTs store, GPTs Works, ChatGPT, OpenAI GPTs, vector search GPTs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
      </head>
      <body className={inter.className}>
        <main>
          <Header />
          <div className="absolute flex place-items-center">
            <div className="font-sans w-auto pb-16 pt-[48px] md:pb-24 lg:pb-32 md:pt-16 lg:pt-20 flex justify-between gap-8 items-center flex-col relative z-0">
              <Gradient
                className="top-[-500px] opacity-[0.15] w-[1000px] h-[1000px]"
                conic
              />
            </div>
          </div>
          <div className="relative z-50 ">
            {children}
          </div>
          <Footer />
        </main>

        {/* <script
          defer
          data-domain="gpts.works"
          src="https://plausible.io/js/script.js"
        ></script> */}
      </body>
    </html>
  );
}
