import type { PlasmoCSConfig } from "plasmo"
import _ from "lodash";
import { OpenAI } from '@opengpts/core'

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_end",
  world: "MAIN"
}

window['OpenAI'] = OpenAI
