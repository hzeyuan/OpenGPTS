import type { PlasmoCSConfig } from "plasmo"
import { relayMessage } from "@plasmohq/messaging"

export const config: PlasmoCSConfig = {
    matches: ["http://localhost:1947/*","https://open-gpts.vercel.app/"],
}

console.log('opengpts inject')
// contents/loginDetector.ts

relayMessage({
    name: "opengpts",
});

// 监听来自网页的消息
// window.addEventListener("message", (event) => {
//     // console.log("接受消息",event.data,event.source)
//     // 确认消息来源和类型
//     if (event.source === window && event.data.type === "SIGNED_IN") {
//         console.log("接受消息",event.data)
//         // Relay消息给背景脚本
//         relayMessage({
//             name: "login-success",
//             body: event.data
//         });
//     }
// });