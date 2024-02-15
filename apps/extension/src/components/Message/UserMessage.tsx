import type { OMessage } from "@opengpts/types"

import { Actions } from "./Actions"

export const UserMessage = ({ message, chatId }: { message: OMessage, chatId: string }) => {
    return (
        <div className="my-1 overflow-hidden text-sm">
            <div className="flex items-center justify-end">
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
                <div className="role-title font-semibold  text-[14px] text-[var(--opengpts-primary-title-color)]">{message?.display?.name}</div>
            </div>
            <div className="flex flex-row-reverse items-end gap-1 mt-1">
                <div
                    className="flex overflow-auto rounded-md text-[var(--opengpts-chat-user-bubble-color)] px-3 py-2 bg-[var(--opengpts-chat-primary-color)]  flex-col"
                >
                    {message?.command && (<div className="prompt-label gap-1 flex items-center text-xs leading-5 text-[#8a57ea] mb-1">
                        {
                            message.command.icon && <span className="inline-flex shrink-0 ">
                                {message.command.icon}
                            </span>
                        }
                        <div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap ">
                            {message.command.name}
                        </div>
                    </div>)
                    }

                    <div className="text-wrap min-w-[20px]">
                        {/* {message?.attachments?.map((attachment, index) => {} */}
                        {message?.images && message?.images?.length > 0 && <img className="w-64 h-64" src={message.images![0]}></img>}
                        <div className="leading-relaxed break-words break-all ">{message.content}</div>
                    </div>
                </div>
            </div>
            {/* quote */}
            {message.ui && (<div className="flex justify-end">
                <div className="max-w-[min(80%,400px)]">
                    <div className="text-xs cursor-pointer mt-1 leading-[18px] max-h-[48px] line-clamp-2 bg-[var(--opengpts-quote-bg-color)] text-[var(--opengpts-third-text-color)] rounded-lg py-1 px-2">
                        {message.ui}
                    </div>
                </div>
            </div>)}

            <div className="ml-1 flex mt-1   gap-x-0.5 items-end justify-end">
                <Actions chatId={chatId} message={message}></Actions>
            </div>
        </div>
    )
}
