
import { sendMessage } from "~src/utils/message";
import handleSelector from "~src/contents/handleSelector";
import { getElementPosition } from "~src/contents/utils";
import { sleep } from "~src/utils/rpa";



function eventClick(block): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`eventClick, block:`, block.activeTabId,window.document);
    const e = document.querySelector(block.data.selector);
    console.log('document.querySelector(block.data.selector)', e);
    // 判断元素是否被遮挡
    
    handleSelector(block, {
      async onSelected(element) {

        const { x, y } = await getElementPosition(element);
        const payload = {
          tabId: block.activeTabId,
          method: 'Input.dispatchMouseEvent',
          params: {
            x,
            y,
            button: 'left',
          },
        };
        console.log('payload', payload)
        const executeCommand = (type) => {
          payload.params.type = type;

          if (type === 'mousePressed') {
            payload.params.clickCount = 1;
          }
          return sendMessage('debugger:send-command', payload, 'background');
        };

        // bypass the bot detection.
        await executeCommand('mouseMoved');
        await sleep(100);
        await executeCommand('mousePressed');
        await sleep(100);
        await executeCommand('mouseReleased');

        return;


      },
      onError(error) {
        reject(error);
      },
      onSuccess() {
        resolve('');
      },
      withDocument: document, // Add this line
    });
  });
}

export default eventClick;
