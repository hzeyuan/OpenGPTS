import { Button, Input, Select, Space } from "antd"
import { useEffect, useState } from "react"

const CommandCenter = ({
    onInputChange,
    onAllSubmit,
    setAllChatPanelInputArea
}) => {

    const [canSend, setCanSend] = useState<boolean>(false)
    const [value, setValue] = useState<string>("")
    const [hideInputArea, setHideInputArea] = useState<boolean>(false)
    const options = [
        { label: '', value: 'Zhejiang' },
        { label: 'Jiangsu', value: 'Jiangsu' },
    ]

    const handleSubmit = () => {
        onAllSubmit()
        setValue("")
    }
    const handleKeyDown = (e) => {
        if (e.code === "Enter") {
            handleSubmit()
        }
    }

    const suffix = <div
        onClick={handleSubmit}

        className={` ${canSend
            ? "text-[#8a57ea]   cursor-pointer"
            : ""
            }  send-btn pl-[2px] h-[24px] w-[24px] rounded-[50%] round  text-base flex justify-center items-center `}>
        <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
                d="M1.94138 13.0289C1.56433 13.2174 1.13755 12.8833 1.22994 12.472L2.35112 7.481L9.82664 7.013L2.35112 6.506L1.23055 1.52846C1.13795 1.1171 1.5648 0.782866 1.94194 0.971426L13.9999 7L1.94138 13.0289Z"
                fill="currentColor"></path>
        </svg>
    </div>


    const handleChange = (e) => {
        setValue(e.target.value)
        onInputChange && onInputChange(e.target.value)
    }
    // const handle÷
    // setAllChatPanelInputArea

    useEffect(() => {
        if (value) {
            setCanSend(true)
        } else {
            setCanSend(false)
        }

    }, [value])

    useEffect(() => {
        setAllChatPanelInputArea(hideInputArea)
    }, [hideInputArea])

    return (
        <div className="flex">
            < Input
                placeholder="input something ... all in one" onKeyDown={handleKeyDown} value={value} onChange={handleChange} suffix={suffix} size="small" defaultValue="" />
            <Button onClick={() => {
                setHideInputArea(!hideInputArea)
            }} className="ml-1">{
                    hideInputArea ? "Show" : "Hide"
                }</Button>
        </div>
    )
}

export {
    CommandCenter
}