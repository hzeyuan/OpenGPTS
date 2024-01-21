import { BsChatDots } from "react-icons/bs";
import Preview from "./Preview";
import { getGptsTools } from "../../services/gpts";
import moment from "moment";
import { Gpts } from "../../types/gpts";

interface Props {
  gpts: Gpts;
}

export default ({ gpts }: Props) => {
  const tools = getGptsTools(gpts);

  return (
    <section>
      <div className="w-full px-5 py-12 mx-auto max-w-7xl md:px-10 md:py-16 lg:py-20">
        <div className="grid gap-12 sm:gap-20 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center rounded-md bg-[#c4c4c4] px-3 py-1">
              <div className="w-2 h-2 mr-1 bg-black rounded-full"></div>
              <p className="text-sm">
                {moment(gpts.updated_at).fromNow()}
              </p>
            </div>
            <p className="text-sm text-[#808080] sm:text-xl">
              Created by {gpts.author_name}
            </p>
            <h1 className="mb-6 text-4xl font-bold md:text-6xl lg:mb-8">
              {gpts.name}
            </h1>
            <p className="text-sm text-[#808080] sm:text-xl">
              {gpts.description}
            </p>
            <div className="w-full h-px mt-8 mb-8 bg-black"></div>
            <div className="mb-6 flex flex-col gap-2 text-sm text-[#808080] sm:text-base lg:mb-8">
              <p className="font-medium">Capabilities</p>
              <p>
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={tools && tools.includes("browser")}
                />
                Web Browsing
              </p>
              <p>
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={tools && tools.includes("dalle")}
                />
                DALL·E Image Generation
              </p>
              <p>
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={tools && tools.includes("python")}
                />
                Code Interpreter
              </p>
            </div>
            <div className="flex flex-col gap-4 font-semibold sm:flex-row">
              <a
                href={gpts.visit_url}
                target="_blank"
                className="flex items-center gap-2 px-6 py-3 text-purple-500 truncate border border-black border-solid rounded-md bg-primary"
              >
                <BsChatDots />
                <p>Use this GPTs on ChatGPT 👉</p>
              </a>
            </div>
          </div>
          <div className="min-h-[530px] overflow-hidden rounded-md bg-[#f2f2f7]">
            <Preview gpts={gpts} />
          </div>
        </div>
      </div>
    </section>
  );
};
