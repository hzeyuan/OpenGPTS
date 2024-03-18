import handlerForms from './blocksHandler/handlerForms'
import handlerEventClick from './blocksHandler/handlerEventClick'
import handlerTriggerEvent from './blocksHandler/handlerTriggerEvent'
// import handlerTakeScreenshot from './blocksHandler/handlerTakeScreenshot'
import handlerElementScroll from './blocksHandler/handlerElementScroll';
import handleGetText from './blocksHandler/handleGetText';

interface Handler {
  [key: string]: any;
}

export default function (): { [key: string]: Handler } {
  return {
    forms: handlerForms,
    'eventClick': handlerEventClick,
    'triggerEvent': handlerTriggerEvent,
    'elementScroll': handlerElementScroll,
    'getText':handleGetText,
    // 'take-screenshot': handlerTakeScreenshot,
  };
}
