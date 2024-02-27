import { Action } from "./action";
import { WebEnvironment } from "./env";
import { Thought } from "./thought";

interface Observation {
    target: string,
    environment: WebEnvironment, //观察到的环境
    traceActions: Action[], // 一系列的操作
    routes: string[], // 观察到的多个路径

}

type ObserveWebpage = (args: {
    systemMessage?: string,
    observation: Observation,
    task: string,
    options: {
        vision: boolean
    }
}) => Promise<Thought>

export {
    ObserveWebpage,
    Observation
}