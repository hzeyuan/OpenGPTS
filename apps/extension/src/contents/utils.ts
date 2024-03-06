export async function getElementPosition(element) {
  const elWindow = element.ownerDocument.defaultView;
  const isInFrame = elWindow !== window.top;
  const { width, height, x, y } = element.getBoundingClientRect();

  const position = {
    x: x + width / 2,
    y: y + height / 2,
  };

  if (!isInFrame) return position;

  try {
    const frameEl = elWindow.frameElement;
    let frameRect = null;

    if (frameEl) {
      frameRect = frameEl.getBoundingClientRect();
    } else {
      // TODO: 未知
      // frameRect = await messageTopFrame(elWindow);

      if (!frameRect) throw new Error('Iframe not found');
    }

    position.x += frameRect.x;
    position.y += frameRect.y;

    return position;
  } catch (error) {
    console.error(error);
    return position;
  }
}


export function elementSelectorInstance() {
  const rootElementExist = document.querySelector(
    '#app-container.automa-element-selector'
  );

  if (rootElementExist) {
    rootElementExist.style.display = 'block';

    return true;
  }

  return false;
}