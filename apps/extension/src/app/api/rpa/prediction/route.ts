import type { InputValues } from "@langchain/core/dist/utils/types";
import { HumanMessage } from "@langchain/core/messages";
import type { ChatPromptTemplate, BaseMessagePromptTemplateLike } from "@langchain/core/prompts";
import { NextRequest, NextResponse } from "next/server"
import OpenaiEngine from "~src/rpa/openaiEngine";
import supabase from "~src/utils/supabase";
import { formatElementsWithCheerio, handleAction, withRetry } from "~src/utils/rpa";
import type { Action, Observation, Thought, WebEnvironment } from "@opengpts/types";
import { updateOrInsertActivity } from "~src/utils/supabase";


// export async function GET() {
//     const activity = await updateOrInsertActivity("test", {}, true)
//     console.log('activity', activity)
//     return NextResponse.json({

//         code: 0,
//         message: '',
//     })
// }


/**
 * Handle the POST request to the /rpa/prediction route
 * @param {NextRequest} request
 * 
 */
export async function POST(request: NextRequest) {

    try {
        const {
            environment,
            task = '在知乎上，发布一个关于ai爆炸 的想法',
            taskId,
            options,
        }: {
            environment: WebEnvironment,
            task: string,
            taskId: string,
            options: any
        } = await request.json()


        // 之前历史行为过程
        let scenario: {
            observationList: Observation[];
            thoughtList: Thought[];
            actionList: Action[];

        } = {
            observationList: [],
            thoughtList: [],
            actionList: [],
        }

        console.log('任务为', task);

        const openaiEngine = new OpenaiEngine(process.env.OPENAI_API_KEY, 'gpt-4-vision-preview', 0, process.env.OPENAI_API_BASE_URL);

        const systemMessage = `Imagine that you are imitating humans doing web navigation for a task step by step. At each stage, you can see the webpage like humans by a screenshot and know the previous actions before the current step decided by yourself through recorded scenario. You need to decide on the first following action to take. You can click on an element with the mouse, select an option, type text or press Enter with the keyboard. (For your understanding, they are like the click(), select_option() type() and keyboard.press('Enter') functions in playwright respectively) One next step means one operation within the four. Unlike humans, for typing (e.g., in text areas, text boxes) and selecting (e.g., from dropdown menus or <select> elements), you should try directly typing the input or selecting the choice, bypassing the need for an initial click. You should not attempt to create accounts, log in or do the final submission. Terminate when you deem the task complete or if it requires potentially harmful actions.`


        let isNew = !taskId

        const observation: Observation = {
            target: 'browser',
            environment: { ...environment },
            traceActions: scenario['actionList'],
            routes: []
        }


        if (taskId) {
            const { data, error } = await supabase.from('rpa_website_activity').select('observation_list,thought_list,action_list,task_id').eq('task_id', taskId)?.maybeSingle()
            console.log('data', data, error)
            isNew = !data

            if (error) {
                return NextResponse.json({ code: -1, message: error.message });
            }
            if (!data) {
                return NextResponse.json({ code: -1, message: 'not find this taskId' });
            }

            scenario['observationList'] = data.observation_list
            scenario['thoughtList'] = data.thought_list
            scenario['actionList'] = data.action_list
        }


        const elements = formatElementsWithCheerio(environment?.interactiveElements)

        const scrollElements = formatElementsWithCheerio(environment?.scrollElements || [])


        const routes = [
            'interactive elements:',
            ...elements.map(([n, element]) => `${n}. ${element}`)
        ]

        routes.push('scrollable containers:')
        scrollElements?.forEach(([n, element]) => {
            routes.push(`${Number(n) + elements.length}. ${element}`)
        })

        observation['routes'] = routes // latest routes
        observation['traceActions'] = scenario['actionList'] // previous actions

        console.log('序列化可以交互的元素', routes)
        console.log("过去的思考", scenario['thoughtList'])
        console.log("过去的行为", scenario['actionList'])
        console.log("过去的观察", scenario['observationList'])

        scenario['observationList']?.push(observation) // add latest observation to list

        // 观察网站，指导下一步操作
        const thought = await openaiEngine.observeWebpage({
            task: task,
            systemMessage,
            observation,
            options,

        });

        scenario['thoughtList']?.push(thought);
        console.log("新的想法", thought)


        const preprocessAction: Action = await openaiEngine.predictAction({
            task: task,
            systemMessage,
            observation,
            thought,
            thoughts: scenario['thoughtList'], // 之前的思考
            options
        })


        const action = handleAction(preprocessAction, environment)


        scenario['actionList']?.push(action)
        console.log('新的行为', action)


        console.log('是否为新的任务', isNew)
        const activity = await withRetry(() => updateOrInsertActivity({
            taskId,
            task: task,
            actionList: scenario['actionList'],
            observationList: scenario['observationList'],
            thoughtList: scenario['thoughtList']
        }), 10, 1000);
        console.log('完整活动', activity)

        return NextResponse.json({
            code: 0,
            message: '',
            data: {
                task: task,
                taskId: activity?.task_id || taskId,
                // observation,
                thought,
                action,
            }
        });
    } catch (error: any) {
        // console.error('Error in POST /rpa/prediction', error)
        return NextResponse.json({ code: -1, message: error.message });
    }



}