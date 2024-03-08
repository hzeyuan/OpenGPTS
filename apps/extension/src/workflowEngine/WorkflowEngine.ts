import { nanoid } from 'nanoid';
import browser from 'webextension-polyfill';
import { getBlocks } from '~src/utils/workflow';
import WorkflowWorker from './WorkflowWorker';
import { sleep } from '~src/utils/helper';


let blocks = getBlocks();

class WorkflowEngine {

  id: string;
  workflow: any;
  logger: any;
  isDestroyed: boolean;
  eventListeners: { [event: string]: Function[] };

  blocks: any;
  states: any;
  connectionsMap: any;
  columns: any;
  rowData: any;
  columnsId: any;
  referenceData: any;

  blocksHandler: any;

  workerId: number;
  workers: Map<any, any>;

  logsLimit: number;
  startedTimestamp: number;
  options: any;

  triggerBlockId: any;
  state: any;
  parentWorkflow: any;

  onDebugEvent: any;

  constructor(workflow: any, { logger, blocksHandler, states, options }: any) {
    this.id = nanoid(); // 唯一标识符
    this.workflow = workflow; // 工作流数据
    this.logger = logger; // 日志记录器
    this.isDestroyed = false; // 销毁标志
    this.eventListeners = {}; // 事件监听器
    this.isDestroyed = false; // 销毁标志
    this.blocksHandler = blocksHandler; // 
    this.states = states;
    this.blocks = {};
    this.connectionsMap = {};
    this.columns = {};
    this.rowData = {};
    this.columnsId = {};
    this.referenceData = {
      secrets: {},
      variables: {},
      table: [],
    };

    this.onDebugEvent = ({ tabId }, method, params) => {
      let isActiveTabEvent = false;
      this.workers.forEach((worker) => {
        if (isActiveTabEvent) return;

        isActiveTabEvent = worker.activeTab.id === tabId;
      });

      if (!isActiveTabEvent) return;

      (this.eventListeners[method] || []).forEach((listener) => {
        listener(params);
      });
    };


    this.workerId = 0;
    this.workers = new Map();

    this.logsLimit = 1001;
    this.startedTimestamp = 0;
    this.options = options;


  }

