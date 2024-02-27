"use client"
import { useState } from 'react';
import { Input, Button, message, Switch } from 'antd';

import type { Action, CommonResponse } from '@opengpts/types';
import { invokeFuncFromBGSW } from '~src/utils/rpa';
import OpenWindowButton from './tests/comp/OpenWindowButton';
import ScrollButtons from './tests/comp/ScrollButtons';
import ZoomButton from './tests/comp/ZoomButton';
import TypeMessageButton from './tests/comp/TypeMessageButton';
import ClickElementButton from './tests/comp/ClickElementButton';
import InteractiveElementsList from './tests/comp/InteractiveElementsList'




const googleSearchActions: Action[] = [
    {
        ACTION: 'TYPE',
        ELEMENT: {
            uniqueSelector: '#APjFqb'
        },
        VALUE: 'iphone 15价格'
    }, {
        ACTION: 'CLICK',
        ELEMENT: {
            uniqueSelector: '#APjFqb'
        },
        VALUE: '',
    },
]






type Flag = 'running' | 'stop' | 'pause'

export default function Page() {

    const [text, setText] = useState('')
    const [task, setTask] = useState<any>({})
    const [windowInfoList, setWindowInfoList] = useState<chrome.windows.Window[]>([])
    const [windowInfo, setWindowInfo] = useState<chrome.windows.Window>()
    const [actions, setActions] = useState<Action[]>([]);
    const [flag, setFlag] = useState<Flag>('running')
    const [messageList, setMessageList] = useState<(string  | React.JSX.Element)[]>([])
    const [elementSelector, setElementSelector] = useState<string>('')
    const openWindow = async (url: string) => {
        try {
            const data = await invokeFuncFromBGSW('opengpts', {
                type: 'OPEN_WINDOW',
                message: {
                    url: url || 'https://www.google.com/',
                    autoZoom: false,

                }
            })
            return data?.['windowInfo']
        } catch (error) {
            message.error(`打开窗口失败:${error}`)
        }
    }

    const run = async () => {
        openWindow('https://www.zhihu.com').then(async windowInfo => {
            let taskId = ''
            while (true) {
                try {
                    if (flag === 'stop') {
                        console.log('停止')
                        setMessageList(prevList => [...prevList, 'stop'])
                        return
                    };
                    if (flag === 'pause') {
                        console.log('暂停')
                        setMessageList(prevList => [...prevList, 'pause'])
                        continue
                    }

                    setMessageList(prevList => [...prevList, 'thinking'])
                    const screenData = await invokeFuncFromBGSW('opengpts', {
                        type: 'GET_SCREENSHOT',
                        windowId: windowInfo?.id,
                    })


                    if (!screenData) {
                        console.log(`原因:没有screenData`)
                        return
                    }

                    const { screenshot } = screenData
                    console.log('获取到截图')

                    const browserEnv = await invokeFuncFromBGSW('opengpts', {
                        type: 'BROWSER_ENV',
                        tabId: windowInfo?.tabs?.[0]?.id
                    })

                    if (!browserEnv) {
                        console.log(`原因:没有domData`)
                        return
                    }
                    const { interactiveElements, interactiveRect, rect, scrollElements } = browserEnv

                    setMessageList(prevList => [...prevList,
                    <div>
                        <div>获取到截图</div>
                        <img className='w-64 h-64 ' src={screenshot} alt="" />
                        <div>获取到dom</div>
                        <div>可以交互的元素有{interactiveElements.length}个</div>
                        <div> 窗口信息{JSON.stringify(interactiveRect)}</div>
                        <div> 页面窗口信息{JSON.stringify(rect)}</div>
                    </div>])



                    console.log('可以交互的元素有', interactiveElements, interactiveElements.length)
                    console.log('窗口信息', interactiveRect)
                    console.log('页面窗口信息', rect)


                    const resp = await fetch('http://localhost:1947/api/rpa/prediction', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            taskId: taskId,
                            task: task.name,
                            environment:
                            {
                                screenshot,
                                ...browserEnv,
                            },
                            options: {
                                vision: false
                            }
                        })
                    })
                    const data: CommonResponse = await resp.json()
                    console.log('data', data)
                    if (!resp.ok || data?.code !== 0) {
                        setMessageList(prevList => [...prevList, `请求失败:${data.message}`])
                        return
                    }

                    const { action, thought, taskId: newTaskId, task: taskName } = data?.data!;
                    setTask({
                        ...task,
                        id: newTaskId,
                        name: taskName,
                    });
                    taskId = newTaskId
                    setActions([...actions, action])

                    console.log(`%c[task] ${task}`, 'color: blue; font-weight: bold; font-size: 12px;')
                    console.log(`%c[thought] ${thought}`, 'color: purple; font-weight: bold; font-size: 14px; background-color: yellow;')
                    console.log(`%c[action]  run ${JSON.stringify(action)}`, 'color: black; font-weight: bold; font-size: 13px; background-color: yellow;')

                    setMessageList(prevList => [...prevList, `task:${task}`])
                    setMessageList(prevList => [...prevList, `thought:${thought}`])
                    setMessageList(prevList => [...prevList, `action:${JSON.stringify(action)}`])


                    if (action.ACTION === 'None' || action.ACTION === 'TERMINATE') {
                        setMessageList(prevList => [...prevList, `任务执行完毕`])
                        console.log(`任务执行完毕`)
                        return;
                    };


                    setMessageList(prevList => [...prevList, `执行动作:${JSON.stringify(action)}`])

                    const actionRes = await invokeFuncFromBGSW('debugger', {
                        tabId: windowInfo?.tabs?.[0]?.id,
                        windowId: windowInfo?.id,
                        message: {
                            action
                        }
                    })

                    setMessageList(prevList => [...prevList, `执行动作结果:${JSON.stringify(actionRes)}`])


                    await invokeFuncFromBGSW('opengpts', {
                        type: 'CHECK_PAGE_LOADED',
                        tabId: windowInfo?.tabs?.[0]?.id
                    })

                    console.log(`%c[action] Res of action`, 'color: black; font-weight: bold; font-size: 13px; background-color: yellow;', actionRes)


                } catch (error) {
                    console.error('error', error)
                    setMessageList(prevList => [...prevList, `error:${error}`])
                }


            }
        });



    }

    const agentFakeRun = async (windowInfo: chrome.windows.Window, actions: Action[]) => {

        const tabId = windowInfo!.tabs?.[0]!.id!;
        console.log('tabId', tabId)
        console.log('windowInfo', windowInfo)
        setMessageList(prevList => [])
        for (let action of actions) {
            console.log('action', action)
            setMessageList(prevList => [...prevList, 'thinking']) // 函数式更新状态
            const data = await invokeFuncFromBGSW('debugger', {
                tabId,
                message: {
                    action
                }
            })
            console.log("执行完毕", data)

            setMessageList(prevList => [...prevList, `[${JSON.stringify(action)}->done]`]) // 函数式更新状态
        }
    }

    return (
        <div className='p-4'>
            <h3> 和插件交互测试页面</h3>
            <div className='flex flex-col justify-center gap-4 m-4 '>
                <div>执行的任务:{task.name}</div>
                <div>任务id:{task?.id}</div>
                <div>当前聚焦的窗口：{windowInfo?.id}</div>
                <div>当前选中的元素为:{elementSelector}</div>
                {JSON.stringify(actions)}
            </div>


            <div className='py-4 text-xl text-bold'>第一步，你需要打开一个窗口</div>
            <OpenWindowButton callback={(windowInfo) => {
                console.log('windowInfo', windowInfo)
                setWindowInfoList(prevList => [...prevList, windowInfo])
                setWindowInfo(windowInfo)
            }} />

            <div className='py-2'>
                可切换窗口列表:
                {
                    windowInfoList.map((item, index) => {
                        return <div key={index} onClick={() => {
                            console.log('item', item)
                            setWindowInfo(item)
                        }} className='p-2 border border-black cursor-pointer hover:text-blue-500'>{item.id}</div>
                    })
                }
            </div>


            <div className='py-4 text-xl text-bold'>第二步,现在你可以测试下面的功能</div>



            <div className='w-full'>
                <InteractiveElementsList windowInfo={windowInfo!}
                    onElementSelect={(cssSelector: string) => {
                        setElementSelector(cssSelector)
                        const code = `
                    window['unmarkPage']();
                    window['markPage']('${cssSelector}')
                    `
                        invokeFuncFromBGSW('opengpts', {
                            type: 'INJECT_CODE',
                            tabId: windowInfo?.tabs?.[0]?.id,
                            message: {
                                code
                            },
                        })
                    }} />
            </div>


            <div className='py-4 '>功能</div>
            <div className="grid grid-cols-3 gap-2 py-2 ">

                <Button onClick={() => {
                    invokeFuncFromBGSW('opengpts', { windowId: windowInfo?.id, type: 'GET_SCREENSHOT' })
                }}>截图</Button>
                <Button onClick={() => {
                    invokeFuncFromBGSW('opengpts', { tabId: windowInfo?.tabs?.[0]?.id, type: 'CHECK_PAGE_LOADED' })
                }}>检查页面是否加载完成</Button>
                <Button onClick={() => {
                    invokeFuncFromBGSW('opengpts', { tabId: windowInfo?.tabs?.[0]?.id, type: 'FULL_SCREENSHOT' });
                }}>全图截屏</Button>

                <Button onClick={() =>
                    invokeFuncFromBGSW('opengpts', {
                        tabId: windowInfo?.tabs?.[0]?.id,
                        type: 'INJECT_CODE',
                        message: {
                            code: `window['markPage']()`
                        }

                    })
                }>标记当前可视区域内的元素</Button>
                <Button onClick={() =>
                    invokeFuncFromBGSW('opengpts', {
                        tabId: windowInfo?.tabs?.[0]?.id,
                        type: 'INJECT_CODE',
                        message: {
                            code: `window['unmarkPage']()`
                        }

                    })
                }>取消标记当前可视区域内的元素</Button>
                <ZoomButton windowInfo={windowInfo}></ZoomButton>
                <ScrollButtons windowInfo={windowInfo} />
                <TypeMessageButton callback={(action: Action) => {
                    setActions([...actions, action])
                }} initSelector={elementSelector} windowInfo={windowInfo}></TypeMessageButton>
                <ClickElementButton callback={(action: Action) => {
                    setActions([...actions, action])
                }}
                    initSelector={elementSelector}
                    windowInfo={windowInfo}></ClickElementButton>
            </div>


            <div className='py-4'>下面是一些完整的测试用例</div>

            <div className="grid grid-cols-3 gap-2 py-2 ">
                <Button onClick={async () => {
                    openWindow('https://www.google.com').then(async (windowInfo) => {
                        console.log('windowInfo', windowInfo)
                        // 截图
                        await invokeFuncFromBGSW('opengpts', {
                            type: 'GET_SCREENSHOT',
                            windowId: windowInfo?.id,
                            tabId: windowInfo?.tabs?.[0]?.id
                        })
                        // 跳转页面
                        await invokeFuncFromBGSW('debugger', {
                            tabId: windowInfo?.tabs?.[0]?.id,
                            message: {
                                action: {
                                    ACTION: 'TYPE',
                                    ELEMENT: {
                                        uniqueSelector: '#APjFqb'
                                    },
                                    VALUE: 'iphone 15价格'
                                }

                            }
                        })
                        //等待页面加载完成
                        await invokeFuncFromBGSW('opengpts', {
                            type: 'CHECK_PAGE_LOADED',
                            tabId: windowInfo?.tabs?.[0]?.id
                        })
                        // 截图
                        await invokeFuncFromBGSW('opengpts', {
                            type: 'GET_SCREENSHOT',
                            windowId: windowInfo?.id,
                        })
                    })
                }}>测试链接跳转完成后在截图</Button>
                <Button onClick={() => {
                    openWindow('https://www.google.com').then((windowInfo) => {
                        agentFakeRun(windowInfo, googleSearchActions)
                    })
                }}>打开窗口，点击后，输入文本，谷歌搜索</Button>

                <Button onClick={() => {
                    openWindow('https://github.com/hzeyuan/OpenGPTS').then((windowInfo) => {
                        console.log('windowInfo', windowInfo)
                        // setWindowInfo(windowRes?.data.windowInfo)
                        agentFakeRun(windowInfo, [
                            {
                                ACTION: 'CLICK',
                                ELEMENT: {
                                    uniqueSelector: '#repository-details-container > ul > li:nth-child(4) > div > div.starred.BtnGroup.flex-1.ml-0 > form > button',
                                }
                            }
                        ])

                    })
                }}>打开github项目，并点击star按钮</Button>

                <Button onClick={() => {
                    openWindow('https://x.com').then((windowInfo) => {
                        console.log('windowInfo', windowInfo)
                        agentFakeRun(windowInfo, [{
                            "ACTION": "TYPE",
                            "ELEMENT":
                                { "uniqueSelector": ".false > .r-1niwhzg" },
                            "VALUE": "我是ai生成测试的文本"
                        },
                        {
                            "ACTION": "CLICK",
                            "ELEMENT":
                                { "uniqueSelector": ".r-19u6a5r > .css-1rynq56 > .r-dnmrzs > .css-1qaijid" }
                        }])
                    })
                }}>Twitter发送文本</Button>
                <Button onClick={() => {
                    openWindow('https://zhihu.com').then((windowInfo) => {
                        console.log('windowInfo', windowInfo)
                        agentFakeRun(windowInfo, [{
                            "ELEMENT": {
                                "uniqueSelector": ":nth-child(4) > .GlobalWriteV2-topTitle",
                                "outerHTML": "<div class=\"GlobalWriteV2-topTitle\">写想法</div>"
                            },
                            "ACTION": "CLICK",
                            "VALUE": "None"
                        },
                        {
                            "ELEMENT": {
                                "uniqueSelector": ".Dropzone",
                                "outerHTML": "<div class=\"Dropzone Editable-content RichText RichText--editable RichText--clearBoth ztext\" style=\"min-height: 38px;\"><div class=\"DraftEditor-root\"><div class=\"public-DraftEditorPlaceholder-root public-DraftEditorPlaceholder-hasFocus\"><div class=\"public-DraftEditorPlaceholder-inner\" id=\"placeholder-feb6a\" style=\"white-space: pre-wrap;\">分享你此刻的想法...</div></div><div class=\"DraftEditor-editorContainer\"><div aria-describedby=\"placeholder-feb6a\" class=\"notranslate public-DraftEditor-content\" contenteditable=\"true\" role=\"textbox\" spellcheck=\"true\" tabindex=\"0\" style=\"outline: none; user-select: text; white-space: pre-wrap; overflow-wrap: break-word;\"><div data-contents=\"true\"><div class=\"Editable-unstyled\" data-block=\"true\" data-editor=\"feb6a\" data-offset-key=\"esjf4-0-0\"><div data-offset-key=\"esjf4-0-0\" class=\"public-DraftStyleDefault-block public-DraftStyleDefault-ltr\"><span data-offset-key=\"esjf4-0-0\"><br data-text=\"true\"></span></div></div></div></div></div></div></div>"
                            },
                            "ACTION": "TYPE",
                            "VALUE": "今晚月色真美"
                        },
                        {
                            "ELEMENT": {
                                "uniqueSelector": ".css-4cffwv > .Button",
                                "outerHTML": "<button type=\"button\" class=\"Button css-1o2ioyv FEfUrdfMIKpQDJDqkjte Button--primary Button--blue epMJl0lFQuYbC7jrwr_o JmYzaky7MEPMFcJDLNMG\">发布</button>"
                            },
                            "ACTION": "CLICK",
                            "VALUE": "None"
                        },])
                    })
                }}>知乎发布想法</Button>

            </div>
            <Switch checkedChildren="开启视觉" unCheckedChildren="关闭视觉" defaultChecked onChange={(checked) => {
                setTask({ ...task, vision: checked })
            }
            } />

            <div className='py-4'>自动化执行你的任务</div>
            <div className='py-2'>输入你的任务:</div>
            <Input className='w-full mx-3 border border-black ' value={task.name} onChange={e => setTask({ ...task, name: e.target.value })} />
            <div className='flex gap-4 py-4'>
                <Button onClick={() => {
                    setFlag('running')
                }}>暂停</Button>

                <Button onClick={() => {
                    setFlag('running')
                    run();
                }}>开始</Button>
            </div>
            <div>
                {
                    messageList?.map((message, index) => {
                        return <div key={index} className='p-2 border-blue-500 border-spacing-1 border-t-1'>{index} {message}</div>
                    })
                }
            </div>


        </div >
    )
}