import { cloneDeep } from "lodash-es";
import { toCamelCase } from "~src/utils/helper";
import browser from 'webextension-polyfill';
import templating from './templating';
import { waitTabLoaded } from "./helper";
import { sendToContentScript } from "@plasmohq/messaging";
import injectContentScript from "./injectContentScript";
// import renderString from './templating/renderString';
import { sendMessage } from '~src/utils/message';

function blockExecutionWrapper(blockHandler: () => Promise<any>, blockData: { settings: { blockTimeout: any; }; }) {
    return new Promise((resolve, reject) => {
        let timeout: string | number | NodeJS.Timeout | null | undefined = null;
        const timeoutMs = blockData?.settings?.blockTimeout;
        if (timeoutMs && timeoutMs > 0) {
            timeout = setTimeout(() => {
                reject(new Error('Timeout'));
            }, timeoutMs);
        }

        blockHandler()
            .then((result: unknown) => {
                resolve(result);
            })
            .catch((error: any) => {
                reject(error);
            })
            .finally(() => {
                if (timeout) clearTimeout(timeout);
            });
    });
}

class WorkflowWorker {
    id: any;
    engine: any;
    settings: any;
    blocksDetail: any;
    loopEls: never[];
    loopList: {};
    repeatedTasks: {};
    preloadScripts: never[];
    // breakpointState: null;
    windowId: null;
    currentBlock: null;
    childWorkflowId: null;
    debugAttached: boolean;
    activeTab: { url: string; frameId: number; frames: {}; groupId: null; id: any; };
    frameSelector:any;
    constructor(id: any, engine: { workflow: { settings: any; }; options: { tabId: any; }; }, options = {}) {
        this.id = id;
        this.engine = engine;
        this.settings = engine.workflow.settings;
        this.blocksDetail = options.blocksDetail || {};

        this.loopEls = [];
        this.loopList = {};
        this.repeatedTasks = {};
        this.preloadScripts = [];
        // this.breakpointState = null;

        this.windowId = null;
        this.currentBlock = null;
        this.childWorkflowId = null;

        this.debugAttached = false;

        this.activeTab = {
            url: '',
            frameId: 0,
            frames: {},
            groupId: null,
            id: engine.options?.tabId,
        };

        this.frameSelector = '';
    }

    init({ blockId, execParam, state }) {
        if (state) {
            Object.keys(state).forEach((key) => {
                console.log(`%c WorkflowWorker init state`, 'color: red', key, state[key])
                this[key] = state[key];
            });
        }
        const block = this.engine.blocks[blockId];
        console.log(`%c WorkflowWorker first executeBlock`, 'color: red', block.label, execParam)
        this.executeBlock(block, execParam);
    }

    // zh: 获取block的连接
    getBlockConnections(blockId: string, outputIndex = 1) {
        if (this.engine.isDestroyed) return null;

        const outputId = `${blockId}-output-${outputIndex}`;
        const connections = this.engine.connectionsMap[outputId];

        if (!connections) return null;

        return [...connections.values()];
    }

    // zh: 执行下一个block
    executeNextBlocks(
        connections: any[],
        prevBlockData: any,
        nextBlockBreakpointCount = null
    ) {
        // pre check
        for (const connection of connections) {
            const id = typeof connection === 'string' ? connection : connection.id;

            const block = this.engine.blocks[id];

            if (!block) {
                console.error(`Block ${id} doesn't exist`);
                this.engine.destroy('stopped');
                return;
            }

            // pass disabled block
            // eslint-disable-next-line no-continue
            if (block.data.disableBlock) continue;

            // check if the next block is breakpoint
            if (block.data?.$breakpoint) {
                // set breakpoint state
                nextBlockBreakpointCount = 0;
            }
        }

        // console.log(`1. 过去executeNextBlocks connections`, connections)
        console.log(`%c 所有的connections: ${JSON.stringify(connections)}`, 'color: red')
        connections.forEach((connection: { id: any; targetHandle: any; sourceHandle: any; }, index: number) => {
            console.log(`%c  当前的connection: ${JSON.stringify(connection)}`, 'color: red', "prevBlockData", prevBlockData)
            const { id, targetHandle, sourceHandle } =
                typeof connection === 'string'
                    ? { id: connection, targetHandle: '', sourceHandle: '' }
                    : connection;
            const execParam = {
                prevBlockData,
                targetHandle,
                sourceHandle,
                nextBlockBreakpointCount,
            };
            console.log('execParam', execParam)
            if (index === 0) {
                this.executeBlock(this.engine.blocks[id], {
                    prevBlockData,
                    ...execParam,
                });
            } else {
                const state = cloneDeep({
                    windowId: this.windowId,
                    loopList: this.loopList,
                    activeTab: this.activeTab,
                    currentBlock: this.currentBlock,
                    repeatedTasks: this.repeatedTasks,
                    preloadScripts: this.preloadScripts,
                    debugAttached: this.debugAttached,
                });

                this.engine.addWorker({
                    state,
                    execParam,
                    blockId: id,
                });
            }
        });
    }


