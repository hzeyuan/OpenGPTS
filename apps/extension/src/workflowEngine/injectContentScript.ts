import browser from 'webextension-polyfill';

const isMV2 = browser.runtime.getManifest().manifest_version === 2;

async function contentScriptExist(tabId, frameId = 0) {
  try {
    await browser.tabs.sendMessage(
      tabId,
      { type: 'content-script-exists' },
      { frameId }
    );

    return true;
  } catch (error) {
    return false;
  }
}

export default function (tabId, frameId = 0) {
  return new Promise((resolve) => {
    const currentFrameId = typeof frameId !== 'number' ? 0 : frameId;
    let tryCount = 0;

    (async function tryExecute() {
      try {
        if (tryCount > 3) {
          resolve(false);
          return;
        }

        tryCount += 1;

        if (isMV2) {
          await browser.tabs.executeScript(tabId, {
            allFrames: true,
            runAt: 'document_start',
            file: './contentScript.bundle.js',
          });
        } else {
          await browser.scripting.executeScript({
            target: {
              tabId,
              allFrames: true,
            },
            injectImmediately: true,
            files: ['./contentScript.bundle.js'],
          });
        }

        const isScriptExists = await contentScriptExist(tabId, currentFrameId);

        if (isScriptExists) {
          resolve(true);
        } else {
          setTimeout(tryExecute, 1000);
        }
      } catch (error) {
        console.error(error);
        setTimeout(tryExecute, 1000);
      }
    })();
  });
}
