import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    // 获取当前窗口
  const {tabId} = req.body
  // 关闭窗口
  await chrome.tabs.remove(tabId)
  // 返回结果
  res.send(true)  

}


export default handler
