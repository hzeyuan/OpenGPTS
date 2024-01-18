"use client";

import Brand from "./components/Brand";
import GptsList from "./components/GptsList";
import ProductHunt from "./components/ProductHunt";
import Tab from "./components/Tab";
import { useEffect, useState } from "react";

function Gradient({
  conic,
  className,
  small,
}: {
  small?: boolean;
  conic?: boolean;
  className?: string;
}): JSX.Element {
  return (
    <span
      className={`absolute mix-blend-normal will-change-[filter] rounded-[100%] ${small ? "blur-[32px]" : "blur-[75px]"
        } ${conic ? "bg-glow-conic" : ""} ${className}`}
    />
  );
}


export default function Page(): JSX.Element {
  const [gpts, setGpts] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState("hot");
  const [loading, setLoading] = useState(false);
  const [gptsCount, setGptsCount] = useState(0);

  const fetchGpts = async (tab: string) => {
    const params = {
      last_id: 0,
      limit: 50,
      tab: tab,
    };

    setLoading(true);
    const resp = await fetch("/api/gpts/all", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    setLoading(false);

    if (resp.ok) {
      const res = await resp.json();
      if (res.data) {
        setGptsCount(res.data.count);
        setGpts(res.data.rows);
      }
    }
  };

  useEffect(() => {
    fetchGpts(tabValue);
  }, [tabValue]);

  return (
    <>
      <Brand count={gptsCount} />
      <ProductHunt />
      {/* <Search setGpts={setGpts} setLoading={setLoading} /> */}
      <Tab tabValue={tabValue} setTabValue={setTabValue} />
      <div className="relative flex place-items-center ">
        <div className="font-sans w-auto pb-16 pt-[48px] md:pb-24 lg:pb-32 md:pt-16 lg:pt-20 flex justify-between gap-8 items-center flex-col relative z-0">

          <Gradient
            className="top-[-500px] opacity-[0.15] w-[1000px] h-[1000px]"
            conic
          />
        </div>
      </div>
      <GptsList gpts={gpts} loading={loading} />
    </>
  );
}
