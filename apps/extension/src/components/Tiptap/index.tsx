
// src/Tiptap.jsx
import { useEditor, EditorContent, FloatingMenu, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
// import Text from '@tiptap/extension-text'
// import Bold from '@tiptap/extension-bold'
import { PluginKey } from '@tiptap/pm/state';
import { MentionPluginKey, Mention } from '@tiptap/extension-mention'

import mentionSuggestion from './mentionSuggestion'
import commandSuggestion from './commandSuggestion'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useChatPanelContext } from '../Panel/ChatPanel';
import React from 'react';


export interface TiptapProps {
  onSubmit: () => void;
  initContent?: string;
  onContentChange?: (content?: string) => void;
  chatId: string;
}

export interface TiptapRef {
  getContent: () => string;
  triggerMention: (char: string) => void;
  setContent: (content: string) => void;
  clearContent: () => void;
}


const mentionKey = new PluginKey('mention');
const commandKey = new PluginKey('command');

const Tiptap = forwardRef<TiptapRef, TiptapProps>(({ chatId, onSubmit, onContentChange, initContent = '' }, ref) => {

  Mention.configure({

  })
  const { model, webAccess } = useChatPanelContext()



  const mention = Mention.extend({
    name: 'mention',
  }).configure({
    HTMLAttributes: {
      class: ' bg-[#dafbe1] px-1 rounded-md mx-0.5',
    },

    suggestion: {
      ...mentionSuggestion,
      pluginKey: mentionKey,
    },
  })


  const command = useMemo(() => {
    return Mention
      .extend({
        name: 'command',
      })
      .configure({
        HTMLAttributes: {
          class: ' bg-[#dafbe1] px-1 rounded-md mx-0.5',
        },
        suggestion: {
          ...commandSuggestion(chatId,),
          pluginKey: commandKey,
        }
      })

  }, [chatId])

  const extensions = [
    StarterKit,
    mention,
    command,
  ]

  const handleKeyDown = useCallback((view, event) => {
    if (mentionKey.getState(view.state)?.active) return;
    if (commandKey.getState(view.state)?.active) return;

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // 防止编辑器插入新行
      onSubmit && onSubmit()
      return true; // 表示事件已处理
    }
    return false; // 表示未处理事件，让编辑器继续处理
  }, [model, webAccess, onSubmit])

  const editor = useEditor({
    autofocus: true,
    extensions,
    content: initContent,
    injectCSS: false,
    // element: document.querySelector('.element')!,
    editorProps: {
      attributes: {
        class: 'opengpts-tiptap outline-none focus:outline-none',
        style: ' outline:none; height: 61px; opacity: 1; padding: 2px; line-height: normal; overflow-y: scroll; resize: none; min-height: 61px; max-height: 156px'
      },
      handleKeyDown: handleKeyDown,
    },
    onUpdate: ({ editor }) => {
      const currentContent = editor?.getText()
      onContentChange && onContentChange(currentContent);
    },
  }, [])

  const triggerMention = (char: '@' | '/') => {
    console.log('triggerMention',)
    if (!editor) return;

    const { state, dispatch } = editor.view;
    const { tr, selection } = state;
    const insert = tr.insertText(` ${char}`, selection.to);
    dispatch(insert);

  };

  useImperativeHandle(ref, () => ({
    getContent: () => editor ? editor?.getText() : "",
    triggerMention,
    setContent: (content: string) => {
      editor?.commands.setContent(content)
    },
    clearContent: () => {
      editor?.commands.setContent('')
    }
  }));

  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          handleKeyDown: handleKeyDown
        }
      });
    }
  }, [handleKeyDown]);


  return (
    <>
      <EditorContent
        editor={editor}
      />
      {/* <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu> */}
      {/* <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu> */}
    </>
  )
});

export default Tiptap