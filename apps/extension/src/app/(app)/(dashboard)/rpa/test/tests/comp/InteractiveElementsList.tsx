import React, { useState, useCallback } from 'react';
import { Button, Row, Col } from 'antd';
import { invokeFuncFromBGSW } from '~src/utils/rpa';

const InteractiveElementsList: React.FC<{
    windowInfo: chrome.windows.Window;
    onElementSelect: (element: string) => void;
}> = ({ windowInfo, onElementSelect }) => {
    const [interactiveElements, setInteractiveElements] = useState([]);

    const fetchInteractiveElements = async () => {
        setInteractiveElements([])
        try {
            const result = await invokeFuncFromBGSW('opengpts', {
                type: 'BROWSER_ENV',
                tabId: windowInfo?.tabs?.[0]?.id
            });
            console.log('Fetched environment information:', result);
            setInteractiveElements(result?.interactiveElements || []);
        } catch (error) {
            console.error('Error fetching interactive elements:', error);
        }
    };

    const getBgColorClass = (tagType: string) => {
        switch (tagType.toLowerCase()) {
            case 'a': return 'bg-blue-200';
            case 'input': return 'bg-green-200';
            case 'textarea': return 'bg-red-200';
            default: return 'bg-gray-200'; // 默认背景色
        }
    };

    const onSelect = useCallback((cssSelector:string) => {
        onElementSelect(cssSelector);
    }, [onElementSelect]);

    return (
        <>
            <Button className="mb-4 text-white bg-blue-500 hover:bg-blue-700" onClick={fetchInteractiveElements}>
                获取交互元素
            </Button>
            <Row gutter={[16, 16]}>
                {interactiveElements.map((item, index) => (
                    <Col key={index} span={6}>
                        <div
                            className={` overflow-hidden break-words whitespace-nowrap text-ellipsis px-2 py-4 text-gray-700 rounded-lg shadow cursor-pointer hover:bg-yellow-500 hover:text-gray-900 ${getBgColorClass(item[2])}`}
                            onClick={() => onSelect(item[1])}
                        >

                            {item[2]}:<span className=''>{item[1]}</span>
                        </div>
                    </Col>
                ))}
            </Row>
        </>
    );
};

export default InteractiveElementsList;
