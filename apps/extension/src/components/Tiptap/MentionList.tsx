import { Input } from 'antd';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import useGPTStore from '~src/store/useGPTsStore';
import { useChatPanelContext } from '../Panel/ChatPanel';
import type { Mention } from '@opengpts/types';

interface MentionListProps {
  items: Mention[];
  onSelect: () => void;
  command: (commandObject: { id: string, }) => void;
  editor: any;
}

interface MentionListRef {
  onKeyDown: (params: { event: KeyboardEvent }) => boolean;
}

const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {

  const { mentions, setMentions } = useChatPanelContext();
  const [mentionList, setMentionObject] = useState<Mention[]>([
    ...props.items,
    ...useGPTStore(state => state.getFavoriteGPTsList)().map(item => ({
      key: item.id,
      name: item.display.name,
      icon: item.display.profile_picture_url,
      type: 'GPTs'
    } as Mention
    ))
  ]);

  const favoriteGPTsList = mentionList.filter(item => item.type === 'GPTs');
  const languageModelList = mentionList.filter(item => item.type === 'languageModel');

  const [selectedIndex, setSelectedIndex] = useState(0)
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const selectItem = index => {
    const item = mentionList[index];
    setMentions([...mentions, {
      key: item.key,
      name: item.name,
      icon: item.icon,
      type: item.type
    }])
    console.log('props', props)
    if (item) {
      props.command({ id: item.name })
      props.onSelect && props.onSelect();
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + mentionList.length - 1) % mentionList.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % mentionList.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => {
    setSelectedIndex(0)
    itemRefs.current = itemRefs.current.slice(0, mentionList.length);
  }, [mentionList])

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
      <Input.Search></Input.Search>
      <span className='w-full text-sm font-semibold '>Large Model</span>
      <div className="w-full h-px max-w-6xl mx-auto bg-[#ebebeb]"></div>


      {
        languageModelList.length
          ? languageModelList.map((item, index) => (
            <div onClick={() => selectItem(index)}
              key={item.key}
              className={`flex items-center w-full p-1 text-sm text-[var(--opengpts-primary-text-color)] rounded-sm hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)] ${index === selectedIndex ? 'bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)]' : ''}`}>
              <div className='flex items-center justify-center gap-x-2'>
                {item.icon && <img className="w-5 h-5 rounded-full" src={item.icon} />}
                {item.name}
              </div>
            </div>
          ))
          : <div className="ite">No result</div>
      }
      <span className='w-full text-sm font-semibold '>GPTs</span>
      <div className="w-full h-px max-w-6xl mx-auto bg-[#ebebeb]"></div>
      {
        favoriteGPTsList.length
          ? <>
            {
              favoriteGPTsList.map((item, index) => (
                <div
                  key={item.key}
                  onClick={() => selectItem(index)}
                  className={`flex items-center w-full p-1 text-sm text-[var(--opengpts-primary-text-color)] rounded-sm hover:bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)]
               ${(languageModelList?.length || 0) + index === selectedIndex ? 'bg-[var(--opengpts-sidebar-model-btn-hover-bg-color)]' : ''}`}>
                  <div className='flex items-center justify-center gap-x-2'>
                    {item.icon && <img className="w-5 h-5 rounded-full" src={item.icon} />}
                    {item.name}
                  </div>
                </div>
              ))
            }
          </>
          : <div className="w-full text-sm">No result</div>
      }

    </div>
  );
});

export default MentionList;
