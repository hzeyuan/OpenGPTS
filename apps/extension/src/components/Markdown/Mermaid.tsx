import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { SettingOutlined, EditOutlined, EllipsisOutlined, ExportOutlined, CopyOutlined, PlusOutlined, MinusOutlined, RestFilled } from '@ant-design/icons';
import { Button, Card, Input, Skeleton, Tabs, Tooltip, message } from 'antd';
import copyToClipboard from 'copy-to-clipboard';
import { useTranslation } from "react-i18next"

// 初始化Mermaid的配置
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  logLevel: 'fatal',
  securityLevel: 'strict',
  fontFamily: '"trebuchet MS", verdana, arial, sans-serif',
  fontSize: 14,
  arrowMarkerAbsolute: false,
});

const MermaidChartEditor = ({ chart: initialChart, backgroundColor = 'lightcyan' }) => {
  const [chart, setChart] = useState(initialChart);
  const [loading, setLoading] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState('');
  const { t } = useTranslation()
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [lastClientX, setLastClientX] = useState(0);
  const [lastClientY, setLastClientY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const startDrag = (e) => {
    setLastClientX(e.clientX);
    setLastClientY(e.clientY);
    setDragging(true);
  };

  const onDrag = (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastClientX;
    const dy = e.clientY - lastClientY;
    setTranslateX(translateX + dx);
    setTranslateY(translateY + dy);
    setLastClientX(e.clientX);
    setLastClientY(e.clientY);
  };

  const stopDrag = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', stopDrag);
    }

    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, [dragging, onDrag, stopDrag]);



  const zoomIn = () => setScale(scale => scale + 0.1);
  const zoomOut = () => setScale(scale => Math.max(scale - 0.1, 0.1));


  const handleWheelZoom = (e) => {

    e.preventDefault(); // 阻止默认的滚轮行为，即页面滚动
    const scaleChange = e.deltaY * -0.01; // 根据滚轮方向调整缩放变化量
    const newScale = Math.max(0.1, Math.min(scale + scaleChange, 5)); // 限制缩放级别在0.1到5之间
    setScale(newScale);

  };


  useEffect(() => {
    setLoading(true);
    if (chart) {
      // 渲染Mermaid图表
      (async () => {
        try {
          const { svg, bindFunctions } = await mermaid.render('graphDiv', chart);
          setSvgContent(svg);

          setLoading(false);
          if (bindFunctions && mermaidRef.current) {
            bindFunctions(mermaidRef.current);
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          setSvgContent('<div style="color: red;">Mermaid syntax error</div>');
          setLoading(false);
        }
      })();
    }
  }, [chart]);

  const handleCodeChange = (event) => {
    setChart(event.target.value);
  };

  const handleCopyToClipboard = () => {
    if (!mermaidRef.current) return;
    copyToClipboard(chart);
    message.success(t('copy_success'));
  }

  const exportToImage = () => {
    if (!mermaidRef.current) return;
    const svg = mermaidRef.current.innerHTML;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mermaid-diagram.svg'; // 或者 '.png'
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success(t('export_success'));
  };


  const extra = <div className='flex gap-x-2'>
    <div className='flex gap-x-2'>
      <Tooltip title={t('zoomReset')}>
        <Button size='small' icon={<RestFilled />} onClick={() => setScale(1)} />
      </Tooltip>
      <Tooltip title={t('zoomIn')}>
        <Button size='small' icon={<PlusOutlined />} onClick={zoomIn} />
      </Tooltip>
      <Tooltip title={t('zoomOut')}>
        <Button size='small' icon={<MinusOutlined />} onClick={zoomOut} />
      </Tooltip>
      <Tooltip title={t('copy_tooltip')}>
        <CopyOutlined onClick={handleCopyToClipboard} />
      </Tooltip>
      <Tooltip title={t('export_tooltip')}>
        <ExportOutlined onClick={exportToImage} />
      </Tooltip>
    </div>
  </div>


  return (
    <Card
      className='w-full my-2'
    >
      <Skeleton loading={loading} active>
        <Tabs defaultActiveKey="1" tabBarExtraContent={extra}>
          <Tabs.TabPane tab={t('Preview')} key="1">
            <div onWheel={handleWheelZoom} style={{ overflow: 'auto', padding: '10px' }}>
              <div
                ref={mermaidRef}
                dangerouslySetInnerHTML={{ __html: svgContent }}
                style={{
                  transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
                  transformOrigin: '0 0',
                  cursor: dragging ? 'grabbing' : 'grab',
                  userSelect: dragging ? 'none' : 'auto',
                }}
                onMouseDown={startDrag}

              />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab={t('Code')} key="2">
            <Input.TextArea
              value={chart}
              onChange={handleCodeChange}
              style={{ width: '100%', height: '300px', fontFamily: 'monospace' }}
            />
          </Tabs.TabPane>
        </Tabs>
      </Skeleton>
    </Card>
  );
};

export default MermaidChartEditor;
