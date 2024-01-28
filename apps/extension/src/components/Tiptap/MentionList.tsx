import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

interface MentionListProps {
  items: string[];
  onSelect: () => void;
  command: (commandObject: { id: string }) => void;
  editor: any;
}

interface MentionListRef {
  onKeyDown: (params: { event: KeyboardEvent }) => boolean;
}

const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const selectItem = index => {
    const item = props.items[index]

    if (item) {
      props.command({ id: item })
      props.onSelect && props.onSelect();
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
    props.onSelect && props.onSelect();
  }

  useEffect(() => {
    setSelectedIndex(0)
    itemRefs.current = itemRefs.current.slice(0, props.items.length);
  }, [props.items])

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
    <div className="flex flex-col items-center w-full gap-1  py-1 bg-[var(--opengpts-sidebar-bg-color)] rounded-lg shadow cursor-pointer min-w-max"
      style={{
        borderRadius: '10px',
        boxShadow: 'rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px',
        padding: '8px'
      }}
    >
      {props.items.length
        ? props.items.map((item, index) => (
          <div onClick={() => selectItem(index)}
            className={`flex items-center w-full p-1 text-sm text-[var(--opengpts-primary-text-color)] rounded-sm hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] ${index === selectedIndex ? 'bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)]' : ''}`}>
            {item}
          </div>
        ))
        : <div className="ite">No result</div>
      }
    </div>
  );
});

export default MentionList;
