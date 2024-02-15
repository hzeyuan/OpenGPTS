import { AnimatePresence, motion } from "framer-motion";
import React, { useImperativeHandle, useState } from "react";
import { useEffect, useRef } from "react";
import type { OMessage } from "@opengpts/types";
import { AIMessage } from "./AIMessage";
import { UserMessage } from "./UserMessage";
import FunctionMessage from "./Function";
import _ from "lodash-es";

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


        /**
* filter function messages  
* query call  condition: message.role ==='assistant'  && message.function_call 
* result condition: message.role ==='function'
*/

        useImperativeHandle(
            ref,
            (): MessagesListMethods => ({
                scrollToBottom: scrollToBottom
            }
            ));

        const scrollToBottom = () => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        };

        const updateMessages = (newMessages: OMessage[]) => {
            let reversedMessages = _.reverse([...newMessages]);
            let uniqueMessages = _.uniqBy(reversedMessages, 'id');

            let updatedMessages = _.reverse(uniqueMessages);
            // console.log('newMessages', newMessages)
            // console.log('uniqueMessages', uniqueMessages, updatedMessages)
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
                            {/* {JSON.stringify(message)} */}
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

