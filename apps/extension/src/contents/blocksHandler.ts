import handlerForms from './blocksHandler/handlerForms'
import handlerEventClick from './blocksHandler/handlerEventClick'
import handlerTriggerEvent from './blocksHandler/handlerTriggerEvent'
import handlerTakeScreenshot from './blocksHandler/handlerTakeScreenshot'
import handlerElementScroll from './blocksHandler/handlerElementScroll';

interface Handler {
  [key: string]: any;
}

export default function (): { [key: string]: Handler } {
  return {
    forms: handlerForms,
    'eventClick': handlerEventClick,
    'triggerEvent': handlerTriggerEvent,
    'elementScroll': handlerElementScroll,
    // 'take-screenshot': handlerTakeScreenshot,
  };
}
