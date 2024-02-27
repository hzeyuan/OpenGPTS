import React, { useState } from 'react';
import { Button, Popover, Slider, message } from 'antd';
import { invokeFuncFromBGSW } from '~src/utils/rpa';



const ZoomButton: React.FC<{ windowInfo?: chrome.windows.Window }> = ({ windowInfo }) => {
    const [visible, setVisible] = useState(false);
    const [zoomFactor, setZoomFactor] = useState(1); // 默认缩放比例100%

    const handleZoomChange = (value: number) => {
        setZoomFactor(value);
    };

    const confirmZoom = () => {
        invokeFuncFromBGSW('opengpts', {
            tabId: windowInfo?.tabs?.[0]?.id,
            type:'SET_ZOOM',
            message: {
                zoomFactor: zoomFactor / 100 // 因为Slider返回的是百分比，转换为缩放因子
            }
        }).then(() => {
            message.success(`页面缩放设置为 ${zoomFactor}%`);
        }).catch(error => {
            console.error('Error setting zoom:', error);
            message.error('设置页面缩放失败！');
        });

        setVisible(false); // 关闭Popover
    };

    const content = (
        <div>
            <Slider
                min={25}
                max={500}
                onChange={handleZoomChange}
                value={typeof zoomFactor === 'number' ? zoomFactor : 100}
                onAfterChange={confirmZoom}
            />
        </div>
    );

    return (
        <Popover
            content={content}
            title="选择缩放比例"
            trigger="click"
            visible={visible}
            onVisibleChange={(visible) => setVisible(visible)}
        >
            <Button>缩放页面</Button>
        </Popover>
    );
};

export default ZoomButton;
