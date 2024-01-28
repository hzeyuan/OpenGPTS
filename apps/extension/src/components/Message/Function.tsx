
import { Collapse, Popover, Spin } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import _ from "lodash";
import type { OMessage } from "@opengpts/types";
import Markdown from "../Markdown";

interface FunctionMessageProps {
    message: OMessage

}

const FunctionMessage: React.FC<FunctionMessageProps> = ({ message }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const variants = {
        expanded: {
            // height: 400,
            width: '100%',
            opacity: 1,
            transition: { duration: 0.2 }
        },
        collapsed: {
            height: 'auto', // 初始高度
            width: 'auto', // 初始宽度
            opacity: 1,
            transition: { duration: 0.2 }
        }
    };

    // 函数运行状态
    const status = useMemo(() => {
        // if message.role === 'function'
        // 判断是否错误
        if (message.isError) {
            return 'error'
        }
        // 判断是否完成
        if (message.role === 'function' && message.function_call && !message.isError) {
            return 'finished'
        }
        // 判断是否正在运行
        if (message.role === 'assistant' && !message.content) {
            return 'running'
        }
        return 'start'
    }, [message])

    const functionCallInfo = useMemo(() => {
        const { function_call, role } = message
        if (role === 'function') {
            return {
                name: message.name,
            }
        } else {
            if (typeof function_call === 'string') {
                console.log('functionCall', function_call)
                _.attempt(() => {
                    const data = JSON.parse(function_call)
                    console.log('data', data)
                    return {
                        name: data.name,
                        arguments: data.arguments
                    }

                })
            }
        }
    }, [message])

    return (

        <AnimatePresence >
            <motion.div
                layout
                initial="collapsed"
                animate={isExpanded ? "expanded" : "collapsed"}
                variants={variants}
                onClick={toggleExpand}
                className="mt-2 chat-tool-capsule  inline-flex flex-col relative leading-[20px] py-[4px] text-xs bg-[var(--opengpts-chat-func-bg-color)]  rounded-3xl justify-start flex-wrap items-center text-[var(--opengpts-secondary-text-color)] mb-[6px] cursor-pointer"
            >

                <div className="flex items-center justify-center pl-2 pr-3">
                    <div className="relative w-[20px] h-[20px] flex justify-center items-center mr-[3px] transition-all duration-300">
                        <div className="flex items-center transition-all duration-300 scale-100 icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 20 20"
                                fill="none"
                                className="text-[--opengpts-chat-error-color]">
                                <path
                                    d="M16.53 14.3598C15.1928 14.2604 13.9059 13.7639 12.866 12.8699C10.8351 13.3167 8.90427 13.9626 6.97306 14.7571C5.43789 17.4884 4.00181 18.8784 2.76369 18.8784C2.51618 18.8784 2.21901 18.8286 2.02105 18.6798C1.47625 18.4315 1.1792 17.8852 1.1792 17.3393C1.1792 16.8922 1.27806 15.6505 5.98292 13.6151C7.07181 11.6287 7.91366 9.59264 8.6071 7.45766C8.01287 6.26596 6.72555 3.33615 7.61684 1.84682C7.91366 1.30042 8.50824 1.00256 9.15201 1.05224C9.64714 1.05224 10.1423 1.30054 10.4391 1.69777C11.0832 2.59172 11.0336 4.47829 10.1915 7.25916C10.9841 8.74884 12.0241 10.0892 13.2619 11.2317C14.302 11.033 15.3416 10.8838 16.3817 10.8838C18.7091 10.9334 19.0556 12.0263 19.0065 12.6711C19.0064 14.3598 17.3723 14.3598 16.53 14.3598ZM2.66471 17.4385L2.81335 17.3881C3.50656 17.1402 4.05124 16.6438 4.44751 15.9982C3.70452 16.2963 3.11029 16.7933 2.66471 17.4385ZM9.25087 2.54169H9.102C9.05257 2.54169 8.95359 2.54169 8.90415 2.59161C8.70596 3.43552 8.85496 4.32947 9.20156 5.12394C9.49838 4.27979 9.49838 3.38572 9.25087 2.54169ZM9.59759 9.74181L9.54781 9.84129L9.49826 9.79149C9.05245 10.9333 8.55743 12.076 8.01252 13.168L8.11162 13.1185V13.2174C9.20156 12.82 10.3897 12.4731 11.4794 12.2249L11.4295 12.175H11.5781C10.835 11.4296 10.142 10.5857 9.59759 9.74181ZM16.3322 12.3737C15.8866 12.3737 15.4904 12.3737 15.0446 12.4732C15.5396 12.7209 16.0349 12.8201 16.5299 12.87C16.8772 12.9198 17.2233 12.87 17.5204 12.7709C17.5204 12.6215 17.3224 12.3737 16.3322 12.3737Z"
                                    fill="currentColor"></path>
                            </svg>
                        </div>
                    </div>


                    <span className="flex-shrink-0 "> {message.role !== 'function' ? 'Used' : 'Running'}:</span>
                    <span className="text-[var(--opengpts-primary-text-color)] ml-1">
                        {functionCallInfo?.name}
                    </span>
                    <div className="px-1">
                        {status === 'running' && <Spin size='small'></Spin>}
                    </div>
                </div>


                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-2 details-panel"
                        >
                            <Markdown>
                                {message?.content || '请稍等...'}
                            </Markdown>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div >
        </AnimatePresence >


    )
}


export default FunctionMessage