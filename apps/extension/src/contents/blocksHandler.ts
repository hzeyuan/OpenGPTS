import handlerForms from './blocksHandler/handlerForms'
import handlerEventClick from './blocksHandler/handlerEventClick'
import handlerTriggerEvent from './blocksHandler/handlerTriggerEvent'



interface Handler {
  [key: string]: any;
}

export default function (): { [key: string]: Handler } {
  return {
    forms: handlerForms,
    'eventClick':handlerEventClick,
    'triggerEvent':handlerTriggerEvent
  };
}
