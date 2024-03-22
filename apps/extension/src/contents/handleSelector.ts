import FindElement from '~src/utils/FindElement';
import { visibleInViewport, isXPath } from '~src/utils/helper';
import { markPage } from '~src/utils/view';







export function markElement(el, { id, data }) {
  if (data.markEl) {
    el.setAttribute(`block--${id}`, '');
  }
  console.log('markElement', el, data.selector, data)
  markPage(data.selector)
}


export function getDocumentCtx(frameSelector) {
  if (!frameSelector) return document;

  let documentCtx = document;

  const iframeSelectors = frameSelector.split('|>');
  const type = isXPath(frameSelector) ? 'xpath' : 'cssSelector';
  iframeSelectors.forEach((selector) => {
    if (!documentCtx) return;

    const element = FindElement[type]({ selector }, documentCtx);
    documentCtx = element?.contentDocument;
  });

  return documentCtx;
}

export function queryElements(data, documentCtx = document) {
  return new Promise((resolve) => {
    let timeout = null;
    let isTimeout = false;

    const findSelector = () => {
      if (isTimeout) return;

      const selectorType = data.findBy || 'cssSelector';
      console.log('selectorType', selectorType, data, documentCtx)
      const elements = FindElement[selectorType](data, documentCtx);
      const isElNotFound = !elements || elements.length === 0;

      if (isElNotFound && data.waitForSelector) {
        setTimeout(findSelector, 200);
      } else {
        if (timeout) clearTimeout(timeout);
        resolve(elements);
      }
    };

    findSelector();

    if (data.waitForSelector) {
      timeout = setTimeout(() => {
        isTimeout = true;
        resolve(null);
      }, data.waitSelectorTimeout);
    }
  });
}



export default async function (
  { data, id, frameSelector, debugMode },
  { onSelected, onError, onSuccess, withDocument } = {}
) {
  if (!data || !data.selector) {
    if (onError) onError(new Error('selector-empty'));
    return null;
  }
  console.log('[handle Selector]frameSelector', frameSelector)
  const documentCtx = getDocumentCtx(frameSelector);

  if (!documentCtx) {
    if (onError) onError(new Error('iframe-not-found'));

    return null;
  }

  try {
    data.blockIdAttr = `block--${id}`;
    console.log('[handle Selector] documentCtx', documentCtx);
    const elements = await queryElements(data, documentCtx);
    console.log('[handle Selector] elements', elements);
    if (!elements || elements.length === 0) {
      if (onError) onError(new Error('element-not-found'));

      return null;
    }

    const elementsArr = data.multiple ? Array.from(elements) : [elements];

    await Promise.allSettled(
      elementsArr.map(async (el) => {
        markElement(el, { id, data });
        console.log('debug Mode', debugMode, el)
        if (debugMode) {
          const isInViewport = visibleInViewport(el);
          if (!isInViewport) el.scrollIntoView();
        }

        if (onSelected) await onSelected(el);
      })
    );

    if (onSuccess) onSuccess();
    if (withDocument) {
      return {
        elements,
        document: documentCtx,
      };
    }

    return elements;
  } catch (error) {
    if (onError) onError(error);

    throw error;
  }
}