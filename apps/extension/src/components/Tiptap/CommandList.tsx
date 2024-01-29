import { t } from 'i18next';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { OCommand } from '@opengpts/types';
import { useTranslation } from 'react-i18next';
import { useChatPanelContext } from '../Panel/ChatPanel';

interface CommandListProps {
  items: OCommand[];
  command: (commandObject?: { id: string }) => void;
  onSelect: () => void;
  editor: any;
  chatId: string;
}

interface CommandListRef {
  onKeyDown: (params: { event: KeyboardEvent }) => boolean;
}

const CommandList = forwardRef<CommandListRef, CommandListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { setCommand } = useChatPanelContext();
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const { t } = useTranslation();
  const selectItem = index => {
    const item = props.items[index];

    if (item) {
      setCommand(item);

      props.onSelect && props.onSelect();
      const startPosition = props.editor.state.selection.$from.pos - 1;
      props.editor.commands.deleteRange({
        from: startPosition,
        to: startPosition + 1,
      });
    }
  };

  const scrollIntoViewIfNeeded = (index: number) => {
    if (itemRefs.current[index]) {
      // 当选中的是列表的最后一个元素时，确保其底部可见
      const isLastItem = index === props.items.length - 1;
      itemRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: isLastItem ? 'end' : 'nearest'
      });
    }
  };

  const upHandler = () => {
    const newIndex = (selectedIndex + props.items.length - 1) % props.items.length;
    setSelectedIndex(newIndex);
    scrollIntoViewIfNeeded(newIndex);
  };

  const downHandler = () => {
    const newIndex = (selectedIndex + 1) % props.items.length;
    setSelectedIndex(newIndex);
    scrollIntoViewIfNeeded(newIndex);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
    // 清除引用数组
    itemRefs.current = itemRefs.current.slice(0, props.items.length);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="flex flex-col items-center w-full gap-1  bg-[var(--opengpts-sidebar-bg-color)]  py-1 overflow-y-auto  rounded-lg  cursor-pointer max-h-64 min-w-max"
      style={{
        borderRadius: '10px',
        boxShadow: 'rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px',
        padding: '8px'
      }}
    >
      {props.items.length
        ? props.items.map((item, index) => (
          <div key={item.name} ref={el => itemRefs.current[index] = el} onClick={() => selectItem(index)}
            className={`flex items-center w-full p-1 text-sm rounded-sm hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] text-[var(--opengpts-primary-text-color)] ${index === selectedIndex ? 'bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)]' : ''}`}>
            {t(item.name)}
          </div>
        ))
        : <div className="ite">No result</div>
      }
    </div>
  );
});

export default CommandList;
