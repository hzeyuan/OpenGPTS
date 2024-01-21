import { sendToBackground } from "@plasmohq/messaging";
import { Button, Popover, Select, Space, Switch } from "antd"
import type { NotificationInstance } from "antd/es/notification/interface";
import { useState } from "react";
import _ from 'lodash'

const LanguageSelect = ({ onChange }) => {
    const languages = [
        { label: '中文', value: 'zh' },
        { label: 'English', value: 'en' },
        { label: '日本語', value: 'jp' },
        { label: '한국어', value: 'ko' },
        { label: 'Français', value: 'fr' },
        { label: 'Español', value: 'es' },
        { label: 'Deutsch', value: 'de' },
        { label: 'Português', value: 'pt' },
        { label: 'Italiano', value: 'it' },
        { label: 'Русский', value: 'ru' },
        { label: 'العربية', value: 'ar' },
        { label: 'ภาษาไทย', value: 'th' },
        { label: 'Türkçe', value: 'tr' },
        { label: 'Tiếng Việt', value: 'vi' },
        { label: 'Nederlands', value: 'nl' },
        { label: 'Polski', value: 'pl' },
        { label: 'Bahasa Indonesia', value: 'id' },
        { label: 'हिन्दी', value: 'hi' },
        { label: 'עברית', value: 'he' },
        { label: 'Čeština', value: 'cs' },
        { label: 'Svenska', value: 'sv' },
        { label: 'Magyar', value: 'hu' },
        { label: 'Română', value: 'ro' },
        { label: 'Українська', value: 'uk' },
        { label: 'Norsk', value: 'no' },
        { label: 'Dansk', value: 'da' },
        { label: 'Suomi', value: 'fi' },
        { label: 'Slovenčina', value: 'sk' },
        { label: 'Hrvatski', value: 'hr' },
        { label: 'Српски', value: 'sr' },
        { label: 'Български', value: 'bg' },
        { label: 'Eesti', value: 'et' },
        { label: 'Lietuvių', value: 'lt' },
        { label: 'Latviešu', value: 'lv' },
    ]
    const handleChange = (value: string) => {
        console.log(`selected ${value}`);
        onChange && onChange(value)
    };

    return (
        <div className="w-full">
            <Select
                size="small"
                popupMatchSelectWidth={false}
                defaultValue="English"
                className="w-full"
                onChange={handleChange}
                options={languages}
            />
        </div>

    )

}

