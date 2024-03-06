class SynchronizedLock {
    private lock: boolean; // 锁状态，false表示未锁定，true表示已锁定
    private queue: Array<() => void>; // 等待获取锁的队列

    constructor() {
        this.lock = false; // 初始状态为未锁定
        this.queue = []; // 初始化队列
    }

    // 尝试获取锁，如果锁已被占用，则等待直到锁被释放或超时
    async getLock(timeout: number = 10000): Promise<void> {
        while (this.lock) { // 如果锁被占用
            await new Promise<void>((resolve) => { // 等待锁被释放或超时
                this.queue.push(resolve); // 将resolve函数添加到队列中
                setTimeout(() => { // 设置超时函数
                    const index = this.queue.indexOf(resolve); // 查找resolve函数在队列中的位置
                    if (index !== -1) { // 如果找到
                        this.queue.splice(index, 1); // 从队列中移除
                        console.warn('SynchronizedLock timeout'); // 输出警告信息
                        resolve(); // 结束等待
                    }
                }, timeout);
            });
        }

        this.lock = true; // 获取到锁，设置锁状态为已锁定
    }

    // 释放锁
    releaseLock(): void {
        this.lock = false; // 设置锁状态为未锁定
        const resolve = this.queue.shift(); // 从队列中取出第一个resolve函数
        if (resolve) resolve(); // 如果存在，调用resolve函数，结束等待
    }
}

const synchronizedLock = new SynchronizedLock(); // 创建一个SynchronizedLock实例

export default synchronizedLock; // 导出SynchronizedLock实例