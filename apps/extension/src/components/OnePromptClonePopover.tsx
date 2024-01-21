import { sendToBackground } from "@plasmohq/messaging";
import Button from "antd/es/button";
import TextArea from "antd/es/input/TextArea";
import Popover from "antd/es/popover";
import { useState } from "react";
import _ from "lodash";
import { Select, Space, message } from "antd";
import type { NotificationInstance } from "antd/es/notification/interface";
import { useTranslation } from "react-i18next";

const PromptTextArea = ({ value, onChange }) => {
    return (
        <div className="w-full">
            <TextArea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Controlled autosize"
                autoSize={{ minRows: 3, maxRows: 5 }}
            />
        </div>
    )

}

const OnePromptClonePopover: React.FC<{
    gizmo?: Gizmo,
    children
    notificationApi: NotificationInstance
}> = ({ gizmo, children, notificationApi }) => {


    const [prompt, setPrompt] = useState('')
    const [tools, setTools] = useState(['browser', 'dalle'])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const { t, i18n } = useTranslation();


    const handleGenerateName = async () => {
        const prefix = gizmo ? `参考信息name:${gizmo.display.name}
        |desc:${gizmo.display.description}\n` : ''
        const result = await sendToBackground({
            name: 'openai',
            body: {
                action: 'chatWithWeb',
                session: {
                    question: `As a GPTs builder, create a one-sentence name for the given user request, Inside, there is a title for GPTs and a colloquial name provided by the user. Ensuring that the name are succinct, fitting, and align with the user's input language. For example: - User Request: '{Input: Create a GPT for automatic research paper summarization}' Expected Output: 'name: ChatPaper.' - User Request: '{Input:Create a GPT for emotional chatting}' Expected Output: 'name: Virtual Friend' - User Request: '{Input:帮我创建一个logo创建gpts}' Expected Output: 'name: Logo创建机器人' Your task: Based on the user request '{}', formulate a suitable title and name in the format 'name: xxx.'" Current User Request:{Title: , Input:${prompt}`,
                },
            }
        })
        console.log('handleGenerateName', result)

        if (!result.ok) {
            throw new Error(`Create GPTs Name Error:${result.error}`)
        }

        // 提取名称
        const output = result.data.replace(/[\n\r:'":：]/g, '').toLowerCase();
        const name = output.split('name')[1]?.trim();

        console.log('name', name)

        return name
    }

    const handleGenerateDesc = async () => {
        const prefix = gizmo ? `参考信息name:${gizmo.display.name}
        |desc:${gizmo.display.description}\n` : ''
        const result = await sendToBackground({
            name: 'openai',
            body: {
                action: 'chatWithWeb',
                session: {
                    question: `As a GPTs builder, create a one-sentence description for the given user' request, Inside, there is a title for GPTs and a colloquial description provided by the user. Ensuring that the description are succinct, fitting, and align with the user's input language. For example: - User Request: '{Title: ChatPaper, Input: Create a GPT for automatic research paper summarization}' Expected Output: 'Description: An AI-driven tool for concise and accurate summarization of research papers.' - User Request: '{Title:Virtual Friend, Input:Create a GPT for emotional chatting}' Expected Output: 'Description: A chatbot designed to understand and respond to emotional conversations.' - User Request: '{Title: Logo创建机器人. Input:帮我创建一个logo创建gpts}' Expected Output: 'Description: 一个智能AI工具，用于创造和定制公司标志。' Your task: Based on the user request '{}', formulate a suitable title and description in the format 'Description: xxx.'" Current User Request:{Input:${prompt}`,
                },
            }
        })
        if (!result.ok) {
            throw new Error(`Create GPTs Desc Error:${result.error}`)
        }

        const output = result.data.replace(/[\n\r:'":：]/g, '').toLowerCase();
        const desc = output?.split('description')[1]?.trim()

        console.log('desc', desc, output)

        return desc
    }

    const handleGenerateStarters = async () => {
        const prefix = gizmo ? `参考信息name:${gizmo.display.name}
        |desc:${gizmo.display.description}\n` : ''
        const result = await sendToBackground({
            name: 'openai',
            body: {
                action: 'chatWithWeb',
                session: {
                    question: `I am Conversation Starter Generator, a specialized GPT designed to craft engaging and contextually appropriate conversation starters based on given titles and descriptions. My primary function is to analyze the provided title and description, then generate four unique conversation starters that align with the theme and tone of the given topic. I aim to create starters that are succinct, thought-provoking, and suitable for initiating discussions or further inquiry into the subject matter. In doing so, I consider the nuances of the topic to ensure relevance and engagement. When provided with a title and description, I will not delve into creating detailed content or responses beyond the scope of conversation starters. My focus remains strictly on crafting these initial phrases to spark interest and dialogue. Additionally, I maintain a neutral and informative tone, ensuring that the conversation starters are versatile and can be adapted to various conversational settings.
                    Create conversation starters for:${prompt}`,
                },
            }
        })

        if (!result.ok) {
            throw new Error(`Create GPTs Starters Error:${result.error}`)
        }
        const starters = result.data.match(/(?<=\d:\s).+?(?=\s*\d:|$)/g) || [];

        console.log('starters', starters)

        return _.filter(starters, (item) => item.trim());

    }

    const handleGeneratePrompt = async (name, desc) => {
        const prefix = gizmo ? `参考信息name:${gizmo.display.name}
        |desc:${gizmo.display.description}\n` : ''
        const result = await sendToBackground({
            name: 'openai',
            body: {
                action: 'chatWithWeb',
                session: {
                    question: `Your task is to reverse-engineer GPT prompts based on user inputs. You'll receive a title, a description, and four conversation starters from the user. Using these, you will generate a corresponding GPTs prompt that align with the provided information.
                    my input:title:${name},desc:${desc}`,
                },
            }
        })
        if (!result.ok) {
            throw new Error(`Create GPTs Prompt Error:${result.error}`)
        }

        console.log('handleGeneratePrompt', result)
        // 提取名称
        // const answer = result.data.split('prompt:')[1]?.trim()
        return result.data
    }

    const handleConfirm = async () => {
        try {
            setLoading(true)
            const result = await sendToBackground({
                name: 'openai',
                body: {
                    action: 'checkGPTWebAuth',
                },
            })

            const error = result?.error
            console.log('checkGPTWebAuth', result)

            if (error) {
                const openOpenAI = () => {
                    window.open('https://chat.openai.com/', '_blank')
                    notificationApi.destroy()
                }
                const onClose = () => {
                    notificationApi.destroy()
                }
                const key = `createGPT`;
                const btn = (
                    <Space>
                        <Button type="primary" size="small" onClick={openOpenAI}>
                            open OpenAI
                        </Button>
                        <Button type="link" size="small" onClick={onClose}>
                            Close
                        </Button>
                    </Space>
                );
                notificationApi.open({
                    message: 'SomeThing Wrong',
                    description: error,
                    btn,
                    key,
                    onClose: close,
                });
                return
            }

            const name = await handleGenerateName()
            const desc = await handleGenerateDesc()
            const starters = await handleGenerateStarters()
            const instructions = await handleGeneratePrompt(name, desc)
            console.log('name', name)
            console.log('desc', desc)
            console.log('prompt', prompt)
            console.log('starters', starters)

            const GPTsResult: {
                data: Gizmo,
                error: string
            } = await sendToBackground({
                name: 'openai',
                body: {
                    action: 'create',
                    gizmo: {
                        display: {
                            name,
                            description: desc || "",
                            prompt_starters: starters,
                            welcome_message: ""
                        },
                        instructions: instructions
                    },
                    tools: tools
                }
            })
            const newGizmo = GPTsResult.data
            notificationApi.success({
                message: 'Create GPTs Success',
                description: <div>You can See At <a href={newGizmo.short_url} target="_blank"> {newGizmo.short_url}</a></div>
            });
            console.log('newGizmo', newGizmo)

        } catch (error) {
            message.error(error.message)
        } finally {
            setLoading(false)
            setOpen(false)
            setPrompt('')
        }






    }
    const handleClose = () => {
        setOpen(false)
    }
    const content = (
        <div>
            <h3 className="pb-3 text-sm font-normal text-gray-500 ">{t('onePromptCreationText')}</h3>
            <PromptTextArea value={prompt} onChange={setPrompt} ></PromptTextArea>
            <div className="block py-2 font-medium text-token-text-primary">{t('capabilitiesLabel')}</div>
            <div className="pb-2">
                <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Please select"
                    value={tools}
                    defaultValue={tools}
                    onChange={(value) => setTools(value)}
                    options={[
                        {
                            label: t('webBrowsing'),
                            value: 'browser',
                        }, {
                            label: t('imageGeneration'),
                            value: 'dalle'
                        }, {
                            label: t('codeInterpreter'),
                            value: 'python'
                        }
                    ]}
                />
            </div>
            {/* 确定，关闭 */}
            <footer className="flex items-center justify-end mt-2 gap-x-2 ">
                <Button onClick={handleClose} type="link" size="small">{t('Cancel')}</Button>
                <Button loading={loading} onClick={handleConfirm} type="primary" size="small">{t('Confirm')}</Button>

            </footer>
        </div>
    )

    return (
        <Popover
            title={t('selectLanguageTitle')}
            trigger="click"
            open={open}
            content={content}>
            <div onClick={() => setOpen(true)}>
                {children}
            </div>

        </Popover>
    )
}
export default OnePromptClonePopover