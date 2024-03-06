import { useEffect, useRef, useState } from "react"
 
function Dashboard() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
 
  useEffect(() => {
    window.addEventListener("message", (event) => {
      console.log("EVAL output: " + event.data)
    })
  }, [])
 
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <button
        onClick={() => {
            // console.log('iframeRef',iframeRef.current.contentWindow)
          // iframeRef.current.contentWindow.postMessage("10 + 20", "*")
        }}>
        Trigger iframe eval
      </button>
      <iframe src="chrome-extension://migdljjehfllllbkjhfnbfcifaekebjk/sandbox.html" ref={iframeRef} style={{ display: "none" }} />
    </div>
  )
}
 
export default Dashboard