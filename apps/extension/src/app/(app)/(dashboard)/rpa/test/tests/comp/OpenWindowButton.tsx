import { message, Popconfirm, Input, Button } from "antd";
import { invokeFuncFromBGSW } from '~src/utils/rpa';
import { useState } from "react";

interface OpenWindowButtonProps {
  callback: (data: chrome.windows.Window) => void;
}

const OpenWindowButton: React.FC<OpenWindowButtonProps> = ({ callback }) => {
  const [url, setUrl] = useState<string>('https://www.google.com/');
  const [visible, setVisible] = useState(false);

  const openWindow = async (url: string) => {
    try {
      const data = await invokeFuncFromBGSW('opengpts', {
        type:'OPEN_WINDOW',
        message: {
          url,
        },
      });
      console.log(`%cWindow opened with info: ${JSON.stringify(data?.windowInfo)}`, 'color: green;');
      message.success('窗口已成功打开！');
      setVisible(false); // 关闭 Popconfirm
      callback && callback(data?.windowInfo);
    } catch (error:any) {
      console.error('Error opening window:', error);
      message.error(`打开窗口失败：${error?.message}`);
    }
  };

  const handleConfirm = () => {
    openWindow(url);
  };

  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  return (
    <Popconfirm
      title={
        <div>
          输入要打开的URL：
          <Input
            value={url}
            onChange={handleChange}
            onPressEnter={handleConfirm}
            autoFocus
          />
        </div>
      }
      visible={visible}
      onVisibleChange={handleVisibleChange}
      onConfirm={handleConfirm}
      okText="打开"
      cancelText="取消"
    >
      <Button onClick={() => setVisible(true)}>使用插件弹出一个沙盒窗口</Button>
    </Popconfirm>
  );
};

export default OpenWindowButton;
