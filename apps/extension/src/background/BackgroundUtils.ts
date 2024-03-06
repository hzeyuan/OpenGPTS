import browser from 'webextension-polyfill';
import { waitTabLoaded } from '~src/workflowEngine/helper';

class BackgroundUtils {
  // 使用async方法和类型注解
  static async openDashboard(url: string | undefined, updateTab: boolean = true): Promise<void> {
    const tabUrl = browser.runtime.getURL(
      `/newtab.html#${typeof url === 'string' ? url : ''}`
    );

    try {
      const tabs = await browser.tabs.query({
        url: browser.runtime.getURL('/newtab.html'),
      });

      if (tabs.length > 0) {
        const tab = tabs[0]; 
        const tabOptions: browser.Tabs.UpdateUpdatePropertiesType = { active: true };
        if (updateTab) tabOptions.url = tabUrl;

        await browser.tabs.update(tab.id!, tabOptions);

        if (updateTab) {
          await browser.windows.update(tab.windowId!, {
            focused: true,
            state: 'maximized',
          });
        }
      } else {
        const curWin = await browser.windows.getCurrent();
        const windowOptions: browser.Windows.CreateCreateDataType = {
          top: 0,
          left: 0,
          width: Math.min(curWin.width ?? 715, 715),
          height: Math.min(curWin.height ?? 715, 715),
          url: tabUrl,
          type: 'popup',
        };

        if (updateTab) {
          windowOptions.focused = true;
        }

        await browser.windows.create(windowOptions);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // 添加类型注解
  static async sendMessageToDashboard(type: string, data: any): Promise<any> {
    const tabs = await browser.tabs.query({
      url: browser.runtime.getURL('/newtab.html'),
    });

    if (tabs.length > 0) {
      const tab = tabs[0]; // 只处理找到的第一个标签
      console.log(`sendMessageToDashboard`, tab);
      await waitTabLoaded({ tabId: tab.id! });
      const result = await browser.tabs.sendMessage(tab.id!, { type, data });
      return result;
    }
    throw new Error("No dashboard tab found");
  }
}

export default BackgroundUtils;
