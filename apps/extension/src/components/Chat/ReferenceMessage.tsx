import { CloseCircleFilled } from "@ant-design/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { QuoteMessage } from "@opengpts/types";
import useChatQuoteStore from "~src/store/useChatQuoteStore";

const ReferenceMessage: React.FC<{
    message?: QuoteMessage
    chatId: string
}> = ({ chatId }) => {
    const [show, setShow] = useState<boolean>(false); // 初始设置为 true 以显示组件
    const quotes = useChatQuoteStore((state) => state.quotes)
    const quoteMessage = quotes.find((quote) => quote.chatId === chatId)

    const handleClose = () => { setShow(false); } // 设置为 false 将触发淡出动画然后组件消失}
    useEffect(() => {
        setShow(!!quoteMessage?.quote)
    }, [quoteMessage])

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ scale: 0 }} // 开始时缩放为0
                    animate={{ scale: 1 }} // 动画结束时缩放为1
                    exit={{ scale: 0 }} // 退出时缩放为0
                    transition={{ duration: 0.3 }} // 动画持续时间为0.3秒
                    className="flex items-center p-2"
                >
                    <span className="px-2 py-1 overflow-hidden text-xs text-gray-400 bg-[#E8E8E8] rounded-md shadow-sm line-clamp-2 max-h-[4.5rem]">
                        {quoteMessage?.quote?.content}
                    </span>
                    {/* 如果你需要关闭图标，取消注释以下行 */}
                    <CloseCircleFilled onClick={handleClose} className="w-4 h-4 ml-2 text-[#E8E8E8] cursor-pointer" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default ReferenceMessage