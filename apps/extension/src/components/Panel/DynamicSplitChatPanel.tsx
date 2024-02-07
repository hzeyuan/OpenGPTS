import { CommentOutlined, CustomerServiceOutlined, QuestionCircleFilled, QuestionCircleOutlined } from "@ant-design/icons"
import { Popconfirm, Slider, Tooltip } from "antd"
import React, { useMemo, useRef, useState } from "react"
import { CommandCenter } from "../CommandCenter"
import twoLayoutSvg from "~assets/twoLayout.svg"
import threeLayoutSvg from "~assets/threeLayout.svg"
import fourLayoutSvg from "~assets/fourLayout.svg"
import sixLayoutSvg from "~assets/sixLayout.svg"
import oneLayoutSvg from "~assets/oneLayout.svg"
import ChatPanel from "./ChatPanel"
import { Storage } from "@plasmohq/storage"
import DynamicSplitPanel from "./DynamicSplitPanel"
import { nanoid } from "@opengpts/core/shared/utils"
import { useStorage } from "@plasmohq/storage/hook"



const DynamicSplitChatPanel = () => {
    const panelConfigs = [
        { num: 1, icon: oneLayoutSvg },
        { num: 2, icon: twoLayoutSvg },
        { num: 3, icon: threeLayoutSvg },
        { num: 4, icon: fourLayoutSvg },
        { num: 6, icon: sixLayoutSvg }
    ];

    const [splitPanelNum, setSplitPanelNum] = useState(1)
    const chatPanelRefs = useRef<any[]>([]);


    const [generalConfig] = useStorage({
        key: "generalConfig",
        instance: new Storage({
            area: "local"
        }),
    })

    const setChatPanelRef = (element, index) => {
        chatPanelRefs.current[index] = element;
    };


    const panels = useMemo(() => {
        return new Array(splitPanelNum).fill(null).map((_, index) => {
            const chatId = nanoid()
            return (<ChatPanel chatId={chatId} key={`chat-panel-${chatId}`} ref={(el) => setChatPanelRef(el, index)} />)
        });
    }, [splitPanelNum]);

    const handleChangeSplitPanelNum = (n: number) => {
        setSplitPanelNum(n)
    }

    const handleAllInputChange = (v: string) => {
        chatPanelRefs.current.forEach((chatPanelRef) => {
            chatPanelRef?.onInputChange(v)

        })
    }
    const handleAllSubmit = () => {
        chatPanelRefs.current.forEach((chatPanelRef) => {
            chatPanelRef?.handleSubmit()
        })
    }

    const setAllChatPanelInputArea = (res) => {
        chatPanelRefs.current.forEach((chatPanelRef) => {
            chatPanelRef?.setHideInputArea(res)
        })
    }


    return <div className="flex flex-col h-full ">
        <DynamicSplitPanel
            panels={panels}
            splitPanelNum={splitPanelNum}
        />
        <div className="box-border w-full px-4 py-2 ">
            <div className='flex items-center'>
                <div className="flex flex-row items-center h-6 gap-1 bg-primary-background rounded-2xl">
                    {/* <div>
                        <Tooltip title='Switch panel number for multiple conversations'>
                            <QuestionCircleOutlined className="justify-center w-6 h-6" />
                        </Tooltip>
                    </div> */}
                    <div className="mr-[6px] text-xs text-[--opengpts-primary-color] flex items-center gap-[2px] group">
                        <div>{generalConfig?.mode}</div>
                    </div>
                    {panelConfigs.map(({ num, icon }) => (
                        <div
                            key={`split-panel-${num}`}
                            onClick={() => handleChangeSplitPanelNum(num)}
                            className={`flex rounded-[6px]  hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] ${splitPanelNum === num ? 'bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)]' : ''}`}
                        >
                            <img src={icon} className="w-6 h-6 cursor-pointer" />
                        </div>
                    ))}
                </div>
                <div className="flex-1 pl-2">
                    <CommandCenter
                        setAllChatPanelInputArea={setAllChatPanelInputArea}
                        onAllSubmit={handleAllSubmit}
                        onInputChange={handleAllInputChange} />
                </div>
            </div>
        </div>
    </div>
}

export default DynamicSplitChatPanel
