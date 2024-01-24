import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Row, Col, message, Spin } from 'antd';
import { sendToBackground } from '@plasmohq/messaging';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import type { Gizmo } from '@repo/types';
const GPTForm: React.FC<{
    gizmo?: Gizmo
    onFinish?: (gizmo, values) => void
}> = ({ gizmo, onFinish }) => {

    console.log('gizmo', gizmo)

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false)
    const [messageApi, contextHolder] = message.useMessage();
    const { t } = useTranslation();
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
                        name: values.name,
                        description: values.description,
                        prompt_starters: promptStarters
                    },
                    instructions: values.instructions,
                },

            }
        })
        messageApi.success(t('updateSuccess', { name: values.name }));
        setLoading(false)
        onFinish && onFinish(gizmo, values)
    };

    useEffect(() => {
        console.log('gizmo',gizmo)
        if (!gizmo) return;
        form.setFieldsValue({
            name: gizmo?.display.name,
            description: gizmo?.display.description,
            prompt_starters: gizmo?.display.prompt_starters,
            instructions: gizmo?.instructions,
        });
    }, [gizmo]);

    return (
        <Spin spinning={loading}>
            <Form
                layout='vertical'
                initialValues={{
                    name: gizmo?.display.name,
                    description: gizmo?.display.description,
                    prompt_starters: gizmo?.display.prompt_starters,
                    instructions: gizmo?.instructions,
                }}
                form={form} name="custom_form" onFinish={handleFinish}>
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Name your GPT!' }]}
                >
                    <Input placeholder="Name your GPT" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Add a short description about what this GPT does!' }]}
                >
                    <Input.TextArea placeholder="Add a short description about what this GPT does" />
                </Form.Item>

                <Form.Item label="Prompt Starters" >
                    <Row gutter={8}>
                        {(gizmo?.display?.prompt_starters
                            ? [...gizmo.display.prompt_starters, ...Array(12 - gizmo.display.prompt_starters.length).fill('')]
                            : Array(12).fill('')
                        ).map((starters, index) => (
                            <Col span={12} key={index}>
                                <Form.Item
                                    name={['prompt_starters', index]}
                                    rules={[{ required: false, }]}
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
                    rules={[{ required: false }]}
                >
                    <Input.TextArea
                        minLength={64}
                        placeholder="What does this GPT do? How does it behave? What should it avoid doing?" />
                </Form.Item>

                <Form.Item>
                    <div className='flex justify-end'>
                        <Button type="primary" htmlType="submit">
                            Confirm
                        </Button>
                    </div>
                </Form.Item>
                {contextHolder}
            </Form>
        </Spin>

    );
};

export default GPTForm;
