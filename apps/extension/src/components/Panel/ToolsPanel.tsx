import { Col, Input, Row, Tabs, Tag, type TabsProps } from "antd";
import logo from "data-base64:~assets/icon.png"
const ToolsPanel = () => {
    const onChange = (key: string) => {
        console.log(key);
    };

    const style: React.CSSProperties = { background: '#0092ff', padding: '8px 0' };

    return (
        //    bg-[var(--opengpts-option-card-bg-color)]
        <div className="bg-[#f7f7fa] h-full">
            <div className="h-full py-2 mx-4 ">
            <div className="text-2xl font-bold ">Tools </div>
                <div className="py-2 ">
                    <Input.Search></Input.Search>
                </div>
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={8} lg={6} xl={4} className="gutter-row" span={6}>
                        <div className=" bg-[#fff] rounded-lg   shadow-md cursor-pointer mb-4 overflow-hidden p-4  w-auto relative">
                            <img className=" h-9 w-9" src={logo} alt="" />
                            <div className="mt-3 mb-2 text-lg font-semibold ">Google Web Search</div>
                            <div className="mt-2 text-xs font-normal ">OpenGPTs</div>
                            <div className="mt-2 text-sm font-normal ">Search any information and webpage URLs from Google.</div>
                            <div className="my-1">
                                <Tag>Web Search</Tag>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

        </div>
    )
}

export { ToolsPanel }