import { sendToBackground } from "@plasmohq/messaging";
import Button from "antd/es/button";
import TextArea from "antd/es/input/TextArea";
import Popover from "antd/es/popover";
import { useState } from "react";
import _ from "lodash";
import { Select, Space } from "antd";
import type { NotificationInstance } from "antd/es/notification/interface";

const PromptTextArea = ({ onChange }) => {
    return (
        <div className="w-full">
            <TextArea
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


    const handleGenerateName = async () => {
        const prefix = gizmo ? `参考信息name:${gizmo.display.name}
        |desc:${gizmo.display.description}\n` : ''
        const result = await sendToBackground({
            name: 'openai',
            body: {
                action: 'chatWithWeb',
                session: {
                    question: `As a GPTs builder, create a one-sentence name for the given user request, Inside, there is a title for GPTs and a colloquial name provided by the user. Ensuring that the name are succinct, fitting, and align with the user's input language. You need to find the keywords of User Request and, based on the corresponding background knowledge of the keywords, create a GPTs title that meets the requirements. You can refer to the naming conventions used in the following demos.

                    For example: 
                    Demo1:
                    - User Request: '{Input: Create a GPT for automatic research paper summarization}' 
                    Expected Output: 'name: ChatPaper or AI PDF or ChatDoc' 
                    Demo2:
                    - User Request: '{Input:Create a GPT for emotional chatting}' 
                    Expected Output: 'name: Virtual Friend' 
                    Demo3:
                    - User Request: '{Input:帮我创建一个logo创建gpts}' 
                    Expected Output: 'name: Logo创建机器人 or LogoBot or LogoGPTs'
                    Demo4:
                    - User Request: '{Input:帮我创建一个黄蓉GPTs}' 
                    Expected Output: 'name: 黄蓉GPTs' or 'HuangRongBot' or 'HuangRongGPTs'

                    Your task: Based on the user request '{}', formulate a suitable title and name in the format 'name: xxx.'" Current User Request:{Input:${prompt}
                    Your output format: 'name: xxx'
                    You just need return one neme.
                    `,
                },
            }
        })
        console.log('handleGenerateName', result)
        // 提取名称
        // const name = result.data.split('name:')[1]?.trim()
        const name = result.data.split('name:')[1]?.trim() || result.data.split('Name:')[1]?.trim();
        console.log('handleGenerateName name', name)
        
        return name
    }

    const handleGenerateDesc = async (name) => {
        const prefix = gizmo ? `参考信息name:${gizmo.display.name}
        |desc:${gizmo.display.description}\n` : ''
        const result = await sendToBackground({
            name: 'openai',
            body: {
                action: 'chatWithWeb',
                session: {
                    question: `As a GPTs builder, create a one-sentence description for the given user request, Inside, there is a title for GPTs and a colloquial description provided by the user. Ensuring that the description are succinct, fitting, and align with the user's input language. 
                    For example: 
                    - User Request: '{Title: ChatPaper, Input: Create a GPT for automatic research paper summarization}' 
                    Expected Output: 'Description: An AI-driven tool for concise and accurate summarization of research papers.' - User Request: '{Title:Virtual Friend, Input:Create a GPT for emotional chatting}' 
                    Expected Output: 'Description: A chatbot designed to understand and respond to emotional conversations.' 
                    - User Request: '{Title: Logo创建机器人. Input:帮我创建一个logo创建gpts}' 
                    Expected Output: 'Description: 一个智能AI工具，用于创造和定制公司标志。' 
                    Your task: Based on the User Request '{}', formulate a suitable title and description in the format 'Description: xxx.'" 
                    Current User Request:{Title:${name}, Input:${prompt}.
                    Your output format: 'Description: xxx'
                    `,
                },
            }
        })
        const desc = result.data.split('Description:')[1]?.trim()
        return desc
    }

    const handleGenerateStarters = async (title, desc) => {
        const prefix = gizmo ? `参考信息name:${gizmo.display.name}
        |desc:${gizmo.display.description}\n` : ''
        const result = await sendToBackground({
            name: 'openai',
            body: {
                action: 'chatWithWeb',
                session: {
                    question: `I am Conversation Starter Generator of GPTs Builder, a specialized GPT designed to craft engaging and contextually appropriate conversation starters based on given title, description and user prompt. My primary function is to analyze the provided title and description, then generate four unique conversation starters that align with the theme and tone of the given topic. I aim to create starters that are succinct, thought-provoking, and suitable for initiating discussions or further inquiry into the subject matter. 
                    Demo1:
                    Title: ChatPaper
                    Description: An GPT-driven tool for concise and accurate summarization of research papers.
                    User Request: Create a GPT for automatic research paper summarization.
                    Output: 1. Summarize this research paper's method. 2. What are the key findings of this study? 3. Explain the methodology of this article in simple terms? 4. Could you provide a brief overview of this paper's conclusions?
                    Demo2:
                    Title: DoraChat
                    Description: 一个聊天机器人，能够与你交互，就像与哆啦A梦一样。
                    User Request: 帮我创建一个聊天机器人，就像与哆啦A梦一样交互。
                    Output: 1. 你的口袋里有什么道具？ 2. 我可以用时间机器回到哪个时间？ 3. 你最喜欢吃什么？ 4. 我未来的妻子是谁？

                    Curretn Input:Title:${title},Description:${desc},User Request:${prompt}.
                    Your output format:1. xxx 2. xxx 3. xxx 4. xxx`,
                },
            }
        })
        console.log('handleGenerateStarters', result)
        const starter1 = result.data.split('1:')[1]?.split('2.')[0]?.trim()
        const starter2 = result.data.split('2.')[1]?.split('3.')[0]?.trim()
        const starter3 = result.data.split('3.')[1]?.split('4.')[0]?.trim()
        const starter4 = result.data.split('4.')[1]?.split('\n')[0]?.trim()
        console.log('starter1', starter1)
        console.log('starter2', starter2)
        console.log('starter3', starter3)
        console.log('starter4', starter4)
        return _.filter([starter1, starter2, starter3, starter4], (item) => item)
    }

    const handleGeneratePrompt = async (name, desc) => {
        const prefix = gizmo ? `参考信息name:${gizmo.display.name}
        |desc:${gizmo.display.description}\n` : ''
        const result = await sendToBackground({
            name: 'openai',
            body: {
                action: 'chatWithWeb',
                session: {
                    question: `Your task is to reverse-engineer GPT prompts based on user description. You'll receive a title, a description, and a Request from the user. Using these, you will generate a corresponding GPTs prompt that align with the provided information.
                    Demo:
                    Title: ChatPaper
                    Description: An GPT-driven tool for concise and accurate summarization of research papers.
                    User Request: Create a GPT for automatic research paper summarization
                    Output: 'Current GPTs Prompt: This GPTs, named ChatPaper, is designed to assist users by providing concise and accurate summaries of research papers. This involves parsing complex academic language and extracting key information such as the paper's purpose, methodology, results, and conclusions. The GPT should prioritize clarity and brevity in its summaries, ensuring they are accessible to a wide audience. It should avoid giving opinions or interpretations beyond what is presented in the paper. The tone should be formal and academic, mirroring the language typically found in research publications. Personalization will be minimal, focusing more on delivering factual, neutral summaries rather than engaging in conversational dialogue. The output language depends on the user's input language.'
                    The input:Title:${name},Desc:${desc},User Request:${prompt}.
                    Your output format: 'Current GPTs Prompt: xxx'`,
                },
            }
        })
        console.log('handleGeneratePrompt', result)
        // 提取名称
        const answer = result.data.split('Current GPTs Prompt:')[1]?.trim()
        console.log('handleGeneratePrompt answer', answer)
        return answer
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
            const desc = await handleGenerateDesc(name)
            const starters = await handleGenerateStarters(name, desc)
            const instructions = await handleGeneratePrompt(name, desc)
            console.log('name', name)
            console.log('desc', desc)
            console.log('prompt', prompt)
            console.log('starters', starters)


            // 创建新的gizmo
            const newGizmo = await sendToBackground({
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
            notificationApi.success({
                message: 'Create GPTs Success',
                description: <div>You can See At <a href={newGizmo.short_url} target="_blank"> {newGizmo.short_url}</a></div>
            });
            console.log('newGizmo', newGizmo)

        } catch (error) {

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
            <h3 className="pb-3 text-sm font-normal text-gray-500 ">One prompt  quickly create new GPTs</h3>
            <PromptTextArea onChange={setPrompt} ></PromptTextArea>
            <div className="block py-2 font-medium text-token-text-primary">Capabilities</div>
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
                            label: 'Web Browsing',
                            value: 'browser',
                        }, {
                            label: 'DALL·E Image Generation',
                            value: 'dalle'
                        }, {
                            label: 'Code Interpreter',
                            value: 'python'
                        }
                    ]}
                />
            </div>
            {/* 确定，关闭 */}
            <footer className="flex items-center justify-end mt-2 gap-x-2 ">
                <Button loading={loading} onClick={handleConfirm} type="primary" size="small">Confirm</Button>
                <Button onClick={handleClose} type="link" size="small">Cancel</Button>
            </footer>
        </div>
    )

    return (
        <Popover

            title='One Prompt GPTS builder'
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