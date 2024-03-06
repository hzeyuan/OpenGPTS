import { sendToBackground } from "@plasmohq/messaging"

export const life = 42


console.log(chrome)
window.addEventListener("message", async function (event) {
  const source = event.source as {
    window: WindowProxy
  }



  console.log('window', this.document)

  // sendToBackground({
  //   name: 'opengpts',
  //   body: {
  //     type: 'OPEN_WINDOW',
  //     sender: 'webOperationAssistant',
  //     data: {
  //       message: {
  //         ...event.data
  //       }
  //     }
  //   }
  // })

  source.window.postMessage(() => {
   
    return eval(event.data)
  }, event.origin)
})