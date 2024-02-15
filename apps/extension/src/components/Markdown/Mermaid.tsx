import React, { useState, useEffect, useRef, useCallback } from 'react';
// import mermaid from 'mermaid';
import { ExportOutlined, CopyOutlined, PlusOutlined, MinusOutlined, RestFilled } from '@ant-design/icons';
import { Button, Card, Input, Skeleton, Tabs, Tooltip, message } from 'antd';
import copyToClipboard from 'copy-to-clipboard';
import { useTranslation } from "react-i18next"
import type { Mermaid } from 'mermaid';



// const mermaid = React.lazy(() => import('mermaid'));
// 初始化Mermaid的配置


const MermaidChartEditor: React.FC<{
  initialChart: string
  backgroundColor?: string
}> = ({ initialChart, backgroundColor = 'lightcyan' }) => {
  const [mermaid, setMermaid] = useState<Mermaid>();
  const [chart, setChart] = useState(initialChart);
  const [loading, setLoading] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState('');
  const { t } = useTranslation()
  const [scale, setScale] = useState(3);
  const [dragging, setDragging] = useState(false);
  const [lastClientX, setLastClientX] = useState(0);
  const [lastClientY, setLastClientY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    setLastClientX(e.clientX);
    setLastClientY(e.clientY);
    setDragging(true);
  };

  const onDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = (e.clientX - lastClientX) / scale;
    const dy = (e.clientY - lastClientY) / scale;
    setTranslateX(translateX + dx);
    setTranslateY(translateY + dy);
    setLastClientX(e.clientX);
    setLastClientY(e.clientY);
  };

  const stopDrag = () => {
    setDragging(false);
  };

  useEffect(() => {
    import('mermaid').then((mermaidModule) => {
      setMermaid(mermaidModule.default);
      mermaidModule.default.initialize({
        startOnLoad: false,
        theme: 'default',
        logLevel: 'fatal',
        securityLevel: 'strict',
        fontFamily: '"trebuchet MS", verdana, arial, sans-serif',
        fontSize: 14,
        arrowMarkerAbsolute: false,
      });
    });
  }, [])

  useEffect(() => {
    if (dragging) {
      const onDrag = (e: any) => {
        if (!dragging) return;
        const dx = (e.clientX - lastClientX) / scale;
        const dy = (e.clientY - lastClientY) / scale;
        setTranslateX(translateX + dx);
        setTranslateY(translateY + dy);
        setLastClientX(e.clientX);
        setLastClientY(e.clientY);
      };

      const stopDrag = () => {
        setDragging(false);
      };

      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', stopDrag);
    }

    return () => {
      window.removeEventListener('mousemove', () => onDrag);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, [dragging, lastClientX, lastClientY, scale, translateX, translateY]);
  const zoomOut = () => setScale(scale => Math.max(scale - 0.5, 0.5));
  const zoomIn = () => setScale(scale => Math.min(scale + 0.5, 5));

  const handleWheelZoom = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const scaleChange = e.deltaY * -0.01;
    const newScale = Math.max(0.1, Math.min(scale + scaleChange, 10));
    requestAnimationFrame(() => setScale(newScale));

  }, [scale]);


  useEffect(() => {
    setLoading(true);
    if (chart) {
      // 渲染Mermaid图表
      (async () => {
        try {
          if (mermaid) {
            const { svg, bindFunctions } = await mermaid.render('graphDiv', chart);
            setSvgContent(svg);

            setLoading(false);
            if (bindFunctions && mermaidRef.current) {
              bindFunctions(mermaidRef.current);
            }
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          setSvgContent('<div style="color: red;">Mermaid syntax error</div>');
          setLoading(false);
        }
      })();
    }
  }, [chart, mermaid]);

  useEffect(() => {
    setChart(initialChart)
  }, [initialChart])

  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
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
            <div className="overflow-auto p-2 min-w-[50vw] min-h-[360px]  flex items-center justify-center"
              onWheel={handleWheelZoom}>
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
