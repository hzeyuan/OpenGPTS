import handleSelector, { markElement } from "~src/contents/handleSelector"
import synchronizedLock from '~src/contents/synchronizedLock';
import { sleep } from "~src/utils/helper";
import { sendMessage } from "~src/utils/message";

async function forms(block) {
  const { data } = block;
  console.trace('forms', block);
  const elements = await handleSelector(block, { returnElement: true });
  console.log('handleForms', elements, document);
  if (!elements) {
    throw new Error('element-not-found');
  }

  if (data.getValue) {
    let result = '';

    if (data.multiple) {
      result = elements.map((element) => element.value || '');
    } else {
      result = elements.value || '';
    }

    return result;
  }

  async function typeText(element) {
    if (data.type === 'text') {
      // get lock
      await synchronizedLock.getLock();
      element.focus?.();

      try {
        if (data.clearValue) {
          const backspaceCommands = new Array(element.value?.length ?? 0).fill({
            type: 'rawKeyDown',
            unmodifiedText: 'Delete',
            text: 'Delete',
            windowsVirtualKeyCode: 46,
          });
          await sendMessage(
            'debugger:type',
            { commands: backspaceCommands, tabId: block.activeTabId, delay: 0 },
            'background'
          );
        }

        const commands = data.value.split('').map((char) => ({
          type: 'keyDown',
          text: char === '\n' ? '\r' : char,
        }));
        const typeDelay = +block.data.delay;
        console.log(`1.sendMessage debugger:type`, new Date())
        await sendMessage(
          'debugger:type',
          {
            commands,
            tabId: block.activeTabId,
            delay: Number.isNaN(typeDelay) ? 0 : typeDelay,
          },
          'background'
        );
        console.log(`1.sendMessage debugger:type`, new Date())
      } finally {
        synchronizedLock.releaseLock();
      }
      return;
    }

    // markElement(element, block);
    // await handleFormElement(element, data);
  }

  if (data.multiple) {
    const promises = Array.from(elements).map((element) => typeText(element));

    await Promise.allSettled(promises);
    await sleep(100);
  } else {
    await typeText(elements);
  }

  return null;
}

export default forms;
