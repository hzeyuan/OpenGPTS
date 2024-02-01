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



  const zoomIn = () => setScale(scale => scale + 0.1);
  const zoomOut = () => setScale(scale => Math.max(scale - 0.1, 0.1));

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
      <Tooltip title={t('zoom_reset')}>
        <Button size='small' icon={<RestFilled />} onClick={() => setScale(1)} />
      </Tooltip>
      <Tooltip title={t('zoom_in')}>
        <Button size='small' icon={<PlusOutlined />} onClick={zoomIn} />
      </Tooltip>
      <Tooltip title={t('zoom_out')}>
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
            <div style={{ overflow: 'auto', padding: '10px' }}>
              <div
                ref={mermaidRef}
                dangerouslySetInnerHTML={{ __html: svgContent }}
                style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}
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
