import browser from 'webextension-polyfill';
import { BROWSER_TYPE } from '~src/constant';
import { objectHasKey } from '~src/utils/helper';
import { attachDebugger } from '../helper';

async function checkAccess(blockName) {
  if (blockName === 'upload-file') {
    const hasFileAccess = await browser.extension.isAllowedFileSchemeAccess();

    if (hasFileAccess) return true;

    throw new Error('no-file-access');
  } else if (blockName === 'clipboard') {
    const hasPermission = await browser.permissions.contains({
      permissions: ['clipboardRead'],
    });

    if (!hasPermission) {
      throw new Error('no-clipboard-access');
    }
  }

  return true;
}

async function interactionHandler(block) {
  await checkAccess(block.label);

  // const debugMode =
  //   (block.data.settings?.debugMode ?? false) && !this.settings.debugMode;
  const debugMode = true;
  const isChrome = BROWSER_TYPE === 'chrome';

  try {
    console.log("interactionHandler",  isChrome)
    if (isChrome) {
      await attachDebugger(this.activeTab.id);
      block.debugMode = true;
    }

    console.log(`before workflowEngine handlerInteractionBlock: data`, block, new Date());
    const data = await this._sendMessageToTab(block, {
      frameId: this.activeTab.frameId || 0,
    });
    console.log(`after workflowEngine handlerInteractionBlock: data`, data, new Date());
    if (
      (block.data.saveData && block.label !== 'forms') ||
      (block.data.getValue && block.data.saveData)
    ) {
      const currentColumnType =
        this.engine.columns[block.data.dataColumn]?.type || 'any';
      const insertDataToColumn = (value) => {
        this.addDataToColumn(block.data.dataColumn, value);

        const addExtraRow =
          objectHasKey(block.data, 'extraRowDataColumn') &&
          block.data.addExtraRow;
        if (addExtraRow) {
          this.addDataToColumn(
            block.data.extraRowDataColumn,
            block.data.extraRowValue
          );
        }
      };

      if (Array.isArray(data) && currentColumnType !== 'array') {
        data.forEach((value) => {
          insertDataToColumn(value);
        });
      } else {
        insertDataToColumn(data);
      }
    }

    if (block.data.assignVariable) {
      await this.setVariable(block.data.variableName, data);
    }

    // if (isChrome) {
    //   chrome.debugger.detach({ tabId: this.activeTab.id });
    // }

    return {
      data,
      nextBlockId: this.getBlockConnections(block.id),
    };
  } catch (error) {
    if (debugMode && isChrome) {
      chrome.debugger.detach({ tabId: this.activeTab.id });
    }

    error.data = {
      name: block.label,
      selector: block.data.selector,
    };

    throw error;
  }
}

export default interactionHandler;
