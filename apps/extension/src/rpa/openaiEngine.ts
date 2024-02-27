// import EventEmitter from "events";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, type BaseMessagePromptTemplateLike, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser, JsonOutputParser } from "@langchain/core/output_parsers";
import { BaseMessageChunk, HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { InputValues } from "@langchain/core/dist/utils/types";
import type { RunnableLike } from "@langchain/core/dist/runnables";
import type { Action, Observation, ObserveWebpage, PredictAction, Thought } from "@opengpts/types";
import _ from 'lodash-es'


// 是否开启调试模式
const DEBUG = true
// 允许使用的最大历史场景次数
const MAX_HISTORY_SCENARIO = 3;



const TASK_PROMPT = "Your task is: {task}. Please proceed with the necessary actions to complete it";

const EVALUATE_BROWSER_INFO_PROMPT = `Review the following previous actions to guide your next steps:
{traceActions}`;



const THOUGHTS_PROMPT = `**Webpage Analysis and Action Decision Guide**

**Identify the Current Webpage:**
- Start by understanding the nature and purpose of the current webpage. 

**Evaluate Progress Towards Goal:**
- Assess if the minimal expectations towards the task's goal have been met.
- If the goal is achieved, select the ACTION "TERMINATE" to conclude the task.

**Analyze Previous Actions:**
- Review the history of actions taken, especially focusing on the last step to inform your next action.
- If the last action was "TYPE," consider if it necessitates a confirmation step. Unless specified otherwise, assume "Enter" is automatically pressed after typing.

**Examine the Screenshot Details:**
- Scrutinize the screenshot to evaluate the status of each part of the webpage. This helps understand what operations are possible and what has already been accomplished.
- Pay special attention to changes made by previous actions, as the textual history might not fully capture the effects of these actions.

**Decide on the Next Action:**
- Based on your analysis and understanding of web browsing habits and design logic, determine the next ACTION.
- Specify the target ELEMENT on the webpage, its exact location, and the intended operation.

**Guidelines for Success:**
1. Issue only valid ACTIONS based on the current observation.
2. Limit to one ACTION per decision.
3. When dealing with dropdown elements, precise options are not required at this stage. Full options will be provided later.
4. If the action is 'SCROLL', concentrate on the scrolling element or the window itself, while ignoring interactive elements.

This guide aims to ensure a systematic and efficient approach to navigating and interacting with webpages towards achieving a specific task.
`


// 反复交代，非常重要输出
const REITERATION_PROMPT = `

(Reiteration)
First, confirm your next target ELEMENT, its location, and operation. 
Use the multi-choice question below to identify your target ELEMENT from the webpage screenshot. 
Elements are ordered by their position. Select the matching ELEMENT, considering text content and HTML details. 
If unsure, choose the most likely option after reevaluation. 


{routesPrompt}

(Final Answer)
Conclude with the standardized format below, ensuring clarity and adherence to the format:
-ELEMENT: Choose based on options.
-ACTION: Select from [CLICK, SELECT, TYPE, SCROLL, TERMINATE, NONE].
-VALUE: Specify based on the ACTION chosen.

(Note): 
For TYPE, include text to be typed. （will Auto pressing "Enter")
For SELECT, indicate the chosen option. 
For SCROLL, concentrate on selecting from scrolling elements or the window itself. Specify the direction as 'UP' or 'DOWN.' When pinpointing a specific scrolling element, provide its index from the list of scrolling elements, excluding interactive elements. Use 'None' where this does not apply.
For BACK, to return to the previous page using history.back(), write 'None' for the VALUE."
`




class OpenaiEngine {
    apiKey: string | undefined;
    model: string;
    temperature: number;
    apiBase: string | undefined;
    rateLimit: number;


    constructor(apiKey: string | undefined, model = 'text-davinci-002', temperature = 0, apiBase = 'https://api.openai.com') {
        // super();
        this.apiKey = apiKey || process.env.OPENAI_API_KEY;
        this.model = model;
        this.temperature = temperature;
        this.apiBase = apiBase || process.env.OPENAI_API_BASE;
        this.rateLimit = 60; // Requests per minute
    }


    async generate(args?: {
        systemMessage?: string
        messages?: (ChatPromptTemplate<InputValues, string> | BaseMessagePromptTemplateLike)[]
        imageUrl?: string
        variables?: Record<string, any>,
        parser?: JsonOutputParser | StringOutputParser,
        options?: {
            vision?: boolean
        }
    }) {

        const {
            systemMessage = "",
            messages = [],
            variables,
            parser = new StringOutputParser(),
            options
        } = args || {};

        // confirm need use model, gpt-4-vision-preview or gpt-4-1106-preview
        const sanitizedModelName = options?.vision ? "gpt-4-vision-preview" : "gpt-4-1106-preview"

        let model = parser instanceof JsonOutputParser ? new ChatOpenAI({
            modelName: sanitizedModelName,
            maxTokens: 1024,
            verbose: DEBUG,
        }, {
            apiKey: this.apiKey,
            basePath: this.apiBase,

        }).bind({
            response_format: {
                type: "json_object",
            },
        }) :
            new ChatOpenAI({
                modelName: sanitizedModelName,
                maxTokens: 1024,
                verbose: DEBUG,
            }, {
                apiKey: this.apiKey,
                basePath: this.apiBase,

            })
        console.debug('parser instanceof JsonOutputParser', parser instanceof JsonOutputParser)
        console.debug(`useModel`, sanitizedModelName)
        console.log('is vision', options?.vision)

        if (systemMessage) {
            messages.unshift(new SystemMessage({ content: systemMessage, }))
        }

        const prompt = ChatPromptTemplate.fromMessages(messages);


        const chain = prompt.pipe(model).pipe(parser as unknown as RunnableLike<BaseMessageChunk, Record<string, any>>);


        console.log('variables', variables)
        const response = await chain.invoke(variables);
        return response;
    }

    /** 
     * 观察网站，提供指导意见
    */
    observeWebpage: ObserveWebpage = async (args) => {
        const { systemMessage, task, observation, options } = args || {};

        if (!systemMessage || !task) {
            throw new Error('systemMessage, task, screenshot are required')
        }

        if (!observation) {
            throw new Error('observation is required')
        }

        const { traceActions = [], environment } = observation
        const { screenshot } = environment || {};

        // 你被要求完成以下任务: TASK_PROMPT

        // $E:  EVALUATE_BROWSER_INFO_PROMPT

        //当前的浏览器信息：$E
        // 坐标信息:
        // 宽度和高度:
        // 浏览器执行历史记录: $A(browserOperationHistory)
        // 浏览器dom变化历史记录: $B(browserDomChangeHistory)

        // THOUGHTS_PROMPT

        // 思路，逐步思考分析过程
        // 1. 首先，思考当前页面是什么
        // 2. 其次，结合截图，逐一分析之前的每一步操作历史及其意图。特别要注意最后一步，可能与你现在应该做的下一步更相关。具体来说，如果上一步操作涉及到TYPE，总是要评估是否需要确认步骤，因为通常单个TYPE操作不会产生效果。(通常，只需按“Enter”，假定上一步操作涉及的默认元素，除非其他明确的元素可供操作)。
        // 3. 截图细节分析，仔细检查截图，检查网页的每个部分的状态，了解你可以操作什么，以及已经设置或完成了什么。你应该仔细检查截图的细节，看看之前的操作已经完成了哪些步骤，即使你已经得到了文本形式的之前的操作。因为文本历史可能无法清晰和充分地记录一些操作的效果，你应该仔细评估网页的每个部分的状态，了解你已经做了什么。

        // 返回你的思考结果



        const taskPrompt = TASK_PROMPT.replace('{task}', task);
        const actionsPrompt = EVALUATE_BROWSER_INFO_PROMPT
            .replace('{traceActions}', traceActions.map(action => JSON.stringify(action)).join('\n'))
            // 过滤，修复Error: Single '}' in template.错误
            .replace(/}/g, '')
            .replace(/{/g, '')

        const humanText = `${taskPrompt}
        ${actionsPrompt}
        ${THOUGHTS_PROMPT}`
        const messages: (ChatPromptTemplate<InputValues, string> | BaseMessagePromptTemplateLike)[] =
            [
                options?.vision ?
                    new HumanMessage({
                        content: [
                            {
                                type: 'text',
                                text: humanText,
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `${screenshot}`,
                                    detail: 'auto'
                                },
                            }

                        ],
                    },)
                    : ['human', humanText]
            ]

        const thought: Thought = await this.generate({
            systemMessage,
            messages,
            variables: {
                task,
                traceActions
            },
            options,
        });

        return thought;
    }




    public predictAction: PredictAction = async (args) => {
        const { systemMessage, task, thought, thoughts, observation, options } = args || {};
        if (!observation) {
            throw new Error('observation is required')
        }
        const { routes, environment, traceActions } = observation;
        const { screenshot } = environment || {};

        if (!systemMessage || !task) {
            throw new Error('systemMessage, task, screenshot are required')
        }

        const thoughtsPrompt = thoughts?.join('\n') || '';
        const routesPrompt = routes?.join('\n') || '';

        console.log(`%c predictAction <<<-: ${JSON.stringify(routesPrompt)}`, 'color: #ff6600');

        const taskPrompt = TASK_PROMPT.replace('{task}', task);

        const rect = (thought: string, action: string, index: number) => {
            console.log('打印thought->', thought)
            console.log('打印action->', action)
            return `
            Step:${index}-> [Thought]:${thought}
            ${action ? `Step:${index}-> [ACTION]:` + action : ''}
            `}


        const historyActions = traceActions.slice(-MAX_HISTORY_SCENARIO);
        const historyThoughts = thoughts?.slice(-MAX_HISTORY_SCENARIO);

        // 同时遍历，thoughts和traceActions,使用lodash的zip方法
        const preScenario = _.zip(historyThoughts, historyActions).map(([thought, action], index) => {
            return rect(thought, JSON.stringify(action), index)
        }).join('\n').replace(/}/g, '').replace(/{/g, '')


        const humanText = `${taskPrompt}\n
        ${preScenario}
        ${THOUGHTS_PROMPT}`

        const messages: (ChatPromptTemplate<InputValues, string> | BaseMessagePromptTemplateLike)[] =
            [
                options?.vision ?
                    new HumanMessage({
                        content: [
                            {
                                type: 'text',
                                text: humanText,
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `${screenshot}`,
                                    detail: 'auto'
                                },
                            }

                        ],
                    })
                    : ['human', humanText],
                ['user', `${REITERATION_PROMPT}`],
            ]

        const output = await this.generate({
            systemMessage,
            messages,
            variables: {
                routesPrompt,
                task,
                traceActions
            },
            options,
        });

        console.log(`%c predictAction ->>>: ${output}`, 'color: #ff6600');

        console.log(`get action output: ${output}`)

        const result: Action = {
            ELEMENT: undefined,
            ACTION: 'CLICK',
            VALUE: null
        };

        const lowerCaseStr = output

        const elementRegex = /-ELEMENT\s*:\s*(\d+)/i;
        const actionRegex = /-ACTION\s*:\s*([A-Z]+)/i; // 确保ACTION后面直接是动作类型
        const valueRegex = /VALUE\s*:?[\s\S]*?([^\n]+)/i;


        // 提取Element
        const elementMatch = lowerCaseStr.match(elementRegex);
        if (elementMatch) {
            result.ELEMENT = elementMatch[1].trim();
        }

        // 提取Action
        const actionMatch = lowerCaseStr.match(actionRegex);
        if (actionMatch) {
            result.ACTION = actionMatch[1].trim();
        }

        // 提取Value
        const valueMatch = lowerCaseStr.match(valueRegex);
        if (valueMatch) {
            result.VALUE = valueMatch[1].trim();
        }

        if (result.ACTION === 'TYPE' && result.VALUE === '') {
            throw new Error('命令为ACTION，但却没有任何输入');
        }

        console.log(`parsed action result: ${JSON.stringify(result)}`)


        return result;
    }

}



export default OpenaiEngine;


