import React, { useEffect, useState } from 'react';
import { Button, Popconfirm, Input, message } from 'antd';
import { invokeFuncFromBGSW } from '~src/utils/rpa';
import type { Action } from '@opengpts/types';

const TypeMessageButton: React.FC<{
    initSelector?: string,
    windowInfo?: chrome.windows.Window,
    callback: (action: Action) => void
}> = ({ initSelector, windowInfo, callback }) => {
    const [visible, setVisible] = useState(false);
    const [selector, setSelector] = useState(initSelector);
    const [value, setValue] = useState('');

    useEffect(() => {
        setSelector(initSelector);
    }, [initSelector])

    const handleSelectorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelector(e.target.value);
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const confirmType = async () => {
        try {
            const action: Action = {
                ACTION: 'TYPE',
                ELEMENT: {
                    uniqueSelector: selector! // 使用用户输入的选择器
                },
                VALUE: value // 使用用户输入的值
            }
            await invokeFuncFromBGSW('debugger', {
                tabId: windowInfo?.tabs?.[0]?.id,
                message: {
                    action
                }
            });
            callback && callback(action)
            message.success('文本输入成功！');
        } catch (error) {
            console.error('Error typing text:', error);
            message.error('文本输入失败！');
        }

        setVisible(false); // 关闭Popover
        setSelector(''); // 重置选择器输入值
        setValue(''); // 重置文本输入值
    };

    const content = (
        <div>
            <Input
                placeholder="uniqueSelector"
                value={selector}
                onChange={handleSelectorChange}
                style={{ marginBottom: '10px' }}
            />
            <Input
                placeholder="Value"
                value={value}
                onChange={handleValueChange}
                onPressEnter={confirmType} // 用户按下Enter键时确认输入
            />
        </div>
    );

    return (
        <Popconfirm
            title={
                <div>
                    <Input
                        placeholder="uniqueSelector"
                        value={selector}
                        onChange={handleSelectorChange}
                        style={{ marginBottom: '10px' }}
                    />
                    <Input
                        placeholder="Value"
                        value={value}
                        onChange={handleValueChange}
                    />
                </div>
            }
            onConfirm={confirmType}
            okText="确认"
            cancelText="取消"
            trigger="click"
        >
            <Button>发送文本</Button>
        </Popconfirm>
    );
};

export default TypeMessageButton;
