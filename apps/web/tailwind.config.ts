// tailwind config is required for editor support

import type { ChatConfig } from "tailwindcss";
import sharedConfig from "@opengpts/tailwind-config";

const config: Pick<ChatConfig, "content" | "presets"> = {
  content: ["**/*.tsx"],
  presets: [sharedConfig],
};

export default config;
