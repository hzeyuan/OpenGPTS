import { create } from "zustand";
import type { QuoteMessage } from "@opengpts/types";

interface QuoteState {
    quotes: {
        chatId: string;
        quote?: QuoteMessage;
    }[];
    setQuote: (chatId: string, quote?: QuoteMessage) => void;
    getQuote: (chatId: string) => QuoteMessage | undefined;
}

const useChatQuoteStore = create<QuoteState>((set, get) => ({
    quotes: [], // 初始引用消息数组
    getQuote: (chatId) => {
        const { quotes } = get();
        const quoteEntry = quotes.find(entry => entry.chatId === chatId);
        return quoteEntry?.quote;
    },
    setQuote: (chatId, quote) => {
        set(state => {
            const existingIndex = state.quotes.findIndex(entry => entry.chatId === chatId);
            if (existingIndex !== -1) {
                // 如果找到了相应的 chatId，更新 quote
                const updatedQuotes = [...state.quotes];
                updatedQuotes[existingIndex] = { ...updatedQuotes[existingIndex], quote };
                return { quotes: updatedQuotes };
            } else {
                // 如果没有找到，添加新的引用
                return { quotes: [...state.quotes, { chatId, quote }] };
            }
        });
    }
}));

export default useChatQuoteStore;
