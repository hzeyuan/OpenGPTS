import type PRAWorkflow from "@opengpts/types/rpa/workflow";
import { Checkbox, Input, Slider } from "antd";
import { forwardRef, useState,useEffect } from "react";

const EditNewTab = forwardRef<any, any>(({ nodeId, initialData, onUpdate }, ref) => {

    const [data, setData] = useState(initialData);

    useEffect(()=>{
        setData(initialData)
    },[initialData])

    const updateData = (newValues: Partial<PRAWorkflow.Block['data']>) => {
        const updatedData = { ...data, ...newValues };
        setData(updatedData);
        onUpdate?.(updatedData); // 传递更新给父组件或外部处理函数
    };

    return (
        <div>
            <Input.TextArea
                value={data?.description}
                placeholder="Common description"
                className="w-full"
                onChange={(e) => updateData({ description: e.target.value })}
            />

            {!data?.activeTab && (
                <div className="flex flex-col mt-2">
                    <label htmlFor="new-tab-url" className="my-1 text-sm">
                        New Tab URL
                    </label>
                    <Input.TextArea
                        id="new-tab-url"
                        value={data?.url}
                        rows={1}
                        className="w-full"
                        autoComplete="off"
                        placeholder="http://example.com/"
                        onChange={(e) => updateData({ url: e.target.value })}
                    />
                </div>
            )}
            <div className='flex flex-col mt-2'>
                <Checkbox
                    checked={data?.updatePrevTab}
                    className="mt-2 leading-tight"
                    title="Update Previous Tab"
                    onChange={(e) => updateData({ updatePrevTab: e.target.checked })}
                >
                    Update Previous Tab Text
                </Checkbox>
                <Checkbox
                    checked={data?.waitTabLoaded}
                    className="mt-2 leading-tight"
                    title="Wait for Tab to Load"
                    onChange={(e) => updateData({ waitTabLoaded: e.target.checked })}
                >
                    Wait until the tab is loaded
                </Checkbox>
                <Checkbox
                    checked={data?.active}
                    className="my-2"
                    onChange={(e) => updateData({ active: e.target.checked })}
                >
                    Set as a active Tab
                </Checkbox>
            </div>
            {/* {browserType === 'chrome' && (
                <>
                    <Checkbox
                        checked={data?.inGroup}
                        onChange={(e) => updateData({ inGroup: e.target.checked })}
                    >
                        Add Tab to Group
                    </Checkbox>
                    <Checkbox
                        checked={data?.customUserAgent}
                        className="mt-2"
                        onChange={(e) => updateData({ customUserAgent: e.target.checked })}
                    >
                        Custom User Agent
                    </Checkbox>
                </>
            )} */}
            <div className="mt-4">
                <p>Tab Zoom</p>
                <Slider
                    min={0.25}
                    max={4.5}
                    step={0.25}
                    value={data?.tabZoom || 1}
                    onChange={(value) => updateData({ tabZoom: value })}
                />
            </div>
        </div>
    )
})

export default EditNewTab;