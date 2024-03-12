import type PRAWorkflow from "@opengpts/types/rpa/workflow";
import { InputNumber } from "antd"
import { useState } from "react";

const EditDelay = ({ initialData, onUpdate }) => {
    const [data, setData] = useState(initialData);
    const updateData = (newValues: Partial<PRAWorkflow.Block['data']>) => {
        const updatedData = { ...data, ...newValues };
        setData(updatedData);
        onUpdate?.(updatedData); // 传递更新给父组件或外部处理函数
    };
    return (<div className="space-y-2">
        <div className="my-2">Delay time (millisecond)</div>
        <InputNumber
            min={0}
            onChange={(v) => updateData({ time: v })}
            value={data.time}
            className="w-full"></InputNumber>
    </div>)
}
export default EditDelay;