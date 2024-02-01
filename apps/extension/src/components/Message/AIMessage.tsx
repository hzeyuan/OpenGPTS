import Markdown from "../Markdown";
import type { OMessage } from "@opengpts/types";
import copy from "copy-to-clipboard";
import { Actions } from "./Actions";
import _ from "lodash";
export const AIMessage = ({ message, chatId }: { chatId: string; message: OMessage; error?: string }) => {
  return (

    <div className="relative overflow-hidden text-sm ">
      <div className="flex items-center ">
        <div className="role-icon-box mr-[6px] rounded-full">
          <div className="flex items-center justify-center rounded-full "
            style={{
              width: "20px",
              height: "20px",
            }}
          >
            <img className="w-4 h-4" src={message?.display?.icon}></img>
          </div>
        </div>
        <div className="role-title font-semibold  text-[14px]">{message?.display?.name}</div>
      </div>
      <div className="flex items-end gap-1 mt-2">
        <div className="flex flex-col overflow-auto ">
          <div
            className={`bg-[var(--opengpts-chat-ai-bubble-bg-color)]  text-wrap min-w-[20px] rounded-md px-3 py-3  ${message.isError ? "border border-solid border-rose-500" : ""
              }`}
          >
            <div className={`leading-relaxed break-words break-all  `}>
              {message.content ? (
                 _.isString(message.content)? <Markdown>
                  {message.content}
                  </Markdown>
                  : message.content

              ) : (
                <div className="flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                    <circle fill="#227AFF" stroke="#227AFF" stroke-width="20" r="15" cx="40" cy="100">
                      <animate
                        attributeName="opacity"
                        calcMode="spline"
                        dur="2.7"
                        values="1;0;1;"
                        keySplines=".5 0 .5 1;.5 0 .5 1"
                        repeatCount="indefinite"
                        begin="-.4"
                      ></animate>
                    </circle>
                    <circle fill="#227AFF" stroke="#227AFF" stroke-width="20" r="15" cx="100" cy="100">
                      <animate
                        attributeName="opacity"
                        calcMode="spline"
                        dur="2.7"
                        values="1;0;1;"
                        keySplines=".5 0 .5 1;.5 0 .5 1"
                        repeatCount="indefinite"
                        begin="-.2"
                      ></animate>
                    </circle>
                    <circle fill="#227AFF" stroke="#227AFF" stroke-width="20" r="15" cx="160" cy="100">
                      <animate
                        attributeName="opacity"
                        calcMode="spline"
                        dur="2.7"
                        values="1;0;1;"
                        keySplines=".5 0 .5 1;.5 0 .5 1"
                        repeatCount="indefinite"
                        begin="0"
                      ></animate>
                    </circle>
                  </svg>
                </div>
              )}
            </div>
          </div>
          <div className="ml-1 flex mt-1   gap-x-0.5 items-end justify-end  ">
            <Actions chatId={chatId} message={message}></Actions>
          </div>
        </div>
      </div>
    </div>
  );
};
