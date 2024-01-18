import {
  getGptsTools,
  getGptsWelcomeMessage,
  gptGptsPromptStarters,
} from "../../services/gpts";

import { Gpts } from "../../types/gpts";

interface Props {
  gpts: Gpts;
}

export default ({ gpts }: Props) => {
  const promptStarters = gptGptsPromptStarters(gpts);
  const welcomeMessage = getGptsWelcomeMessage(gpts);
  const toolss = getGptsTools(gpts);
  console.log("toos", toolss);
  return (
    <div className="relative w-full h-full text-center">
      <div className="mx-auto mt-12">
        <img
          className="w-16 h-16 mx-auto rounded-full"
          src={gpts.avatar_url}
          alt=""
        />
        <h2 className="mt-2 text-2xl font-medium text-center">{gpts.name}</h2>
        <p className="mx-10 mt-2 text-xl font-normal text-center text-token-text-secondary">
          {gpts.description}
        </p>
        <p className="mt-2 text-sm text-token-text-tertiary">
          By {gpts.author_name}
        </p>
      </div>

      <div className="px-8 py-8">
        {welcomeMessage && (
          <div className="hidden md:flex">
            <p className="px-4 py-2 text-sm truncate bg-white rounded-xl">
              {welcomeMessage}
            </p>
            <div className="flex-1"></div>
          </div>
        )}
      </div>

      <div className="absolute w-full px-8 bottom-20">
        {promptStarters && (
          <div className="flex flex-wrap items-center">
            {promptStarters.map((v: string, idx: number) => {
              return (
                <div key={idx} className="w-full px-1 py-1 md:w-1/2">
                  <p className="px-2 py-1 text-sm text-left text-gray-700 truncate bg-white border rounded-xl border-gray-50">
                    {v}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        <input
          type="text"
          disabled
          placeholder={`Message ${gpts.name}…`}
          className="w-full px-4 py-2 mt-4 text-sm bg-white border border-primary rounded-xl"
        />
      </div>
    </div>
  );
};
