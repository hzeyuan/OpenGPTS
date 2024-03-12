import { InputNumber } from "antd";
import EditInteractionBase from "./EditInteractionBase"
import { useState } from "react";
import type PRAWorkflow from "@opengpts/types/rpa/workflow";

const EditScrollElement = ({ initialData, onUpdate }) => {
    const [data, setData] = useState(initialData);

    const updateData = (newValues: Partial<PRAWorkflow.Block['data']>) => {
        const updatedData = { ...data, ...newValues };
        setData(updatedData);
        onUpdate?.(updatedData); // 传递更新给父组件或外部处理函数
    };


    return (
        <EditInteractionBase onUpdate={onUpdate} initialData={initialData} >
            <div className="my-2">Scroll horizontal</div>
            <InputNumber value={data?.scrollX} onChange={(value) => {
                updateData({ scrollX: value })
            }} addonAfter={'px'} className="w-full" defaultValue={0} min={0} />
            <div className="my-2">Scroll vertical</div>

            <InputNumber
                onChange={((value) => {
                    updateData({ scrollY: value })
                })}
                value={data?.scrollY} addonAfter={'px'} className="w-full" defaultValue={0} min={0} />
        </EditInteractionBase>
    )
}


export default EditScrollElement;