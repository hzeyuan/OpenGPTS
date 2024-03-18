import type PRAWorkflow from "@opengpts/types/rpa/workflow";
import { Checkbox, Input, Select } from "antd"
import { useState } from "react";

const EditInteractionBase = ({ initialData, onUpdate, children }) => {
    const [data, setData] = useState(initialData);

    const updateData = (newValues: Partial<PRAWorkflow.Block['data']>) => {
        const updatedData = { ...data, ...newValues };
        setData(updatedData);
        onUpdate?.(updatedData); // 传递更新给父组件或外部处理函数
    };

    const selectOptions = [
        { label: "Multiple", value: 'multiple' },
        { label: "Mark element", value: 'markEl' },
        { label: 'Wait for selector', value: 'waitForSelector' }
    ]

    return (
        <div className="flex flex-col gap-y-2">
            <h1>Description</h1>
            <Input.TextArea
                value={data?.description}
                placeholder="Common description"
                className="w-full"
                onChange={(e) => updateData({ description: e.target.value })}
            />

            <div className='my-2'>Find Element By</div>
            <Select
                value={data.findBy}
                options={[
                    { label: 'Css Selector', value: 'cssSelector' },
                ]}
            ></Select>

            <div className='my-2'>Element Selector value</div>

            <input
                name='selector'
                value={data?.selector}
                placeholder="Selector"
                type="text"
                className="w-full px-4 py-2 pl-2 transition bg-transparent rounded-lg bg-input"
                onChange={(e) => updateData({ selector: e.target.value })}
            />

            {selectOptions?.map((option) => {
                return (
                    <Checkbox
                        checked={data[option.value]}
                        className="mt-2 leading-tight"
                        title={option.label}
                        onChange={(e) => updateData({
                            [option.value]: e.target.checked,
                        })}
                    >
                        {option.label}
                    </Checkbox>
                )
            }
            )}

            {children}
        </div>
    )
}

export default EditInteractionBase;

