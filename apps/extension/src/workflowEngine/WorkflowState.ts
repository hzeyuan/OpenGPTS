import browser from 'webextension-polyfill';

// 定义状态数据接口
interface StateData {
  [key: string]: any;
}

// 定义事件监听器类型
type EventListener = (params?: any) => void;

class WorkflowState {
  private key: string;
  private storage: typeof browser.storage.local;
  public states: Map<string, StateData>;
  private eventListeners: { [eventName: string]: EventListener[] };
  private storageTimeout: NodeJS.Timeout | null;

  constructor({ storage, key = 'workflowState' }: { storage: typeof browser.storage.local, key?: string }) {
    this.key = key; // 存储键名
    this.storage = storage; // 浏览器存储对象

    this.states = new Map<string, StateData>(); // 工作流状态
    this.eventListeners = {}; // 事件监听器集合

    this.storageTimeout = null; // 存储延迟计时器
  }

  // 更新浏览器扩展图标的徽章文本
  private _updateBadge(): void {
    const browserAction = browser.action || browser.browserAction;
    browserAction.setBadgeText({ text: (this.states.size || '').toString() });
  }

  // 将状态保存到浏览器存储中
  private _saveToStorage(): void {
    console.log(`Save to storage,key:[${this.key}]`)
    if (this.storageTimeout) return;

    this.storageTimeout = setTimeout(() => {
      this.storageTimeout = null;

      const states = Object.fromEntries(this.states);
      console.log('states', states, this.key)
      this.storage.set({ [this.key]: states });
    }, 1000);
  }

  // 派发事件
  public dispatchEvent(name: string, params?: any): void {
    const listeners = this.eventListeners[name];

    if (!listeners) return;

    listeners.forEach((callback) => {
      callback(params);
    });
  }

  // 添加事件监听器
  public on(name: string, listener: EventListener): void {
    this.eventListeners[name] = this.eventListeners[name] || [];
    this.eventListeners[name].push(listener);
  }

  // 移除事件监听器
  public off(name: string, listener: EventListener): void {
    const listeners = this.eventListeners[name];
    if (!listeners) return;

    const index = listeners.indexOf(listener);
    if (index !== -1) listeners.splice(index, 1);
  }

  // 获取所有状态
  public getAll(): Map<string, StateData> {
    return this.states;
  }

  // 获取特定ID的状态或满足条件的状态
  public async get(stateId: string | ((state: StateData) => boolean)): Promise<StateData | undefined> {
    if (typeof stateId === 'function') {
      return Array.from(this.states.entries()).find(([_, state]) => stateId(state))?.[1];
    } else {
      return this.states.get(stateId);
    }
  }

  // 添加或更新状态
  public async add(id: string, data: StateData = {}): Promise<void> {
    this.states.set(id, data);
    this._updateBadge();
    // this._saveToStorage();
  }

  // 停止指定ID的状态
  public async stop(id: string): Promise<string | undefined> {
    const state = await this.get(id);
    if (!state) {
      await this.delete(id);
      this.dispatchEvent('stop', id);
      return id;
    }

    await this.update(id, { isDestroyed: true });
    this.dispatchEvent('stop', id);
    return id;
  }

  // 恢复指定ID的状态
  public async resume(id: string, nextBlock?: any): Promise<void> {
    const state = this.states.get(id);
    if (!state) return;

    this.states.set(id, { ...state, status: 'running' });
    // this._saveToStorage();

    this.dispatchEvent('resume', { id, nextBlock });
  }

  // 更新指定ID的状态
  public async update(id: string, data: StateData = {}): Promise<void> {
    const state = this.states.get(id);
    if (!state) return;

    this.states.set(id, { ...state, ...data });
    this.dispatchEvent('update', { id, data });
    // this._saveToStorage();
  }

  // 删除指定ID的状态
  public async delete(id: string): Promise<void> {
    this.states.delete(id);
    this.dispatchEvent('delete', id);
    this._updateBadge();
    // this._saveToStorage();
  }
}

export default WorkflowState;
