import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { PluginKey } from '@tiptap/pm/state';
import MentionList from './MentionList'

export default {
  items: ({ query }) => {
    console.log('Mention query:', query);

    return [
      'GPT-3.5-Turbo',
      'GPT-4-Turbo',
    ]
  },
  char: '@',
  // pluginKey:'oMention',
  allowedPrefixes: [' '],
  pluginKey: new PluginKey('mention'),
  // decorationTag:'',
  decorationClass: '',
  startOfLine: false,
  // allowSpaces: true,
  render: () => {
    let component
    let popup

    return {
      onStart: props => {
        component = new ReactRenderer(MentionList, {
          props: {
            ...props,
            onSelect: () => {
              if (popup && popup[0]) {
                popup[0].hide();
              }
              //TODO: 暂时这样处理，后续需要优化，en: Temporary processing, need to be optimized later
              setTimeout(() => {
                // 延迟销毁 popup
                if (popup && popup[0] && !popup[0].state.isDestroyed) {
                  popup[0].destroy();
                }
              }, 100);
            },
          },
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo:'parent',
          content: component.element,
          showOnCreate: true,

          interactive: true,
          trigger: 'manual',
          placement: 'top-start',
          animation: 'scale',
        })
      },

      onUpdate(props) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup[0].hide()

          return true
        }

        return component.ref?.onKeyDown(props)
      },

      onExit() {
        if (popup && popup[0] && !popup[0].state.isDestroyed) {
          popup[0].destroy();
          console.log('Popup destroyed');
        }
        component.destroy();
      },
    }
  },
}