    async executeBlock(block, execParam = {}, isRetry = false) {
        console.log(`[workflowWorker] executeBlock label: ${block.label}`)
        console.log(`[workflowWorker] executeBlock execParam: ${JSON.stringify(execParam)}`,)
        console.log(`[workflowWorker] executeBlock engine: ${JSON.stringify(this.engine)}`,)
        const currentState = await this.engine.states.get(this.engine.id);

        // zh: 如果当前状态不存在或者已经被销毁，那么直接销毁当前worker
        if (!currentState || currentState.isDestroyed) {
            if (this.engine.isDestroyed) return;

            await this.engine.destroy('stopped');
            return;
        }

        // zh: 如果当前worker已经被销毁，那么直接返回
        const startExecuteTime = Date.now();
        const prevBlock = this.currentBlock;
        this.currentBlock = { ...block, startedAt: startExecuteTime };


        const isInBreakpoint =
            this.engine.isTestingMode &&
            ((block.data?.$breakpoint && !execParam.resume) ||
                execParam.nextBlockBreakpointCount === 0);

        // zh: 如果当前block是断点，那么直接返回
        if (!isRetry) {
            const payload = {
                activeTabUrl: this.activeTab.url,
                childWorkflowId: this.childWorkflowId,
                nextBlockBreakpoint: Boolean(execParam.nextBlockBreakpointCount),
            };
            if (isInBreakpoint && currentState.status !== 'breakpoint')
                payload.status = 'breakpoint';

            await this.engine.updateState(payload);
        }

        // if (execParam.nextBlockBreakpointCount) {
        //     execParam.nextBlockBreakpointCount -= 1;
        // }

        // if (isInBreakpoint || currentState.status === 'breakpoint') {
        //     this.engine.isInBreakpoint = true;
        //     this.breakpointState = { block, execParam, isRetry };

        //     return;
        // }


        const blockHandler = this.engine.blocksHandler?.[toCamelCase(block.label)];

        let handler = blockHandler;
        if ((!blockHandler && this.blocksDetail[block.label]?.category === 'interaction')
            || this.blocksDetail[block.label] == 'takeScreenshot'
        ) {
            handler = this.engine.blocksHandler.interactionBlock
        }

        // console.log('this.engine.blocksHandler.interactionBlock',handler);
        if (!handler) {
            console.error(`${block.label} doesn't have handler`);
            this.engine.destroy('stopped');
            return;
        }

        const { prevBlockData } = execParam;
        const refData = {
            prevBlockData,
            ...this.engine.referenceData,
            activeTabUrl: this.activeTab.url,
        };

        console.log('[workflowWorker] executeBlock refData', this.engine.referenceData);
        // 动态地处理和更新block中的数据，特别是在需要根据某些外部或动态数据来替换block内部数据
        const replacedBlock = await templating({
            block: {
                ...block,
                prevBlockData
            },
            data: refData,
            isPopup: this.engine.isPopup,
            refKeys:
                isRetry || block.data.disableBlock
                    ? null
                    : [
                        ...this.blocksDetail[block.label].refDataKeys,
                    ],
        });
        console.log(
            `8. workflowWorker executeBlock -> replacedBlock`,
            replacedBlock
        );



        const blockDelay = this.settings?.blockDelay || 0;
        const addBlockLog = (status, obj = {}) => {
            let { description } = block.data;


            if (block.label === 'loop-breakpoint') description = block.data.loopId;
            else if (block.label === 'block-package') description = block.data.name;

            console.log(`addBlockLog: ${description}`)

            // this.engine.addLogHistory({
            //     description,
            //     prevBlockData,
            //     type: status,
            //     name: block.label,
            //     blockId: block.id,
            //     workerId: this.id,
            //     timestamp: startExecuteTime,
            //     activeTabUrl: this.activeTab?.url,
            //     replacedValue: replacedBlock.replacedValue,
            //     duration: Math.round(Date.now() - startExecuteTime),
            //     ...obj,
            // });
        };

        const executeBlocks = (blocks, data) => {
            return this.executeNextBlocks(
                blocks,
                data,
                execParam.nextBlockBreakpointCount
            );
        };

        try {
            let result: any;
            // zh: 如果block是禁用的，那么直接返回
            if (block.data.disableBlock) {
                result = {
                    data: '',
                    nextBlockId: this.getBlockConnections(block.id),
                };
            } else {
                // zh: 执行block的处理器
                const bindedHandler = handler.bind(this, replacedBlock, {
                    refData,
                    prevBlock,
                    ...(execParam || {}),
                });
                // console.log(`blockExecutionWrapper: ${replacedBlock.label}`, new Date())
                console.log(`blockExecutionWrapper: ${replacedBlock.label}`, new Date())
                chrome.tabs.query({ url: "*://localhost/*" }, function (tabs) {
                    tabs.forEach(function (tab) {
                        if (!tab.id) return;
                        chrome.tabs.sendMessage(tab.id, {
                            type: 'BLOCK_STARTED',
                            data: {
                                type: 'BLOCK_STARTED',
                                block: block,
                                input: {
                                    prevBlockData, //上一个Block的输入
                                    // 编辑器中输入的数据
                                    ...block.data
                                },
                            }

                        }, function (response) {
                            console.log('Response from tab ' + tab.id, response);
                            // 可以在这里处理来自内容脚本的响应
                        });
                    });
                });
                result = await blockExecutionWrapper(bindedHandler, block.data);
                chrome.tabs.query({ url: "*://localhost/*" }, function (tabs) {
                    tabs.forEach(function (tab) {
                        if (!tab.id) return;
                        chrome.tabs.sendMessage(tab.id, {
                            type: 'BLOCK_EXECUTED',
                            data: {
                                type: 'BLOCK_EXECUTED',
                                block: block,
                                output: result.data || "",
                            }

                        }, function (response) {
                            console.log('Response from tab ' + tab.id, response);
                            // 可以在这里处理来自内容脚本的响应
                        });
                    });
                });
                console.log(`blockExecutionWrapper: ${replacedBlock.label} result`, result, new Date())


                if (this.engine.isDestroyed) return;

                if (result.replacedValue) {
                    replacedBlock.replacedValue = result.replacedValue;
                }

                addBlockLog(result.status || 'success', {
                    logId: result.logId,
                    ctxData: result?.ctxData,
                });
            }
            // zh: 如果block有下一个block，那么执行下一个block,否则销毁当前worker


            console.log(`[workflowWorker] has next block`, result.nextBlockId, result.data, new Date())
            if (result.nextBlockId && !result.destroyWorker) {
                if (blockDelay > 0) {
                    setTimeout(() => {
                        executeBlocks(result.nextBlockId, result.data);
                    }, blockDelay);
                } else {
                    executeBlocks(result.nextBlockId, result.data);
                }
            } else {
                console.log(`[workflowWorker] destroyWorker`, new Date())
                this.engine.destroyWorker(this.id);
            }
        } catch (error: any) {
            console.error(error);

            const errorLogData = {
                message: error.message,
                ...(error.data || {}),
                ...(error.ctxData || {}),
            };

            // const { onError: blockOnError } = replacedBlock.data;
            // if (blockOnError && blockOnError.enable) {
            //     if (blockOnError.retry && blockOnError.retryTimes) {
            //         await sleep(blockOnError.retryInterval * 1000);
            //         blockOnError.retryTimes -= 1;
            //         await this.executeBlock(replacedBlock, execParam, true);

            //         return;
            //     }

            //     if (blockOnError.insertData) {
            //         for (const item of blockOnError.dataToInsert) {
            //             let value = (
            //                 await renderString(item.value, refData, this.engine.isPopup)
            //             )?.value;
            //             value = parseJSON(value, value);

            //             if (item.type === 'variable') {
            //                 await this.setVariable(item.name, value);
            //             } else {
            //                 this.addDataToColumn(item.name, value);
            //             }
            //         }
            //     }

            //     const nextBlocks = this.getBlockConnections(
            //         block.id,
            //         blockOnError.toDo === 'continue' ? 1 : 'fallback'
            //     );
            //     if (blockOnError.toDo !== 'error' && nextBlocks) {
            //         addBlockLog('error', errorLogData);

            //         executeBlocks(nextBlocks, prevBlockData);

            //         return;
            //     }
            // }

            const errorLogItem = errorLogData;
            addBlockLog('error', errorLogItem);

            errorLogItem.blockId = block.id;

            const { onError } = this.settings;
            const nodeConnections = this.getBlockConnections(block.id);

            // if (onError === 'keep-running' && nodeConnections) {
            //     setTimeout(() => {
            //         executeBlocks(nodeConnections, error.data || '');
            //     }, blockDelay);
            // } else if (onError === 'restart-workflow' && !this.parentWorkflow) {
            //     const restartCount = this.engine.restartWorkersCount[this.id] || 0;
            //     const maxRestart = this.settings.restartTimes ?? 3;

            //     if (restartCount >= maxRestart) {
            //         delete this.engine.restartWorkersCount[this.id];
            //         this.engine.destroy('error', error.message, errorLogItem);
            //         return;
            //     }

            //     this.reset();

            //     const triggerBlock = this.engine.blocks[this.engine.triggerBlockId];
            //     if (triggerBlock) this.executeBlock(triggerBlock, execParam);

            //     this.engine.restartWorkersCount[this.id] = restartCount + 1;
            // } else {
            //     this.engine.destroy('error', error.message, errorLogItem);
            // }
            this.engine.destroy('error', error.message, errorLogItem);
        }
    }

