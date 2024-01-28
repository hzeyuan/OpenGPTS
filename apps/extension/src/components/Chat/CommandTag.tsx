import { CloseOutlined } from "@ant-design/icons"
import { Tag } from "antd"
import { useCallback } from "react"
import useChatCommandStore from "~src/store/useChatCommandStore"

const CommandTag = ({ chatId }) => {

    const getCommand = useChatCommandStore((state) => state.getCommand)
    const setChatCommand = useChatCommandStore((state) => state.setCommand)
    const handleClose = useCallback(() => {
        setChatCommand(chatId, undefined)
    }, [chatId])
    const chatCommand = getCommand(chatId)

    return (chatCommand && <Tag
        onClose={handleClose}
        closeIcon={<CloseOutlined className="    text-slate-700 px-0.5" />}
        bordered={false}
        color='cyan'
        className="bg-[var(--opengpts-switchbar-bg-color)] " closable>
        <span className="text-[#8a57ea]">{chatCommand.name}
        </span></Tag>)
}

export default CommandTag
