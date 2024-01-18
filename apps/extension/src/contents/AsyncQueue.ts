type TaskFunction = () => Promise<void>;

class AsyncQueue {
    private tasks: TaskFunction[];
    private runningTasks: number;
    private failedTasks: number;
    private completedTasks: number;
    private parallelLimit: number;

    constructor(parallelLimit: number = 1) {
        this.tasks = [];
        this.runningTasks = 0;
        this.failedTasks = 0;
        this.completedTasks = 0;
        this.parallelLimit = parallelLimit;
    }

    enqueue(task: TaskFunction): void {
        this.tasks.push(task);
        this.tryRunNext();
    }

    setParallelLimit(newLimit: number): void {
        this.parallelLimit = newLimit;
        this.tryRunNext(); // 尝试立即启动更多的任务（如果可能）
    }

    getTaskCounts(): { running: number; failed: number; completed: number; remaining: number } {
        return {
            running: this.runningTasks,
            failed: this.failedTasks,
            completed: this.completedTasks,
            remaining: this.tasks.length
        };
    }

    get length(): number {
        return this.tasks.length;
    }

    private tryRunNext(): void {
        while (this.runningTasks < this.parallelLimit && this.tasks.length > 0) {
            const task = this.tasks.shift();
            if (task) {
                this.runningTasks++;
                task().then(() => {
                    this.runningTasks--;
                    this.completedTasks++;
                    this.tryRunNext();
                }).catch(() => {
                    this.runningTasks--;
                    this.failedTasks++;
                    this.tryRunNext();
                });
            }
        }
    }
}

export default AsyncQueue;