import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import Markdown from "../Markdown";
import _ from 'lodash';
import { Spin, Tag } from "antd";
import { useTranslation } from "react-i18next";

const FunctionMessage = ({ message }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleExpand = () => setIsExpanded(!isExpanded);
    const { t } = useTranslation();

    const functionInfo = useMemo(() => {
        console.log('message', message)
        return message['data']
    }, [message])

    /**
     * 根据消息的状态，返回对应的状态值。
     * start: has message.function_call and is string type,because:the llm will output string until the string can be parsed to json
     * running: when message has function_call and is object type or functionInfo.status is running
     * finished: when functionInfo.status is finished
     * error: when message.isError is true
     */
    const status = useMemo(() => {
        console.log('mes')
        if (message.isError) return 'error';


        if (functionInfo?.status === 'finished') return 'finished';
        if (message?.function_call && _.isString(message.function_call)) return 'start';
        if (message?.function_call && _.isObject(message.function_call) || functionInfo.status === 'running') return 'running';
    }, [message]);


    const toolName = useMemo(() => {
        return functionInfo?.name || message?.function_call?.name
    }, [functionInfo, message])

    const toolImg = useMemo(() => {
        return functionInfo?.img
    }, [functionInfo])

    const contentVariants = {
        hidden: {
            opacity: 0,
            maxHeight: 0,
            overflow: 'hidden',
            transition: { duration: 0.3, ease: 'easeInOut' }
        },
        visible: {
            opacity: 1,
            maxHeight: 500, // 假设内容不会超过这个高度，可以根据实际情况调整
            transition: { duration: 0.3, ease: 'easeInOut' }
        },
    };

    return (
        <AnimatePresence>
            <div className="my-2 rounded shadow-sm"
                style={{
                    width: isExpanded ? 'auto' : 'fit-content',
                    border: '1px solid var(--opengpts-function-border-color)'
                }}>
                <motion.div
                    className="flex items-center justify-between px-2 py-1 rounded cursor-pointer gap-x-2"
                    initial={false}
                    onClick={toggleExpand}
                >
                    <div className="flex items-center gap-x-2">
                        {status === 'start' && <>
                            <Spin size={'small'} className="w-4 h-4"></Spin>
                            <span className="text-sm text-[var(--opengpts-primary-title-color)]">{t('tools.searchWhatToolToUse')}</span>
                        </>}

                        {status === 'running' && <>
                            {functionInfo?.img ? <img className="w-4 h-4" src={toolImg} alt="" ></img> : <Spin size="small" className="w-4 h-4"></Spin>}
                            <span className="text-sm text-[var(--opengpts-primary-title-color)]">{toolName}</span>
                            <span> <Spin size='small'></Spin> </span>
                        </>}

                        {status === 'finished' && <>
                            {functionInfo?.img && <img className="w-4 h-4" src={toolImg} alt="" ></img>}
                            <span className="text-sm text-[var(--opengpts-primary-title-color)]">{toolName}</span>
                            <CheckCircle2 size={18} color="green" />
                        </>}

                    </div>
                    {isExpanded ? <ChevronUp color="var(--opengpts-primary-title-color)" width={18} height={18} /> : <ChevronDown color="var(--opengpts-primary-title-color)" width={18} height={18} />}
                </motion.div>

                {isExpanded && (
                    <motion.div
                        className="flex flex-col p-2"
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        <div className="py-2"> <Tag >Request</Tag></div>
                        <div className="px-4 py-1 text-sm rounded bg-[var(--opengpts-chat-ai-bubble-bg-color)] ">
                            <Markdown
                            >{functionInfo?.requestPayload}</Markdown>
                        </div>
                        <div className="py-2"> <Tag>Response</Tag></div>
                        <div className="px-4 py-1 text-sm rounded bg-[var(--opengpts-chat-ai-bubble-bg-color)] ">
                            <Markdown>
                                {message?.content || '请稍等...'}
                            </Markdown>
                        </div>

                    </motion.div>
                )}

            </div>
        </AnimatePresence>
    );
};

export default FunctionMessage;
