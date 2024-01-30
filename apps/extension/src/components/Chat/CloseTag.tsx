import { CloseOutlined } from "@ant-design/icons"
import { Tag } from "antd"

const CloseTag: React.FC<{
    icon?: React.ReactNode
    label: string
    prefix?: React.ReactNode | string
    chatId?: string
    color?: string
    onClose?: () => void
}> = ({ icon, label, prefix, chatId, color, onClose }) => {

    const handleClose = () => onClose && onClose()

    return (<Tag
        onClose={handleClose}
        closeIcon={<CloseOutlined className="text-slate-700 px-0.5" />}
        bordered={false}
        color={color}
        className=" flex justify-center items-center   w-fit bg-[var(--opengpts-switchbar-bg-color)] " closable>
        <div className="flex pr-1 text-sm ">{prefix}</div>
        {icon}
        <span className={`pl-0.5 text-[${color}]`}>{label}
        </span></Tag>)
}

export default CloseTag
