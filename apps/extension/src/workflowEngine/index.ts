import WorkflowEngine from "./WorkflowEngine";
import browser from "webextension-polyfill";
import { attempt } from "lodash-es";
import WorkflowState from "./WorkflowState";
import { sendMessage } from '~src/utils/message';
import { sendToBackground, sendToContentScript } from "@plasmohq/messaging";
import BackgroundUtils from "~src/background/BackgroundUtils";
import BackgroundWorkflowUtils from "~src/background/BackgroundWorkflowUtils";
import blocksHandler from "./blocksHandler";


const workflowStateStorage = {
    get() {
        return browser.storage.local
            .get('workflowStates')
            .then(({ workflowStates }) => workflowStates || []);
    },
    set(key: string, value: any) {
        console.log(`[workflowStateStorage] set`, key, value)
        const states = Object.values(value);

        return browser.storage.local.set({ workflowStates: states });
    },
};


export const workflowState = new WorkflowState({
    storage: workflowStateStorage,
    key: 'workflowState'
});



const stopWorkflowExec = (executionId: string) => {
    // 停止 workflow 的逻辑
    workflowState.stop(executionId);
    // sendMessage('workflow:stop', executionId, 'background');
    sendToBackground({
        name: 'workflow:stop',
        body: executionId
    });
};





const executeWorkflow = async (workflowData, options) => {
    console.log(`[workflowEngine] executeWorkflow`, workflowData, options)
    // 检查工作流数据是否存在且未被禁用
    if (!workflowData || workflowData.isDisabled) return;


    // 获取执行上下文，决定是在背景页还是内容页执行工作流
    // const context = workflowData?.settings?.execContext;
    const context = 'background'



    // 如果是旧版扩展或指定在背景页执行，直接在背景页发送执行工作流的消息
    if (context === 'background') {
        console.log("context === 'background'", workflowData, options)
        sendMessage('workflow:execute', { ...workflowData, options }, 'background');
        // sendToBackground({
        //     name: 'workflow',
        //     body: {
        //         type: 'workflow:execute',
        //         data: { ...workflowData, options }
        //     }
        // })
        // await workflowExecute(workflowData, options);

        return;
    }

    // 对于非背景执行上下文，尝试在当前活跃的标签页执行工作流
    // if (window) window.fromBackground = false;

    // 查询当前活跃的标签页
    browser.tabs.query({ active: true, currentWindow: true })
        .then(async ([tab]) => {
            console.log(`[workflowEngine] executeWorkflow`, tab, workflowData, options)
            // 如果找到活跃标签页且该标签页是扩展页面，尝试将其窗口取消聚焦
            if (tab && tab?.url?.includes(browser.runtime.getURL(''))) {
                await browser.windows.update(tab.windowId!, { focused: false });
            }

            // 在找到的标签页中启动工作流执行
            startWorkflowExec(workflowData, options);
        });
}



const startWorkflowExec = (workflowData, options) => {
    console.log(`[workflowEngine] startWorkflowExec`, workflowData, options)
    // 更新本地存储中的运行次数
    // if (self.localStorage) {
    //     // const runCounts = parseJSON(self.localStorage.getItem('runCounts'), {}) || {};
    //     const runCounts = attempt(() => {
    //         const runCounts = JSON.parse(self.localStorage.getItem('runCounts')) || {};
    //         return runCounts;
    //     });

    //     runCounts[workflowData.id] = (runCounts[workflowData.id] || 0) + 1;
    //     self.localStorage.setItem('runCounts', JSON.stringify(runCounts));
    // }


    // 如果工作流处于测试模式且已运行，不再启动新的实例
    // if (workflowData.testingMode) {
    //     for (const value of workflowState.states.values()) {
    //         if (value.workflowId === workflowData.id) return null;
    //     }
    // }

    // 克隆工作流数据以避免直接修改原始对象
    // const clonedWorkflowData = cloneWorkflowData(workflowData);
    const clonedWorkflowData = { ...workflowData };

    // 创建工作流引擎实例并初始化
    const engine = new WorkflowEngine(clonedWorkflowData, {
        options,
        isPopup: false,
        states: workflowState,
        // logger:
        blocksHandler: blocksHandler(),
    });

    console.log(`[workflowEngine] init`)
    engine.init(); // 初始化工作流引擎

    // 工作流销毁时的回调逻辑，例如处理通知
    setupWorkflowDestroyedCallback(engine, clonedWorkflowData);

    // 检查并更新状态
    updateCheckStatus();

    return engine; // 返回工作流引擎实例
}


const setupWorkflowDestroyedCallback = (engine: WorkflowEngine, workflowData: any) => {
    // 监听工作流销毁事件
    engine.on('destroy', () => {
        // 这里可以添加工作流销毁后的回调逻辑
        console.log(`Workflow ${workflowData.name} destroyed.`);
    });
}

const updateCheckStatus = () => {
    // 检查工作流状态
    workflowStateStorage.get()
        .then((states) => {
            for (const state of states) {
                if (state.status === 'running') {
                    // 检查工作流是否已经过期
                    if (state.expiresAt && new Date(state.expiresAt) < new Date()) {
                        workflowState.stop(state.id);
                    }
                }
            }
        });
}

// message.on('workflow:execute,这个地方可能是在background.js中调用的', workflowExecute);
const workflowExecute = async (workflowData, sender) => {
    console.log(`[workflowEngine] workflowExecute`, workflowData)
    // const context = workflowData.settings.execContext;

    // const context = 'popup'
    // if ((!context || context === 'popup')) {
    //     await BackgroundUtils.openDashboard('?fromBackground=true', false);
    //     await BackgroundUtils.sendMessageToDashboard('workflow:execute', {
    //         data: workflowData,
    //         options: workflowData.option,
    //     });
    //     return;
    // }

    if (workflowData.includeTabId) {
        if (!workflowData.options) workflowData.options = {};

        workflowData.options.tabId = sender.tab.id;
    }

    BackgroundWorkflowUtils.executeWorkflow(
        workflowData,
        workflowData?.options || {}
    );
}

export {
    stopWorkflowExec,
    executeWorkflow,
    startWorkflowExec,
    workflowExecute
}