import { useEffect, useRef, useState } from "react"


function createWindow(options: chrome.windows.CreateData): Promise<chrome.windows.Window> {
  return new Promise((resolve, reject) => {
    chrome.windows.create(options, (newWindow) => {
      if (!newWindow) return reject(new Error('create window failed'))
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(newWindow);
      }
    });
  });
}


function IndexPopup() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    console.log("window", window);
    window.addEventListener("message", (event) => {
      console.log("EVAL output: " + event.data)
    })
  }, [])

  return (
    <div
      style={{
        width: 400,
        height: 400,
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <button
        onClick={async () => {
          // iframeRef.current.contentWindow.postMessage("10 + 20", "*")
          console.log('source', chrome)
          const windowInfo = await createWindow({
            url: 'sandbox.html',
            width: 400,
            height: 400,
            type: 'popup'
          })

          const tabId = windowInfo?.tabs?.[0]?.id!
          chrome.debugger.attach({ tabId: tabId, }, '1.3', function () {
            chrome.debugger.sendCommand({ tabId }, "Page.enable", {}, () => {
              if (chrome.runtime.lastError) {
                console.log(`error:${chrome.runtime.lastError}`)
                // cleanup();
              }
              console.log("Debugger detached successfully.");
            });
          });
        }}>
        Trigger iframe eval
      </button>
      <iframe src="sandbox.html" ref={iframeRef} style={{ display: "none" }} />
    </div>
  )
}

export default IndexPopup