import browser from 'webextension-polyfill';
import { waitTabLoaded } from '../helper';

export async function goBack({ id }) {
  console.log('handlerGoBack', id, this.activeTab.id);
  if (!this.activeTab.id) throw new Error('no-tab');

  // await page loaded 
  await waitTabLoaded({
    tabId: this.activeTab.id,
    // ms: this.settings?.tabLoadTimeout ?? 30000,
    ms : 30000
});
  await browser.tabs.goBack(this.activeTab.id);

  return {
    data: '',
    nextBlockId: this.getBlockConnections(id),
  };
}

export default goBack;
