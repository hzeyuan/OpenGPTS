import {Switch} from "antd"
import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react"

import useChatDrawerStore from "~src/store/useChatDrawerStore"
import useChatQuoteStore from "~src/store/useChatQuoteStore"

import { useFileDrawerStore } from "../FileDrawer"
import ModelSelectButton from "../ModelSelector"
import Tiptap, { type TiptapRef } from "../Tiptap"
import InputImgs from "./InputImgs"
import CloseTag from "./CloseTag"
import ReferenceMessage from "./ReferenceMessage"
import { useTranslation } from "react-i18next"
// import ScreenCaptureComponent from "../ScreenCapture"
// import { UploadButton } from "../Button/UploadButton"
import ToolSelectButton from "../ToolsSelector"
import { useChatPanelContext } from "../Panels/ChatPanel"
type ChatInputAreaRef = {
  submit: () => void
  setContent: (value: string) => void
}

type ChatInputAreaProps = {
  ref: React.MutableRefObject<HTMLDivElement>
  onSubmit?: ({ content, model }: any) => void
  onInputChange?: (v: string) => void
  content: string
  chatId: string
}


const AtIcon: React.FC<{
  className?: string
}> = ({ className }) => {
  return (<svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14.652 6.931C14.652 7.45233 14.5896 7.96233 14.465 8.461C14.3516 8.95967 14.1703 9.413 13.921 9.821C13.6716 10.2177 13.3656 10.5407 13.003 10.79C12.6403 11.028 12.2096 11.147 11.711 11.147C11.1896 11.147 10.776 10.9997 10.47 10.705C10.1753 10.399 9.99398 10.0533 9.92598 9.668H9.84098C9.63698 10.0873 9.33665 10.4387 8.93998 10.722C8.54331 11.0053 8.04465 11.147 7.44398 11.147C6.58265 11.147 5.91398 10.858 5.43798 10.28C4.97331 9.702 4.74098 8.937 4.74098 7.985C4.74098 7.237 4.88831 6.57967 5.18298 6.013C5.47765 5.435 5.89131 4.98167 6.42398 4.653C6.96798 4.32433 7.60831 4.16 8.34498 4.16C8.84365 4.16 9.33098 4.20533 9.80698 4.296C10.2943 4.37533 10.674 4.466 10.946 4.568L10.776 8.019C10.7646 8.223 10.759 8.37033 10.759 8.461C10.759 8.54033 10.759 8.597 10.759 8.631C10.759 9.22033 10.861 9.61133 11.065 9.804C11.2803 9.99667 11.5296 10.093 11.813 10.093C12.1643 10.093 12.459 9.95133 12.697 9.668C12.9463 9.37333 13.1333 8.988 13.258 8.512C13.394 8.02467 13.462 7.492 13.462 6.914C13.462 5.86 13.2466 4.97033 12.816 4.245C12.3966 3.50833 11.813 2.94733 11.065 2.562C10.3283 2.17667 9.48965 1.984 8.54898 1.984C7.58565 1.984 6.72998 2.137 5.98198 2.443C5.23398 2.749 4.60498 3.17967 4.09498 3.735C3.59631 4.29033 3.21665 4.94767 2.95598 5.707C2.69531 6.455 2.56498 7.28233 2.56498 8.189C2.56498 9.29967 2.76331 10.246 3.15998 11.028C3.55665 11.7987 4.13465 12.388 4.89398 12.796C5.66465 13.1927 6.60531 13.391 7.71598 13.391C8.40731 13.391 9.06465 13.3117 9.68798 13.153C10.3226 13.0057 10.8836 12.8413 11.371 12.66V13.816C10.8836 14.02 10.334 14.1843 9.72198 14.309C9.12131 14.445 8.45265 14.513 7.71598 14.513C6.37865 14.513 5.23398 14.2637 4.28198 13.765C3.32998 13.2663 2.59898 12.5523 2.08898 11.623C1.59031 10.6823 1.34098 9.55467 1.34098 8.24C1.34098 7.186 1.50531 6.21133 1.83398 5.316C2.16265 4.40933 2.63865 3.62733 3.26198 2.97C3.88531 2.30133 4.63898 1.78567 5.52298 1.423C6.41831 1.049 7.42698 0.861999 8.54898 0.861999C9.43298 0.861999 10.2433 1.00367 10.98 1.287C11.728 1.559 12.374 1.96133 12.918 2.494C13.4733 3.01533 13.8983 3.65 14.193 4.398C14.499 5.146 14.652 5.99033 14.652 6.931ZM6.06698 8.019C6.06698 8.74433 6.20865 9.27133 6.49198 9.6C6.78665 9.92867 7.17765 10.093 7.66498 10.093C8.29965 10.093 8.75298 9.855 9.02498 9.379C9.30831 8.903 9.47265 8.28533 9.51798 7.526L9.61998 5.401C9.47265 5.35567 9.28565 5.316 9.05898 5.282C8.83231 5.248 8.59998 5.231 8.36198 5.231C7.80665 5.231 7.35898 5.367 7.01898 5.639C6.67898 5.911 6.43531 6.26233 6.28798 6.693C6.14065 7.11233 6.06698 7.55433 6.06698 8.019Z"
      fill="currentColor"></path>
  </svg>)
}

