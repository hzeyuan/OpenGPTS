import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    console.log("触发 get-current-window");

    // 获取当前窗口
    chrome.windows.getCurrent({populate: true}, function(currentWindow) {
        if (!currentWindow) {
            res.send({ error: "No active window found" });
            return;
        }

        // 格式化当前窗口信息
        const formattedWindow = {
            id: currentWindow.id,
            focused: currentWindow.focused,
            incognito: currentWindow.incognito,
            type: currentWindow.type,
            state: currentWindow.state,
            // 如果需要，还可以添加其他信息
        };

        res.send(formattedWindow);
    });
}


export default handler
