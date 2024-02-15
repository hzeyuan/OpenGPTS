import type { ToolRow } from "@opengpts/types";
import { Row, Col, Input } from "antd";
import { Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchExtensionTools } from "~src/app/services/tools";
const ToolsPanel = () => {
    const [search, setSearch] = useState('')
    const [tools, setTools] = useState<ToolRow[]>([])

    useEffect(() => {

        const initTools = async () => {
            // const builtins = await fetchBuiltinsTools();
            // setBuiltinsTools(builtins);
            try {
                const tools = await fetchExtensionTools();

                setTools(tools);
            } catch (error) {

            }
        };
        initTools();
    }, []);


    return (
        <div className="bg-[#f7f7fa] h-full">
            <div className="box-border h-full py-2 mx-4">
                <div className="text-2xl font-bold ">Tools </div>
                <div className="py-2 ">
                    <Input.Search></Input.Search>
                </div>

                <Row gutter={16}>
                    {tools.map((tool, index) =>
                    (<Col key={tool.tool_id} xs={24} sm={12} md={8} lg={6} xl={4} className="gutter-row" span={6}>
                        <div className=" bg-[#fff] rounded-lg   shadow-md cursor-pointer mb-4 overflow-hidden p-4  w-auto relative">
                            <img className=" h-9 w-9" src={'./favicon.ico'} alt="" />
                            <div className="mt-3 mb-2 text-lg font-semibold ">{tool.name}</div>
                            <div className="mt-2 text-xs font-normal ">{tool.author}</div>
                            <div className="mt-2 text-sm font-normal ">{tool.description}</div>
                            <div className="my-2">
                                <Tag>Web Search</Tag>
                            </div>
                        </div>
                    </Col>)
                    )}

                </Row>
            </div>
        </div>
    )
}

export { ToolsPanel }