export const ChatInputArea = forwardRef<ChatInputAreaRef, ChatInputAreaProps>(
  ({ chatId, onSubmit, onInputChange, content }, ref) => {
    const tiptapRef = useRef<TiptapRef>(null)
    const { mention, setMention, command, useTools, setUseTools, model, setModel, webAccess, setWebAccess, fileList, setCommand } = useChatPanelContext()
    const { t } = useTranslation()
    const showChatDrawer = useChatDrawerStore((state) => state.showChatDrawer)
    const showFileDrawer = useFileDrawerStore((state) => state.showFileDrawer)
    const handleGetChatHistory = () => { showChatDrawer(chatId) }
    const handleShowFileDrawer = () => { showFileDrawer(chatId) }
    const setQuoteMessage = useChatQuoteStore((state) => state.setQuote)

    const handleAtAgent = () => { tiptapRef.current?.triggerMention("@") }
    const handleCommand = () => { tiptapRef.current?.triggerMention("/") }
    const handleSubmit = () => {
      const content = tiptapRef.current?.getContent()
      onSubmit && onSubmit({ content, model })
      tiptapRef.current?.setContent("")
      setCommand(undefined)
      setQuoteMessage(chatId, undefined)
    }
    const handleInputChange = (v?: string) => {
      if (!v) return
      onInputChange && onInputChange(v)
    }
    const handleSetContent = (value: string) => {
      tiptapRef.current?.setContent(value)
    }

    useImperativeHandle(ref, () => ({
      setContent: handleSetContent,
      submit: handleSubmit
    }), [model, handleSubmit, handleSetContent])

    return (
      <div className="px-4 ">
        <div className="text-black">
          <div className="gap-2 h-[36px] flex justify-start items-center">
            <ModelSelectButton model={model} onChange={setModel} />
            <ToolSelectButton ></ToolSelectButton>
            <div className="flex gap-2 min-w-[90px] max-w-[calc(100%_-_40px)]">
              <div className="overflow-hidden text-xs"></div>
              <div className="flex items-center hidden text-xs origin-left chatgpt-plugin-capsule">
                <div className="ant-dropdown-trigger capsule-btn model-btn flex justify-center items-center cursor-pointer pr-1.5 pl-[9px] py-[7px] rounded-full gap-1">
                  <div className="truncate text-xs leading-[14px] text-[rgba(var(--opengpts-fg-rgb),0.35)]">
                    No plugins
                  </div>
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    role="img"
                    className="octicon octicon-chevron-down"
                    viewBox="0 0 12 12"
                    width="11"
                    height="11"
                    fill="currentColor"
                    style={{
                      color: content.length > 0 ? "#8a57ea" : "",
                      display: "inline-block",
                      userSelect: "none",
                      verticalAlign: "text-bottom",
                      overflow: "visible"
                    }}>
                    <path d="M6 8.825c-.2 0-.4-.1-.5-.2l-3.3-3.3c-.3-.3-.3-.8 0-1.1.3-.3.8-.3 1.1 0l2.7 2.7 2.7-2.7c.3-.3.8-.3 1.1 0 .3.3.3.8 0 1.1l-3.2 3.2c-.2.2-.4.3-.6.3Z"></path>
                  </svg>
                </div>
              </div>
              <div className="flex gap-0">
                {/* <ScreenCaptureComponent></ScreenCaptureComponent> */}
                {/* <UploadButton fileList={fileList} setFileList={setFileList} /> */}
                {/* <span>
                  <div
                    onClick={handleShowFileDrawer}
                    className=" text-[var(--opengpts-sidebar-model-btn-color)] hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] cursor-pointer  h-[28px] w-[28px] flex overflow-hidden  items-center justify-center text-xs leading-4 rounded-[30px] model-btn model-btn-no-bg"
                    role="button">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none">
                      <g clip-path="url(#clip0_21821_579560.46313479368596644)">
                        <path
                          d="M8.00073 4.50523C8.36892 4.50523 8.66739 4.80371 8.66739 5.1719V7.33366H10.8292C11.1973 7.33366 11.4958 7.63214 11.4958 8.00033C11.4958 8.36852 11.1973 8.66699 10.8292 8.66699H8.66739V10.8288C8.66739 11.1969 8.36892 11.4954 8.00073 11.4954C7.63254 11.4954 7.33406 11.1969 7.33406 10.8288V8.66699H5.1723C4.80411 8.66699 4.50563 8.36852 4.50563 8.00033C4.50563 7.63214 4.80411 7.33366 5.1723 7.33366H7.33406V5.1719C7.33406 4.80371 7.63254 4.50523 8.00073 4.50523Z"
                          fill="currentColor"></path>
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M0.666992 8.00033C0.666992 3.95024 3.95024 0.666992 8.00033 0.666992C12.0504 0.666992 15.3337 3.95024 15.3337 8.00033C15.3337 12.0504 12.0504 15.3337 8.00033 15.3337C3.95024 15.3337 0.666992 12.0504 0.666992 8.00033ZM8.00033 2.00033C4.68662 2.00033 2.00033 4.68662 2.00033 8.00033C2.00033 11.314 4.68662 14.0003 8.00033 14.0003C11.314 14.0003 14.0003 11.314 14.0003 8.00033C14.0003 4.68662 11.314 2.00033 8.00033 2.00033Z"
                          fill="currentColor"></path>
                      </g>
                      <defs>
                        <clipPath id="clip0_21821_579560.46313479368596644">
                          <rect width="16" height="16" fill="white"></rect>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>

                  <input type="file" accept=".pdf" className="hidden" />
                </span> */}
                {/* <div
                  className=" text-[var(--opengpts-sidebar-model-btn-color)] cursor-pointer  hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)]  topbar-btn h-[28px] w-[28px] flex overflow-hidden items-center justify-center text-xs leading-4 rounded-[30px] model-btn model-btn-no-bg "
                  role="button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none">
                    <g clip-path="url(#clip0_21825_972590.10822601330391701)">
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M1.33464 1.97559C0.966446 1.97559 0.667969 2.27406 0.667969 2.64225V12.6423C0.667969 13.0104 0.966446 13.3089 1.33464 13.3089H6.0013C6.35492 13.3089 6.69406 13.4494 6.94411 13.6994C7.19416 13.9495 7.33464 14.2886 7.33464 14.6423C7.33464 15.0104 7.63311 15.3089 8.0013 15.3089C8.36949 15.3089 8.66797 15.0104 8.66797 14.6423C8.66797 14.2886 8.80844 13.9495 9.05849 13.6994C9.30854 13.4494 9.64768 13.3089 10.0013 13.3089H14.668C15.0362 13.3089 15.3346 13.0104 15.3346 12.6423V2.64225C15.3346 2.27406 15.0362 1.97559 14.668 1.97559H10.668C9.78391 1.97559 8.93607 2.32678 8.31095 2.9519C8.19876 3.06408 8.0954 3.18344 8.0013 3.3089C7.90721 3.18344 7.80384 3.06408 7.69166 2.9519C7.06654 2.32678 6.21869 1.97559 5.33464 1.97559H1.33464ZM7.33464 12.3328V5.30892C7.33464 4.77849 7.12392 4.26978 6.74885 3.89471C6.37378 3.51963 5.86507 3.30892 5.33464 3.30892H2.0013V11.9756H6.0013C6.47346 11.9756 6.9327 12.1008 7.33464 12.3328ZM8.66797 12.3328C9.06991 12.1008 9.52915 11.9756 10.0013 11.9756H14.0013V3.30892H10.668C10.1375 3.30892 9.62883 3.51963 9.25376 3.89471C8.87868 4.26978 8.66797 4.77849 8.66797 5.30892V12.3328Z"
                        fill="currentColor"></path>
                      <path
                        d="M10.168 9.31087C9.79978 9.31087 9.5013 9.60935 9.5013 9.97754C9.5013 10.3457 9.79978 10.6442 10.168 10.6442H12.5013C12.8695 10.6442 13.168 10.3457 13.168 9.97754C13.168 9.60935 12.8695 9.31087 12.5013 9.31087H10.168Z"
                        fill="currentColor"></path>
                      <path
                        d="M10.168 6.97754C9.79978 6.97754 9.5013 7.27602 9.5013 7.64421C9.5013 8.0124 9.79978 8.31087 10.168 8.31087H12.5013C12.8695 8.31087 13.168 8.0124 13.168 7.64421C13.168 7.27602 12.8695 6.97754 12.5013 6.97754H10.168Z"
                        fill="currentColor"></path>
                      <path
                        d="M10.168 4.64421C9.79978 4.64421 9.5013 4.94268 9.5013 5.31087C9.5013 5.67906 9.79978 5.97754 10.168 5.97754H12.5013C12.8695 5.97754 13.168 5.67906 13.168 5.31087C13.168 4.94268 12.8695 4.64421 12.5013 4.64421H10.168Z"
                        fill="currentColor"></path>
                    </g>
                    <defs>
                      <clipPath id="clip0_21825_972590.10822601330391701">
                        <rect
                          width="16"
                          height="16"
                          fill="white"
                          transform="translate(0.000976562)"></rect>
                      </clipPath>
                    </defs>
                  </svg>
                </div> */}
              </div>
            </div>
            <div
              onClick={handleGetChatHistory}
              className="flex items-center gap-2 ml-auto">
              <span>
                <div className="text-[var(--opengpts-sidebar-model-btn-color)] hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)]  cursor-pointer topbar-btn h-[28px] w-[28px] model-btn model-btn-no-bg overflow-hidden flex items-center justify-center text-xs  rounded-[30px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none">
                    <g clip-path="url(#clip0_21832_1701650.46506823327618396)">
                      <path
                        d="M7.9987 2.00033C11.3124 2.00033 13.9987 4.68662 13.9987 8.00033C13.9987 11.314 11.3124 14.0003 7.9987 14.0003C4.68499 14.0003 1.9987 11.314 1.9987 8.00033C1.9987 7.63214 1.70022 7.33366 1.33203 7.33366C0.963842 7.33366 0.665364 7.63214 0.665364 8.00033C0.665364 12.0504 3.94861 15.3337 7.9987 15.3337C12.0488 15.3337 15.332 12.0504 15.332 8.00033C15.332 3.95024 12.0488 0.666992 7.9987 0.666992C5.97384 0.666992 4.13959 1.48853 2.81325 2.81488C2.60239 3.02573 2.4043 3.2494 2.22024 3.48463L1.34821 2.6126C1.09622 2.36062 0.665364 2.53908 0.665364 2.89545V5.49152C0.665364 5.82289 0.933993 6.09152 1.26536 6.09152H3.86144C4.2178 6.09152 4.39627 5.66066 4.14428 5.40868L3.17161 4.43601C3.34948 4.19556 3.54493 3.96881 3.75606 3.75768C4.84257 2.67117 6.34166 2.00033 7.9987 2.00033Z"
                        fill="currentColor"></path>
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M7.68327 3.80566C8.05146 3.80566 8.34994 4.10414 8.34994 4.47233V8.37461L10.3502 9.4482C10.6746 9.62232 10.7965 10.0265 10.6224 10.3509C10.4482 10.6753 10.0441 10.7971 9.71969 10.623L7.368 9.36083C7.15161 9.24469 7.0166 9.019 7.0166 8.77342V4.47233C7.0166 4.10414 7.31508 3.80566 7.68327 3.80566Z"
                        fill="currentColor"></path>
                    </g>
                    <defs>
                      <clipPath id="clip0_21832_1701650.46506823327618396">
                        <rect width="16" height="16" fill="white"></rect>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </span>
            </div>
          </div>

          <div
            className="chat-input-area relative z-10 min-h-[97px] rounded-xl border-[1.5px] flex-1 items-center pb-[4px] border-1 border-solid  cursor-text 
                 border-[var(--opengpts-sidebar-border-color)]
                 bg-[var(--opengpts-option-card-bg-color)]
                 text-[var(--opengpts-primary-text-color)]">
            <div className="px-2 mt-1 py-[2px] flex flex-col gap-1">
              <div className="relative">
                <div className="absolute top-0 ant-dropdown-trigger -z-10 lef-0"></div>
                <div className="flex gap-2">
                  {command && <CloseTag
                    color='#2db7f5'
                    onClose={() => setCommand(undefined)}
                    label={command.name}
                    icon={command.icon}
                    chatId={chatId} />}

                  {mention && <CloseTag
                    prefix={<AtIcon className='w-3 h-3 '></AtIcon>}
                    color='cyan'
                    onClose={() => setMention(undefined)}
                    label={mention.name}
                    //@ts-ignore
                    icon={<img className="w-4 h-4" src={mention.icon?.src  || mention.icon}></img>}
                    chatId={chatId} />
                  }
                </div>
                <InputImgs fileList={fileList}></InputImgs>
                <div
                  className="block w-full border-0 opacity-0"
                  style={{ height: "61px", opacity: "1" }}>
                  <Tiptap
                    chatId={chatId}
                    onSubmit={handleSubmit}
                    ref={tiptapRef}
                    initContent={""}
                    onContentChange={handleInputChange}
                  />
                </div>
                <ReferenceMessage chatId={chatId}></ReferenceMessage>
              </div>
              <div className="flex items-center justify-between bottom-area">
                <div className="flex items-center">
                  <div className="flex items-center gap-1 pl-[1px]">
                    <span>
                      <div
                        onClick={handleCommand}
                        className="h-5 w-5 rounded-md flex justify-center cursor-pointer items-center hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] text-[var(--opengpts-secondary-text-color)] hover:text-[var(--opengpts-primary-text-color)]">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M10 8L10.8103 10.1897L13 11L10.8103 11.8103L10 14L9.18973 11.8103L7 11L9.18973 10.1897L10 8Z"
                            fill="currentColor"></path>
                          <path
                            d="M13 3L13.5402 4.45982L15 5L13.5402 5.54018L13 7L12.4598 5.54018L11 5L12.4598 4.45982L13 3Z"
                            fill="currentColor"></path>
                          <path
                            d="M3.5 1L4.17523 2.82477L6 3.5L4.17523 4.17523L3.5 6L2.82477 4.17523L1 3.5L2.82477 2.82477L3.5 1Z"
                            fill="currentColor"></path>
                          <path
                            d="M3.14284 13.2583L9.64284 1.99998"
                            stroke="currentColor"
                            stroke-width="1.3"
                            stroke-linecap="square"></path>
                        </svg>
                      </div>
                    </span>
                    <span>
                      <div
                        onClick={handleAtAgent}
                        className="h-5 w-5 rounded-md flex justify-center cursor-pointer items-center hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] text-[var(--opengpts-secondary-text-color)] hover:text-[var(--opengpts-primary-text-color)]">
                        <AtIcon></AtIcon>
                      </div>
                    </span>
                  </div>
                  <div className="divider h-4 w-[1px] mx-2 bg-[var(--opengpts-sidebar-border-color)]"></div>
                  <div className="access-web py-[2px] pl-[2px] rounded-[20px] pr-1 text-xs text-[var(--opengpts-chat-primary-color)] relative top-[0px] flex items-center gap-1 opacity-60">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <g clip-path="url(#clip0_20710_11317)">
                        <path
                          d="M14 0H0V14H14V0Z"
                          fill="white"
                          fill-opacity="0.01"></path>
                        <circle
                          cx="7.00012"
                          cy="6.65417"
                          r="3.84558"
                          stroke="#8A57EA"></circle>
                        <path
                          d="M10.8371 4.77452C11.1322 4.7713 11.3973 4.78373 11.6267 4.81197C12.1698 4.87883 12.5125 5.0343 12.5785 5.2806C12.7763 6.01872 10.4139 7.29303 7.30202 8.12686C4.19013 8.96069 1.50712 9.03828 1.30934 8.30016C1.24644 8.06541 1.44249 7.77643 1.83924 7.46463C2.04277 7.30468 2.29912 7.13872 2.60043 6.971"
                          stroke="#8A57EA"
                          stroke-linecap="round"></path>
                      </g>
                      <defs>
                        <clipPath id="clip0_20710_11317">
                          <rect width="14" height="14" fill="white"></rect>
                        </clipPath>
                      </defs>
                    </svg>
                    {t('NetworkAccess')}
                    {/* style={{ background: 'rgba(0, 0, 0, 0.45)' }} */}
                    <Switch
                      value={webAccess}
                      onChange={() => setWebAccess(!webAccess)}
                      defaultChecked
                      size="small"></Switch>
                  </div>
                </div>

                <div
                  onClick={handleSubmit}
                  className={` ${content.length > 0
                    ? "text-[#8a57ea] hover:bg-[var(--opengpts-primary-color)] hover:text-white cursor-pointer"
                    : ""
                    }  send-btn pl-[2px] h-[28px] w-[28px] rounded-[50%] round  text-base flex justify-center items-center bg-[transparent]  `}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M1.94138 13.0289C1.56433 13.2174 1.13755 12.8833 1.22994 12.472L2.35112 7.481L9.82664 7.013L2.35112 6.506L1.23055 1.52846C1.13795 1.1171 1.5648 0.782866 1.94194 0.971426L13.9999 7L1.94138 13.0289Z"
                      fill="currentColor"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="outer-bottom-area h-[20px] flex justify-between items-center px-[2px] hidden">
                <div
                    className="transition-opacity duration-200 ease-in-out opacity-0 pointer-events-none ant-dropdown-trigger ltr:ml-auto rtl:mr-auto">
                    <span>
                        <div
                            className="text-xs cursor-pointer hover:text-[var(--opengpts-primary-text-color)] text-[var(--opengpts-secondary-text-color)]  hover:underline">
                            按<b>Enter</b>提交</div>
                    </span></div>
            </div> */}
        </div>
      </div>
    )
  }
)