    // zh: 暂停/恢复当前worker
    // resume(nextBlock: any) {
    //     if (!this.breakpointState) return;

    //     const { block, execParam, isRetry } = this.breakpointState;
    //     const payload = { ...execParam, resume: true };

    //     payload.nextBlockBreakpointCount = nextBlock ? 1 : null;

    //     this.executeBlock(block, payload, isRetry);

    //     this.breakpointState = null;
    // }


    // zh: 重置当前worker
    reset() {
        this.loopList = {};
        this.repeatedTasks = {};

        this.windowId = null;
        this.currentBlock = null;
        this.childWorkflowId = null;

        this.engine.history = [];
        this.engine.preloadScripts = [];
        this.engine.columns = {
            column: {
                index: 0,
                type: 'any',
                // name: this.settings?.defaultColumnName || 'column',
                name: 'column',
            },
        };

        this.activeTab = {
            url: '',
            frameId: 0,
            frames: {},
            groupId: null,
            id: this.options?.tabId,
        };
        this.engine.referenceData = {
            table: [],
            loopData: {},
            workflow: {},
            googleSheets: {},
            variables: this.engine.options?.variables || {},
            globalData: this.engine.referenceData.globalData,
        };
    }

    async _sendMessageToTab(payload, options = {}, runBeforeLoad = false) {
        try {
            if (!this.activeTab.id) {
                const error = new Error('no-tab');
                error.workflowId = this.id;

                throw error;
            }

            if (!runBeforeLoad) {
                await waitTabLoaded({
                    tabId: this.activeTab.id,
                    // ms: this.settings?.tabLoadTimeout ?? 30000,
                    ms: 30000
                });
            }

            // const { executedBlockOnWeb } = this.settings;
            const messagePayload = {
                isBlock: true,
                debugMode: true,
                executedBlockOnWeb: false,
                loopEls: this.loopEls,
                activeTabId: this.activeTab.id,
                frameSelector: this.frameSelector,
                ...payload,
            };
            console.log(`1. _sendMessageToTab,发送消息到contentjs`, new Date())
            try {
                const data = await browser.tabs.sendMessage(
                    this.activeTab.id,
                    messagePayload,
                    { frameId: this.activeTab.frameId, ...options }
                );
                console.log(`1. _sendMessageToTab,发送消息到contentjs,返回结果`, data, new Date())
                return data;
            } catch (error) {
                console.log('rowser.tabs.sendMessage', error)
            }

        } catch (error) {
            console.error("_sendMessageToTab", error);
            // const noConnection = error.message?.includes(
            //     'Could not establish connection'
            // );
            // const channelClosed = error.message?.includes('message channel closed');

            // if (noConnection || channelClosed) {
            //     const isScriptInjected = await injectContentScript(
            //         this.activeTab.id,
            //         this.activeTab.frameId
            //     );

            //     if (isScriptInjected) {
            //         const result = await this._sendMessageToTab(
            //             payload,
            //             options,
            //             runBeforeLoad
            //         );
            //         return result;
            //     }
            //     error.message = 'Could not establish connection to the active tab';
            // } else if (error.message?.startsWith('No tab')) {
            //     error.message = 'active-tab-removed';
            // }

            throw error;
        }
    }
}

export default WorkflowWorker;