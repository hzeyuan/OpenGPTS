import { CloseOutlined } from "@ant-design/icons"
import { Tag } from "antd"
import { useChatPanelContext } from "../Panel/ChatPanel"

const CommandTag = ({ chatId }) => {

    const { command, setCommand } = useChatPanelContext()
    const handleClose = () => setCommand(undefined)

    return (command && <Tag
        onClose={handleClose}
        closeIcon={<CloseOutlined className="text-slate-700 px-0.5" />}
        bordered={false}
        color='cyan'
        className="bg-[var(--opengpts-switchbar-bg-color)] " closable>
        <span className="text-[#8a57ea]">{command.name}
        </span></Tag>)
}

export default CommandTag
