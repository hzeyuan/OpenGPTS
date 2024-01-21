import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, message, Spin } from 'antd';
import { sendToBackground } from '@plasmohq/messaging';
import _ from 'lodash';
const GPTForm: React.FC<{
    gizmo?: Gizmo
    onFinish?: (gizmo, values) => void
}> = ({ gizmo, onFinish }) => {

    console.log('gizmo', gizmo)

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false)
    const [messageApi, contextHolder] = message.useMessage();
    const handleFinish = async (values) => {


        setLoading(true)
        console.log('Received values of form: ', values);
        if (!gizmo) return;
        const promptStarters = _.compact(values.prompt_starters)


        await sendToBackground({
            name: 'openai',
            body: {
                action: 'update',
                gizmoId: gizmo.id,
                draft: gizmo.tags[0] === 'private',
                gizmo: {
                    display: {
                        name: values.title,
                        description: values.description,
                        prompt_starters: promptStarters
                    },
                    instructions: values.instructions,
                },

            }
        })
        messageApi.success('更新成功');
        setLoading(false)
        onFinish && onFinish(gizmo, values)
    };

    return (
        <Spin spinning={loading}>
            <Form
                layout='vertical'
                initialValues={{
                    title: gizmo?.display.name,
                    description: gizmo?.display.description,
                    prompt_starters: gizmo?.display.prompt_starters,
                    instructions: gizmo?.instructions,
                }}
                form={form} name="custom_form" onFinish={handleFinish}>
                <Form.Item
                    name="title"
                    label="Title"
                    rules={[{ required: true, message: '请输入标题!' }]}
                >
                    <Input placeholder="请输入标题" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: '请输入描述!' }]}
                >
                    <Input.TextArea placeholder="请输入描述" />
                </Form.Item>

                <Form.Item label="Prompt Starters" >
                    {/* {JSON.stringify(gizmo?.display?.prompt_starters)} */}
                    <Row gutter={8}>
                        {(gizmo?.display?.prompt_starters || ['', '', '', '']).map((starters, index) => (
                            <Col span={12} key={index}>
                                <Form.Item
                                    name={['prompt_starters', index]}
                                    rules={[{ required: true, message: `请输入starter ${index + 1}!` }]}
                                >
                                    <Input placeholder={`请输入starter`} />
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>
                </Form.Item>

                <Form.Item
                    name="instructions"
                    label="instructions"
                    rules={[{ required: true, message: 'Please Input instructions!' }]}
                >
                    <Input.TextArea
                        minLength={64}
                        placeholder="请输入 instructions" />
                </Form.Item>

                <Form.Item>
                    <div className='flex justify-end'>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </div>
                </Form.Item>
                {contextHolder}
            </Form>
        </Spin>

    );
};

export default GPTForm;
