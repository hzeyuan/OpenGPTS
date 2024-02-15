"use client";

import Brand from "../components/Brand";
import GptsList from "../components/GptsList";
import Gradient from "../components/Gradient";
// import ProductHunt from "./components/ProductHunt";
import Search from "../components/Search";
import Tab from "../components/Tab";
import { useEffect, useState } from "react";




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
      {/* <ProductHunt /> */}
      <Search setGpts={setGpts} setLoading={setLoading} />
      <Tab tabValue={tabValue} setTabValue={setTabValue} />
      <GptsList gpts={gpts} loading={loading} />
    </>
  );
}
