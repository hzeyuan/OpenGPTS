import { AnimatePresence, motion } from "framer-motion";
import React, { useImperativeHandle, useState } from "react";
import { useEffect, useRef } from "react";
import type { OMessage } from "@opengpts/types";
import { AIMessage } from "./AIMessage";
import { UserMessage } from "./UserMessage";
import FunctionMessage from "./Function";
import _ from "lodash";

const messageAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};


export interface MessagesListProps {
    messages: OMessage[];
    uiMessages: any[];
    chatId: string;
}

export interface MessagesListMethods {
    scrollToBottom: () => void;
}


export const MessagesList = React.forwardRef<MessagesListMethods, MessagesListProps>(
    ({ messages, uiMessages, chatId }, ref) => {
        const [displayedMessages, setDisplayedMessages] = useState<OMessage[]>([]);
        const bottomRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            // Scroll to the bottom with animation when the component mounts
            scrollToBottom();
        }, []);

        useEffect(() => {
            // Update the displayed messages when the messages prop changes
            updateMessages(messages);

            // scrollToBottom();
        }, [messages]);


        useImperativeHandle(
            ref,
            (): MessagesListMethods => ({
                scrollToBottom: scrollToBottom
            }
            ));

        const scrollToBottom = () => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        };

        const updateMessages = (newMessages) => {
            //newMessages中相同id的项进行合并，使用lodash
            let reversedMessages = _.reverse([...newMessages]);

            // 使用 _.uniqBy 去除重复的 ID，保留第一个出现的（实际上是最后出现的，因为数组被反转了）
            let uniqueMessages = _.uniqBy(reversedMessages, 'id');

            // 再次反转数组，恢复原始的顺序
            let updatedMessages = _.reverse(uniqueMessages);

            setDisplayedMessages(updatedMessages);
        };

        return (
            <AnimatePresence>
                {uiMessages}
                {displayedMessages.map((message, index) => (
                    <motion.div
                        key={message.id}
                        variants={messageAnimation}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        <div>
                            {message.role === "system" && (
                                <AIMessage
                                    chatId={chatId}
                                    key={`system-${index}`}
                                    message={message}
                                />
                            )}
                            {message.role === "user" && (
                                <UserMessage
                                    key={`user-${index}`}
                                    chatId={chatId}
                                    message={message}
                                />
                            )}
                            {
                                (message.function_call || message.role === 'function') &&
                                <FunctionMessage
                                    message={message}
                                ></FunctionMessage>
                            }
                            {message.role === "assistant" && !(message?.function_call) && (
                                <AIMessage
                                    chatId={chatId}
                                    key={`ai-${index}`}
                                    message={message}
                                />
                            )}
                        </div>
                        <div ref={bottomRef}></div>
                    </motion.div>
                ))}
            </AnimatePresence>
        );
    }
);
