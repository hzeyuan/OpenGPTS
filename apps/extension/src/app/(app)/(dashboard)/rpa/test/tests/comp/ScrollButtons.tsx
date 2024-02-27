import { Button } from "antd";
import { invokeFuncFromBGSW } from '~src/utils/rpa';

// 定义一个接口，用于指定窗口信息的类型
interface WindowInfo {
  tabs?: Array<{ id: number }>;
}

const ScrollButtons: React.FC<{ windowInfo?: chrome.windows.Window }> = ({ windowInfo }) => {
  // 根据需要滚动的方向定义一个函数
  const scroll = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    invokeFuncFromBGSW('debugger', {
      tabId: windowInfo?.tabs?.[0]?.id,
      message: {
        action:{
          ACTION: 'SCROLL',
          ELEMENT: {
            uniqueSelector: '' // 根据需要指定选择器
          },
          VALUE: direction // 使用参数指定滚动方向
        }
      }
    });
  };

  // 渲染四个按钮，每个按钮点击时调用scroll函数并传入相应的方向
  return (
    <div className='flex gap-4'>
      <Button onClick={() => scroll('UP')}>UP</Button>
      <Button onClick={() => scroll('DOWN')}>DOWN</Button>
      <Button onClick={() => scroll('LEFT')}>LEFT</Button>
      <Button onClick={() => scroll('RIGHT')}>RIGHT</Button>
    </div>
  );
};

export default ScrollButtons;
