import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Storage } from "@plasmohq/storage";

const storage = new Storage({
    area: "local",
})


// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
    en: {
        translation: {
            "General": "General",
            "Theme": "Theme",
            "Auto": "Auto",
            "Light": "Light Mode",
            "Dark": "Dark Mode",
            "Language": "Language",
            "Account": "Account",
            'Meeting Agenda': 'Meeting Agenda',
            'AsyncGPTsFromChatGPT': 'Async GPTs',
            'CloneGPT': 'One-Click GPTS Builder',
            'MyGPTs': 'My GPTs',
            'Count': 'Count',
            'Pinned': 'Pinned',
            'Public': 'Public',
            'Private': 'Private',
            'HighToLow': 'High to Low',
            'LowToHigh': 'Low to High',
            "sort.byTime": "Sort by Time",
            "sort.byChats": "Sort by Chats",
            "sort.byUsers": "Sort by Users",
            "sort.byPins": "Sort by byPins",
            'Reset': 'Reset',
            'modal.openGPTS': 'OpenGPTS',
            'modal.editGPTS': 'Edit GPTS',
            // message
            'syncStart': 'Starting to sync GPTs from ChatGPT',
            'syncComplete': 'Synchronization complete',
            'shareSuccess': 'Shared {{name}} successfully',
            'updateSuccess': 'Updated {{name}} successfully',
            'privateGPTWarning': 'Private GPT cannot chat, so we have opened the editor for you',
            'copySuccess': 'Copied {{name}} to clipboard successfully',
            'publishError': 'Public GPT cannot be published again',
            'publishSuccess': 'Publish successful',
            'deleteSuccess': 'Delete successful',
            'Confirm': 'Confirm',
            'Cancel': 'Cancel',
            'selectLanguageTitle': 'Select Language',
            'onePromptBuilderTitle': 'One-Click GPTS Builder',

            'changeLanguageText': 'You can Change GPT language',
            'onePromptCreationText': 'One prompt quickly create new GPTs',
            'capabilitiesLabel': 'Capabilities',
            'selectPlaceholder': 'Please select',
            'webBrowsing': 'Web Browsing',
            'imageGeneration': 'DALL·E Image Generation',
            'codeInterpreter': 'Code Interpreter',

            'confirmDeleteTitle': 'Are you sure you want to delete this GPT?',
            'confirmDeleteDescription': 'This action cannot be undone.',

            'shareGPTTitle': 'Share GPTs to OpenGPTS Store',
            'shareGPTDescription': 'Do you want to share this GPT with the community in Our OpenGPTs Store?',

            'publishGPTTitle': 'Publish GPT to OpenAI GPTs Store',
            'publishGPTDescription': 'Are you ready to make this GPT public and available to others?',
            'AsyncGPTsFromChatGPT.tooltip': 'One-Click Async GPTs From ChatGPT',
            'promptBuilder.tooltip': 'If there is an error, please {{gpts}} on any chat to automatically generate the logo',

            // gpt request error
            'NetworkApplication': 'ChatGPT Network Application',
            'NetworkUnstableRequestFailed': 'Network unstable, request failed',
            'DueToOpenAILimitation': 'Due to OpenAI limitations, you must keep your ChatGPT account logged in. Stability issues may require frequent refreshes.',
            'GPT4AndGPTsCallFailed': 'GPT4 and GPTs call failed',
            'VisitChatOpenAIPage': 'Please visit https://chat.openai.com/, start a ChatGPT4 conversation, then try again',
            'ChatGPTPlusUsersCanTry': 'ChatGPT Plus users can try',
            'OpenAIRestrictedYourRequestFrequency': 'OpenAI restricted your request frequency',
            'CheckLimitOverage': 'Check if you have exceeded the limit of 40 messages in 3 hours for GPT4. If not, refresh the https://chat.openai.com/ page and try again',
            'LogError': 'Log error',
            'Error': 'Error',
            'AlertErrorMessage': 'Alert error message',
            "GPTsUnavailableOrDeleted": "This GPTs may have been converted to private or deleted, making it unavailable for use. You can try switching to another GPTs."
        }
    },
    zh: {
        translation: {
            "General": "通用",
            "Theme": "主题",
            "Auto": "自动",
            "Light": "明亮模式",
            "Dark": "黑色模式",
            "Language": "语言",
            "Account": "账号",
            'AsyncGPTsFromChatGPT': '同步GPTs',
            'CloneGPT': '一键创建GPTs',
            'MyGPTs': '我的GPTS',
            'Count': '数量',
            'Pinned': '置顶',
            'Public': '公开',
            'Private': '私有',
            'HighToLow': '从高到低',
            'LowToHigh': '从低到高',
            "sort.byTime": "按时间排序",
            "sort.byChats": "按聊天排序",
            "sort.byUsers": "按用户数排序",
            "sort.byPins": "按置顶排序",
            'Reset': '重置',
            'modal.openGPTS': '打开 GPTS',
            'modal.editGPTS': '编辑 GPTS',
            // message
            'syncStart': '开始同步ChatGPT中的GPTs',
            'syncComplete': '同步完成',
            'shareSuccess': '成功共享{{name}}',
            'updateSuccess': '成功更新{{name}}',
            'privateGPTWarning': '私有 GPT 不能聊天，因此我们为您打开了编辑器',
            'copySuccess': '成功复制{{name}}到剪贴板',
            'publishError': '公开 GPT 不能再次发布',
            'publishSuccess': '发布成功',
            'deleteSuccess': '删除成功',
            'Confirm': '确认',
            'Cancel': '取消',
            'selectLanguageTitle': '选择语言',
            'onePromptBuilderTitle': '一键复刻到其他语言',

            'changeLanguageText': '你可以更改 GPT 语言',
            'onePromptCreationText': '一键快速创建新 GPTs',
            'capabilitiesLabel': '功能',
            'selectPlaceholder': '请选择',
            'webBrowsing': '网页浏览',
            'imageGeneration': 'DALL·E 图像生成',
            'codeInterpreter': '代码解释器',

            'confirmDeleteTitle': '你确定要删除这个 GPT 吗？',
            'confirmDeleteDescription': '此操作无法撤销。',

            'shareGPTTitle': '共享 GPTs OpenGPTS商店',
            'shareGPTDescription': '您是否想将这个 GPT 分享到我们的 GPTs 商店社区？',

            'publishGPTTitle': '发布 GPT到OpenAI GPTs Store',
            'publishGPTDescription': '您准备好将这个 GPT 公开并向其他人提供了吗？',
            'AsyncGPTsFromChatGPT.tooltip': '一键从ChatGPT同步GPTs',
            'promptBuilder.tooltip': '如果出现错误，请{{gpts}} 上任意对话，才能自动生成Logo',

            // gpt request error
            'NetworkApplication': 'ChatGPT 网络应用',
            'NetworkUnstableRequestFailed': '网络不稳定，请求失败',
            'DueToOpenAILimitation': '由于 OpenAI 的限制，需时刻保持您的 ChatGPT 账户登录状态。稳定性问题可能需要频繁刷新。',
            'GPT4AndGPTsCallFailed': 'GPT4 和 GPTs 调用失败',
            'VisitChatOpenAIPage': '请访问 https://chat.openai.com/，开始一次 ChatGPT4 对话，然后重试',
            'ChatGPTPlusUsersCanTry': 'ChatGPT Plus 用户可尝试',
            'OpenAIRestrictedYourRequestFrequency': 'OpenAI 限制了您的请求频率',
            'CheckLimitOverage': '检查是否超过了 GPT4 的 3 小时内 40 条信息的限制。如果没有，请刷新 https://chat.openai.com/ 页面后重试',
            'LogError': '记录错误',
            'Error': '错误',
            'AlertErrorMessage': '警告错误信息',
            "GPTsUnavailableOrDeleted": "这个GPTs可能已经被转为私有或者被删除了，导致无法使用，你可以尝试切换到其他的GPTs"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en',

        interpolation: {
            escapeValue: false
        }
    });




export default i18n;