  // 初始化工作流
  async init() {
    // 检查工作流是否被禁用，如果是则不进行初始化
    if (this.workflow.isDisabled) {
      console.error("Workflow is disabled.");
      return;
    }
    // 检查是否存在状态对象，如果不存在则记录错误并退出初始化
    if (!this.states) {
      console.error("Workflow states is required.");
      return;
    }
    // 从工作流对象中获取节点和边缘（即工作流中的块和它们的连接）
    const { nodes, edges } = this.workflow.drawflow;
    if (!nodes || nodes.length === 0) {
      console.error(`${this.workflow.name} doesn't have blocks`);
      return;
    }

    // 在节点中查找触发器块，这是工作流开始执行的地方
    const triggerBlock = nodes.find((node) => {
      if (this.options?.blockId) return node.id === this.options.blockId;

      return node.label === 'trigger';
    });
    if (!triggerBlock) {
      console.error(`${this.workflow.name} doesn't have a trigger block`);
      return;
    }

    // 确保工作流设置对象存在
    // if (!this.workflow.settings) {
    //   this.workflow.settings = {};
    // }

    // 获取工作流中所有块的定义
    blocks = getBlocks();
    console.log('blocks', blocks)
    // 检查触发器块是否需要参数，并处理参数输入
    // const checkParams = this.options?.checkParams ?? true;
    // const hasParams =
    //   checkParams && triggerBlock.data?.parameters?.length > 0;
    // if (hasParams) {
    //   // 清空事件监听器，准备接收参数输入
    //   this.eventListeners = {};
    //   // 如果触发器块偏好在当前标签页中输入参数
    //   if (triggerBlock.data.preferParamsInTab) {
    //     const [activeTab] = await browser.tabs.query({
    //       active: true,
    //       url: '*://*/*',
    //       lastFocusedWindow: true,
    //     });
    //     // 如果找到活动标签页，尝试发送消息以输入参数
    //     if (activeTab) {
    //       const result = await browser.tabs.sendMessage(activeTab.id, {
    //         type: 'input-workflow-params',
    //         data: {
    //           workflow: this.workflow,
    //           params: triggerBlock.data.parameters,
    //         },
    //       });

    //       if (result) return;
    //     }
    //   }
    //   // 如果参数不是在当前标签页中输入，创建一个新的参数输入窗口
    //   const paramUrl = browser.runtime.getURL('params.html');
    //   const tabs = await browser.tabs.query({});
    //   const paramTab = tabs.find((tab) => tab.url?.includes(paramUrl));

    //   if (paramTab) {
    //     // 如果已存在参数输入窗口，更新其内容并聚焦
    //     browser.tabs.sendMessage(paramTab.id, {
    //       name: 'workflow:params',
    //       data: this.workflow,
    //     });
    //     browser.windows.update(paramTab.windowId, { focused: true });
    //   } else {
    //     // 如果不存在参数输入窗口，创建一个新窗口
    //     browser.windows.create({
    //       type: 'popup',
    //       width: 480,
    //       height: 700,
    //       url: browser.runtime.getURL(
    //         `/params.html?workflowId=${this.workflow.id}`
    //       ),
    //     });
    //   }
    //   return;
    // }


    // 设置触发器块的ID
    this.triggerBlockId = triggerBlock.id;


    // 将节点列表转换为块映射，用于后续处理
    this.blocks = nodes.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});

    console.log("this.blocks",nodes,  this.blocks)

    // 构建连接映射，这是节点之间连接的详细描述
    this.connectionsMap = edges.reduce(
      (acc, { sourceHandle, target, targetHandle }) => {
        if (!acc[sourceHandle]) acc[sourceHandle] = new Map();
        acc[sourceHandle].set(target, {
          id: target,
          targetHandle,
          sourceHandle,
        });

        return acc;
      },
      {}
    );

    // 处理工作流表格和列的设置
    // const workflowTable = this.workflow.table || this.workflow.dataColumns || [];
    // let columns = Array.isArray(workflowTable) ? workflowTable : Object.values(workflowTable);
    // // 如果工作流连接到一个表，获取并设置相关的列和数据
    // if (this.workflow.connectedTable) {
    //   const connectedTable = await dbStorage.tablesItems.where('id').equals(this.workflow.connectedTable).first();
    //   const connectedTableData = await dbStorage.tablesData.where('tableId').equals(connectedTable?.id).first();
    //   if (connectedTable && connectedTableData) {
    //     columns = Object.values(connectedTable.columns);
    //     Object.assign(this.columns, connectedTableData.columnsIndex);
    //     this.referenceData.table = connectedTableData.items || [];
    //   } else {
    //     this.workflow.connectedTable = null;
    //   }
    // }

    // // 为每列设置数据结构
    // columns.forEach(({ name, type, id }) => {
    //   const columnId = id || name;
    //   this.rowData[name] = null;
    //   this.columnsId[name] = columnId;
    //   if (!this.columns[columnId]) this.columns[columnId] = { index: 0, name, type };
    // });


    // 根据浏览器类型和工作流设置调整调试模式
    // if (BROWSER_TYPE !== 'chrome') {
    //   this.workflow.settings.debugMode = false;
    // } else if (this.workflow.settings.debugMode) {
    //   // 如果支持调试模式，添加调试事件监听器
    //   chrome.debugger.onEvent.addListener(this.onDebugEvent);
    // }
    // 如果启用了状态重用，并且没有连接到表，尝试从本地存储中恢复上一次的状态
    // if (this.workflow.settings.reuseLastState && !this.workflow.connectedTable) {
    //   const lastStateKey = `state:${this.workflow.id}`;
    //   const value = await browser.storage.local.get(lastStateKey);
    //   const lastState = value[lastStateKey];
    //   if (lastState) {
    //     Object.assign(this.columns, lastState.columns);
    //     Object.assign(this.referenceData, lastState.referenceData);
    //   }
    // }
    console.log(`[workflowEngine] addEventListener: onDebugEvent`)
    chrome.debugger.onEvent.addListener(this.onDebugEvent);
    // 从用户设置中获取日志限制
    // const { settings: userSettings } = await browser.storage.local.get('settings');
    // this.logsLimit = userSettings?.logsLimit || 1001;

    // // 更新工作流表格设置
    // this.workflow.table = columns;
    // // 记录初始化时间戳
    // this.startedTimestamp = Date.now();

    // // 为停止和恢复执行的事件注册监听器
    // this.states.on('stop', this.onWorkflowStopped);
    // this.states.on('resume', this.onResumeExecution);

    // // 从数据库中加载凭证和变量，更新引用数据
    // const credentials = await dbStorage.credentials.toArray();
    // credentials.forEach(({ name, value }) => {
    //   this.referenceData.secrets[name] = value;
    // });
    // const variables = await dbStorage.variables.toArray();
    // variables.forEach(({ name, value }) => {
    //   this.referenceData.variables[`$$${name}`] = value;
    // });


    // 添加变量的引用数据快照
    // this.addRefDataSnapshot('variables');

    // 向状态管理器添加当前工作流的状态
    await this.states.add(this.id, {
      id: this.id,
      status: 'running',
      state: this.state,
      workflowId: this.workflow.id,
      parentState: this.parentWorkflow,
      teamId: this.workflow.teamId || null,
    });
    // 为触发器块添加一个新的工作器
    console.debug(`[workflowEngine] addWorker: ${this.workerId}`)
    this.addWorker({ blockId: triggerBlock.id });

  }

  // 停止工作流
  async stop() {
    if (this.isDestroyed) return; // 如果已经销毁，则不执行任何操作

    console.log(`Stopping workflow: ${this.workflow.name}`);
    // 这里可以添加停止工作流的逻辑

    // 示例：记录工作流停止日志
    // this.logger.log(`Workflow ${this.workflow.name} stopped.`);
    console.log(`Workflow ${this.workflow.name} stopped.`);

    await this.destroy(); // 调用销毁函数
  }

  // 销毁工作流
  async destroy(status, message, blockDetail) {
    const cleanUp = () => {
      this.id = null;
      this.states = null;
      this.logger = null;
      this.saveLog = null;
      this.workflow = null;
      this.blocksHandler = null;
      this.parentWorkflow = null;

      this.isDestroyed = true;
      this.referenceData = null;
      this.eventListeners = null;
      this.packagesCache = null;
      this.extractedGroup = null;
      this.connectionsMap = null;
      this.waitConnections = null;
      this.blocks = null;
      this.history = null;
      this.columnsId = null;
      this.historyCtxData = null;
      this.preloadScripts = null;
    };

    try {
      if (this.isDestroyed) return; // 防止重复销毁
      chrome.debugger.onEvent.removeListener(this.onDebugEvent);
      await sleep(1000);

      this.workers.forEach((worker) => {
        if (!worker.debugAttached) return;

        chrome.debugger.detach({ tabId: worker.activeTab.id });
      });
      this.workers.clear();

      // this.dispatchEvent('destroyed', {
      //   status,
      //   message,
      //   blockDetail,
      //   id: this.id,
      //   endedTimestamp,
      //   history: this.history,
      //   startedTimestamp: this.startedTimestamp,
      // });
    } catch (error) {

    }



    this.isDestroyed = true; // 标记为已销毁
    console.log(`Destroying workflow: ${this.workflow.name}`);
    // 这里可以添加销毁工作流的清理逻辑

    // 示例：记录工作流销毁日志
    // this.logger.log(`Workflow ${this.workflow.name} destroyed.`);
    console.log(`Workflow ${this.workflow.name} destroyed.`);
  }

  on(eventName: string, listener: Function) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(listener);
  }

  off(eventName: string, listener: Function) {
    if (!this.eventListeners[eventName]) return;
    this.eventListeners[eventName] = this.eventListeners[eventName].filter(l => l !== listener);
  }

  emit(eventName: string, ...args: any[]) {
    if (!this.eventListeners[eventName]) return;
    this.eventListeners[eventName].forEach(listener => {
      listener(...args);
    });
  }


  addWorker(detail) {
    this.workerId += 1;
    const workerId = `worker-${this.workerId}`;
    const worker = new WorkflowWorker(workerId, this, { blocksDetail: blocks });
    worker.init(detail);

    this.workers.set(worker.id, worker);
  }

  async updateState(data) {
    const state = {
      ...data,
      tabIds: [],
      currentBlock: [],
      name: this.workflow.name,
      logs: this.history,
      ctxData: {
        ctxData: this.historyCtxData,
        dataSnapshot: this.refDataSnapshots,
      },
      startedTimestamp: this.startedTimestamp,
    };

    this.workers.forEach((worker) => {
      const { id, label, startedAt } = worker.currentBlock;

      state.currentBlock.push({ id, name: label, startedAt });
      state.tabIds.push(worker.activeTab.id);
    });

    await this.states.update(this.id, { state });
    this.dispatchEvent('update', { state });
  }

  async destroyWorker(workerId) {
    // is last worker
    if (this.workers.size === 1 && this.workers.has(workerId)) {
      // this.addLogHistory({
      //   type: 'finish',
      //   name: 'finish',
      // });
      this.dispatchEvent('finish');
      await this.destroy('success');
    }
    // wait detach debugger
    this.workers.delete(workerId);
  }

  dispatchEvent(name, params) {
    const listeners = this.eventListeners[name];

    if (!listeners) return;

    listeners.forEach((callback) => {
      callback(params);
    });
  }

}

export default WorkflowEngine;
