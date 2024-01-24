import type { PlasmoCSConfig } from "plasmo"
import _ from "lodash";
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_end",
  world: "MAIN"
}

