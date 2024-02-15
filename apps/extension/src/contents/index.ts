import type { PlasmoCSConfig } from "plasmo"
import { OpenAI } from "~src/utils/web/openai";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_end",
  world: "MAIN"
}

// window["OpenAI"] = OpenAI;
