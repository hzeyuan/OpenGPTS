import { Dispatch, SetStateAction } from "react";

// import { Tab } from "@/types/tab";

interface Props {
  tabValue: string;
  setTabValue: Dispatch<SetStateAction<string>>;
}

export default ({ tabValue, setTabValue }: Props) => {
  const tabs: any[] = [
    {
      name: "hot",
      title: "Featured 🔥",
    },
    {
      name: "latest",
      title: "Latest",
    },
    {
      name: "random",
      title: "Random",
    },
  ];

  return (
    <section className="relative mt-4">
      <div className="px-2 py-4 mx-auto text-center max-w-7xl md:px-8 md:py-4">
        <div
          role="tablist"
          className="inline-block mx-auto tabs tabs-boxed tabs-sm md:tabs-md"
        >
          {tabs.map((tab: any, idx: number) => {
            return (
              <a
                role="tab"
                key={idx}
                className={`tab cursor-pointer ${tabValue === tab.name ? "bg-[#030712] text-white " : ""
                  } border  border-gray-500 text-sm rounded-md px-3 py-1 mx-1 `}
                onClick={() => setTabValue(tab.name)}
              >
                {tab.title}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