const LanguageSelectPopover: React.FC<{
    gizmo: Gizmo,
    notificationApi: NotificationInstance
}> = ({ gizmo, notificationApi }) => {

    const [language, setLanguage] = useState('zh')
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const handleConfirm = async () => {
        console.debug('language', language)

        const checkResult = await sendToBackground({
            name: 'openai',
            body: {
                action: 'checkGPTWebAuth',
            },
        })
        const error = checkResult?.error
        if (error) {
            const openOpenAI = () => {
                window.open('https://chat.openai.com/', '_blank')
                notificationApi.destroy()
            }
            const onClose = () => {
                notificationApi.destroy()
            }
            const key = `CloneGPTByLanguage`;
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
        setLoading(true)
        const result = await sendToBackground({
            name: 'openai',
            body: {
                action: 'chatWithWeb',
                session: {
                    question: `You are now a GPTs fine-tuner, and you will modify the content of the current GPTs based on user instructions. 
                    User instruction: {} Current GPTs: {title:xx, description:xxx, starter:xxx, prompt:xxx} 
                    Your output format: {title:yyy, description:yyy, starter:yyy, prompt:yyy}
                    
                    Here is demo:
                    Demo GPTs:
                    {title: Quantum Physics
                    description: This GPT helps users understand complex concepts in quantum physics by simplifying them into more comprehensible explanations.
                    starter: "Please explain the concept of quantum entanglement in simple terms."
                    prompt: "Create easy-to-understand explanations for complex quantum physics topics, focusing on breaking down advanced concepts into simpler, more digestible information suitable for beginners. Emphasize clarity and avoid technical jargon."
                    }
                    
                    Demo User Instruction
                    "Make the GPT more interactive and suitable for high school students. Include analogies and ask guiding questions to encourage deeper thinking."
                    
                    Demo Modified GPT Structure
                    {title: Quantum Physics for High School Students
                    description: This GPT engages high school students in quantum physics by using analogies and interactive questions, making complex concepts more accessible and thought-provoking.
                    starter: "How can we relate quantum entanglement to something you experience in your daily life? Think about connections that are instant and inseparable."
                    prompt: "Craft explanations for quantum physics topics using everyday analogies and interactive questions, tailored for high school students. Focus on simplifying advanced concepts into relatable, engaging content that stimulates curiosity and deeper understanding. Encourage exploration and critical thinking by integrating thought-provoking questions into the explanations."}
                    
                    Current User instruction: Please modify language to ${language}
                    Current GPTs: 
                    {title: ${gizmo.display.name}
                    description:${gizmo.display.description}
                    starter: ${gizmo.display.prompt_starters.join(',')}
                    prompt: ${gizmo.instructions}
                    }
                    `,
                },
            }
        })
        if (result.error) {
            notificationApi.error({
                message: `Update GPTs: ${result.error}`,
            });
            setLoading(false)
            setOpen(false)
            return
        }
        const output = (result?.data || '')
            .replace(/[\n\r]+/g, ' ')
            .replace(/['"]+/g, '')
            .replace(/\s{2,}/g, ' ')
            .replace(/[\{\}]/g, '')
            .toLowerCase()
            .trim();

        const extractWithRegex = (text, startPattern, endPattern) => {
            const pattern = new RegExp(`${startPattern}(.*?)${endPattern}`, 'is');
            const match = text.match(pattern);
            return match ? match[1].trim() : '';
        };

        const titlePattern = 'title:';
        const descriptionPattern = 'description:';
        const starterPattern = 'starter:';
        const promptPattern = 'prompt:';

        const name = extractWithRegex(output, titlePattern, descriptionPattern);
        const desc = extractWithRegex(output, descriptionPattern, starterPattern);
        const startersStr = extractWithRegex(output, starterPattern, promptPattern);
        const instructions = extractWithRegex(output, promptPattern, '$'); // Assuming prompt is the last section
        const starters = startersStr ? startersStr.split(',').map(item => item.trim()) : [];
        console.log('result?.data', output)
        console.log('name', name, 'desc', desc, 'starters', starters, 'instructions', instructions)

        // Sending a request to create the modified GPTs
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
                        welcome_message: "",
                        profile_picture_url: gizmo.display.profile_picture_url
                    },
                    instructions: instructions
                },
                record: {
                    action: 'translate',
                    log: {
                        language: language,
                        gizmo: gizmo,
                    }
                }
            }
        })
        console.log('GPTsResult.data', GPTsResult)
        if (GPTsResult.error) {
            notificationApi.error({
                message: `Update GPTs: ${GPTsResult.error}`,
            });
        } else {
            notificationApi.success({
                message: `Update GPTs: ${GPTsResult.data?.display.name} Success`,
                description: <div>You can See At <a href={GPTsResult.data?.short_url} target="_blank"> {GPTsResult.data?.short_url}</a></div>
            });
        }
        setLoading(false)
        setOpen(false)

    }
    const handleClose = () => {
        setOpen(false)
    }
    const content = (
        <div>
            <h3 className="pb-3 text-sm font-normal text-gray-500 ">You can Change GPT language </h3>
            <LanguageSelect onChange={setLanguage} ></LanguageSelect>
            <footer className="flex items-center justify-end mt-2 gap-x-2 ">
                <Button loading={loading} onClick={handleConfirm} type="primary" size="small">Confirm</Button>
                <Button onClick={handleClose} type="link" size="small">Cancel</Button>
            </footer>
        </div>
    )

    return (
        <Popover
            destroyTooltipOnHide
            title='Select Language'
            trigger="click"
            open={open}
            key={'LanguageSelectPopover'}
            content={content}>
            <div
                onClick={() => setOpen(true)}
                className="  hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] cursor-pointer  h-[28px] w-[28px] flex overflow-hidden  items-center justify-center text-sm leading-4 rounded-[30px] "
                role="button">
                <svg t="1705650982022" class="icon w-4 h-4" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5957" width="200" height="200"><path d="M661.333333 192H423.253333l-18.752-93.696-83.669333 16.725333L336.213333 192H106.666667v85.333333h95.893333c5.696 17.92 14.101333 42.090667 25.578667 69.098667 19.754667 46.464 49.664 104 92.224 152.234667-38.485333 29.141333-81.344 55.594667-118.933334 76.8a1442.346667 1442.346667 0 0 1-84.458666 43.946666l-5.034667 2.346667-1.237333 0.576-0.341334 0.149333 17.642667 38.826667c17.621333 38.869333 17.706667 38.826667 17.706667 38.826667l0.106666-0.042667 0.426667-0.192 1.557333-0.704 5.674667-2.666667c4.906667-2.325333 11.946667-5.696 20.650667-10.026666a1527.829333 1527.829333 0 0 0 69.205333-36.693334c42.581333-24.021333 94.314667-55.936 140.672-92.48 46.336 36.544 98.090667 68.48 140.672 92.48a1527.722667 1527.722667 0 0 0 75.434667 39.765334l-17.002667 40.64-68.096 171.370666 79.317333 31.509334L634.453333 832h181.696l40.170667 101.098667 79.317333-31.509334-67.84-170.666666L767.381333 490.666667h-84.117333l-50.176 120.021333-1.216-0.597333a1441.792 1441.792 0 0 1-65.28-34.624c-37.632-21.205333-80.469333-47.658667-118.954667-76.8 42.56-48.213333 72.469333-105.770667 92.224-152.234667a782.357333 782.357333 0 0 0 25.578667-69.12H661.333333V192z m-200 121.045333c-18.176 42.752-43.776 90.645333-77.333333 128.789334-33.557333-38.144-59.157333-86.037333-77.333333-128.789334A694.805333 694.805333 0 0 1 292.650667 277.333333h182.698666c-3.925333 10.88-8.597333 22.954667-14.016 35.712zM781.909333 746.666667h-113.173333l56.576-135.36L781.909333 746.666667z" p-id="5958" fill="#8a8a8a"></path></svg>
            </div>
        </Popover>
    )
}
export default LanguageSelectPopover




