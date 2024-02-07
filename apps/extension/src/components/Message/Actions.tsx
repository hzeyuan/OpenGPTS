import React from 'react';
import { message as msgComp, Tooltip, Tag } from 'antd';
import { motion } from 'framer-motion';
import copy from 'copy-to-clipboard';
import type { OMessage } from '@opengpts/types';
import { CopyOutlined, MessageOutlined } from '@ant-design/icons';
import useChatQuoteStore from '~src/store/useChatQuoteStore';

const Actions: React.FC<{
    chatId: string,
    message: OMessage
}> = ({ chatId, message }) => {
    const [messageApi, contextHolder] = msgComp.useMessage();
    const setQuote = useChatQuoteStore(state => state.setQuote);
    const handleCopy = () => {
        copy(message.content.toString());
        messageApi.success('Copy Success');
    };

    const handleQuote = () => {
        const quoteMessage = {
            ...message,
            chatId: chatId,
        }
        console.log('chatId', chatId, quoteMessage)
        setQuote(chatId, quoteMessage);
    }

    // Framer Motion 动画变体
    const textVariants = {
        initial: {
            opacity: 0,
            width: 0,
            transition: { duration: 0.2 }
        },
        hover: {
            opacity: 1,
            width: 'auto',
            marginLeft: 4,
            transition: { duration: 0.2 }
        }
    };

    return (
        <>
            {contextHolder}
            <motion.div
                initial="initial"
                whileHover="hover"
                className="inline-flex items-center overflow-hidden "
            >
                <Tooltip title='Copy this message'>
                    <div onClick={handleCopy} className="cursor-pointer bg-[var(--opengpts-quote-bg-color)] px-1 py-0.5 text-sm rounded-sm" >
                        <CopyOutlined style={{ fontSize: '12px' }} />
                        <motion.span
                            variants={textVariants}
                            className='inline-block m-0   text-[12px]'
                            style={{ whiteSpace: 'nowrap', margin: 0 }}
                        >
                            Copy
                        </motion.span>
                    </div>
                </Tooltip>
            </motion.div>
            <motion.div
                initial="initial"
                whileHover="hover"
                className="inline-flex items-center overflow-hidden"
            >
                <Tooltip title='Quote this message'>
                    <div onClick={handleQuote} className="cursor-pointer  bg-[var(--opengpts-quote-bg-color)] px-1 py-0.5 rounded-sm">
                        <MessageOutlined style={{ fontSize: '12px' }} />
                        <motion.span
                            className='inline-block m-0 text-[12px]'
                            variants={textVariants}
                            style={{ whiteSpace: 'nowrap', margin: 0 }}
                        >
                            Quote
                        </motion.span>
                    </div>
                </Tooltip>
            </motion.div>
        </>
    );
};

export { Actions };
