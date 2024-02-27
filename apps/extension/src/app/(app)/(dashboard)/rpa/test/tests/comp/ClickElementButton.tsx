import React, { useEffect, useState } from 'react';
import { Button, Popover, Input, message } from 'antd';
import { invokeFuncFromBGSW } from '~src/utils/rpa';
import type { Action } from '@opengpts/types';


const ClickElementButton: React.FC<{
  initSelector?: string,
  windowInfo?: chrome.windows.Window,
  callback: (action: Action) => void
}> = ({ callback, initSelector, windowInfo }) => {
  const [visible, setVisible] = useState(false);
  const [selector, setSelector] = useState(initSelector);

  const handleSelectorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelector(e.target.value);
  };
  useEffect(() => {
    setSelector(initSelector);
  }, [initSelector])

  const confirmClick = async () => {
    try {
      await invokeFuncFromBGSW('debugger', {
        tabId: windowInfo?.tabs?.[0]?.id,
        message: {
          action: {
            ACTION: 'CLICK',
            ELEMENT: {
              uniqueSelector: selector // 使用用户输入的选择器
            }
          }

        }
      });
      message.success('元素点击成功！');
    } catch (error) {
      console.error('Error clicking element:', error);
      message.error('元素点击失败！');
    }

    setVisible(false); // 关闭Popover
    setSelector(''); // 重置选择器输入值
  };

  const content = (
    <div>
      <Input
        placeholder="uniqueSelector"
        value={selector}
        onChange={handleSelectorChange}
        onPressEnter={confirmClick} // 用户按下Enter键时确认输入
        autoFocus
      />
    </div>
  );

  return (
    <Popover
      content={content}
      title="输入选择器"
      trigger="click"
      visible={visible}
      onVisibleChange={(visible) => setVisible(visible)}
    >
      <Button onClick={() => {
        setVisible(true);
        callback && callback({
          ACTION: 'CLICK',
          ELEMENT: {
            uniqueSelector: selector
          }
        })
      }
      }>点击元素</Button>
    </Popover >
  );
};

export default ClickElementButton;
