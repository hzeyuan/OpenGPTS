import { CloseOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons"
import { Drawer, Input, Modal } from "antd"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { Chat } from "@opengpts/types"
import { useTimeAgo } from "~src/hooks/useTimeago"
import { nanoid } from '@opengpts/core/shared/utils';
import { useChatStore } from "~src/store/useChatStore"
import { useDebouncedCallback } from 'use-debounce';
import useChatDrawerStore from "~src/store/useChatDrawerStore"
import VirtualList from 'rc-virtual-list';
import { useChatPanelContext } from "../Panel/ChatPanel"
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

interface ChatHistoryDrawerProps {
    chatId: string;
}


const TitleInput = ({ defaultValue, onChange }) => {
    const [title, setTitle] = useState(defaultValue)

    return (
        <Input showCount defaultValue={title} value={title} onChange={(e) => {
            console.log('v', e.target.value)
            setTitle(e.target.value)
            onChange && onChange(e.target.value)
        }} />
    )
}


const ChatHistoryItem = ({ chat, onClick }: {
    chat: Chat,
    onClick?: (chatId: string) => void
}) => {

    const [modal, contextHolder] = Modal.useModal();
    const [title, setTitle] = useState(chat.title)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const updateChatId = useChatStore(state => state.updateChatId);
    const deleteChat = useChatStore(state => state.deleteChat);
    const updateChat = useChatStore(state => state.updateSome);
    const timeago = useTimeAgo(chat.created_at);

    const handleUpdateChatTitle = (e) => {
        e.stopPropagation()
        e.preventDefault();
        setIsModalOpen(true);
        const chatId = chat.chatId!
        const instance = modal.confirm({
            maskClosable: false,
            centered: true,
            title: 'Update Chat Title',
            content: <TitleInput defaultValue={title} onChange={(v: string) => setTitle(v)} />,
            onOk: () => {
                console.log('updateTitle', title)
                setTitle(prevTitle => {
                    console.log('updateTitle', prevTitle);
                    updateChat(chatId, { title: prevTitle });
                    return prevTitle;
                });
            },
            onCancel: (e) => {
                setIsModalOpen(false);
                instance.destroy()
            },
        });
    }

    const handleDeleteChat = (e) => {
        e.stopPropagation()
        e.preventDefault();
        setIsModalOpen(true);
        const chatId = chat.chatId
        const instance = modal.confirm({
            maskClosable: false,
            centered: true,
            title: 'Delete Chat',
            content: 'Are you sure to delete this chat?',
            onOk: () => {
                deleteChat(chatId)
                const newChatId = nanoid()
                updateChatId(newChatId)
            },
            onCancel: (e) => {
                setIsModalOpen(false);
                instance.destroy()
            },
        });
    }

    const handleGetChatMessage = (e) => {
        if (isModalOpen) {
            // 如果模态框是打开的，不执行任何操作
            return;
        }
        e.stopPropagation()
        console.log('history.chatId', chat.chatId)
        onClick && onClick(chat.chatId)
    }


    return (
        <div>
            <div onClick={handleGetChatMessage} className="chat-history-item p-3 relative rounded-xl cursor-pointer hover:bg-[var(--opengpts-sidebar-icon-bg-color)]">
                <div className="flex justify-between">
                    <div className="overflow-hidden text-sm font-bold title text-ellipsis whitespace-nowrap">
                        {chat.title}
                    </div>
                    <div className="time text-xs whitespace-nowrap ml-2 text-[var(--opengpts-secondary-text-color)]">
                        {timeago}
                    </div>
                </div>
                <div className="flex items-center justify-between gap-2 info-bottom">
                    <div className="desc text-ellipsis whitespace-nowrap overflow-hidden text-sm mt-1 text-[var(--opengpts-secondary-text-color)]">
                        {chat.latestReply}
                    </div>
                    <div className="flex items-center gap-1">
                        <span onClickCapture={handleUpdateChatTitle}>
                            <div className="remove-btn rounded-md h-[22px] flex justify-center items-center min-w-[22px] w-[22px] opacity-60 hover:bg-[#e4eaf6] hover:opacity-100">
                                <EditOutlined />
                            </div>
                        </span>
                        <span onClickCapture={handleDeleteChat}>
                            <div className="remove-btn rounded-md h-[22px] flex justify-center items-center min-w-[22px] w-[22px] opacity-60 hover:bg-[#e4eaf6] hover:text-[#ff4d4f] hover:opacity-100">
                                <DeleteOutlined />
                            </div>
                        </span>
                    </div>
                </div>
                {contextHolder}
            </div>
        </div>
    )
}

const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({ chatId }) => {

    const chatDrawers = useChatDrawerStore(state => state.chatDrawers);
    const { hideChatDrawer } = useChatDrawerStore();
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const chatList = useChatStore(state => state.chatList);
    // const sortedChatList = useMemo(() => sortChatList(chatList), [sortOrder, chatList]);
    const { setChatId } = useChatPanelContext()
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredChatList, setFilteredChatList] = useState(chatList);
    const { t } = useTranslation();
    const isChatDrawerVisible = useMemo(() => chatDrawers.some(drawer => drawer.chatId === chatId && drawer.isVisible), [chatDrawers]);


    const handleClick = (clickedChatId: string) => {
        setChatId(clickedChatId)
        hideChatDrawer(clickedChatId)
    }

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClose = () => {
        hideChatDrawer(chatId)
    }

    const handleProcessChatList = () => {
        let newChatList = [...chatList]
        if (!chatList.length) return [];
        const searchTermLower = searchTerm.toLowerCase(); // 小写化搜索词
        if (searchTerm !== '') {
            newChatList = _.filter(chatList, (item) => {
                return (item?.title ?? '').toLowerCase().includes(searchTermLower) ||
                    item?.latestReply.toLowerCase().includes(searchTermLower)
            });
        }
        const sortedChatList = sortOrder === 'asc'
            ? _.sortBy(newChatList, ['created_at'])
            : _.sortBy(newChatList, ['created_at']).reverse();
        setFilteredChatList(sortedChatList);
        return sortedChatList;
    }


    const debouncedSearch = useDebouncedCallback(handleProcessChatList, 500);

    const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => { };



    useEffect(() => {
        debouncedSearch()
    }, [searchTerm]);

    useEffect(() => {
        handleProcessChatList();
    }, [sortOrder, chatList.length]);



    return (
        <Drawer
            autoFocus={false}
            maskClosable={true}
            height={'80%'}
            styles={{ body: { padding: 0 } }}
            title={
                < div className="flex items-center justify-between" >
                    <div>{t('ChatHistory')}({chatList.length})</div>
                    <CloseOutlined onClick={handleClose} className="cursor-pointer " />
                </div >
            }
            getContainer={false}
            placement="bottom"
            closable={false}
            mask={false}
            onClose={handleClose}
            open={isChatDrawerVisible} >
            <div className="px-4 py-3 search-area">
                <Input
                    placeholder="Search"
                    style={{ height: '40px' }}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    prefix={<SearchOutlined size={24} />
                    }></Input>
            </div>

            <div className="flex flex-col flex-1 px-4 pb-3 overflow-y-auto chat-history-box custom-scrollbar">
                <VirtualList
                    height={400}
                    itemHeight={47}
                    data={filteredChatList}
                    onScroll={onScroll}
                    itemKey={(item) => item.chatId}
                >
                    {(item) => (
                        <ChatHistoryItem onClick={handleClick} key={item.chatId} chat={item}></ChatHistoryItem>)
                    }
                </VirtualList>

            </div>
        </Drawer >
    )
}


export {
    ChatHistoryDrawer,
}