import browser from 'webextension-polyfill';

export async function cleanWorkflowTriggers(workflowId, triggers) {
  try {
    // const alarms = await browser.alarms.getAll();
    // for (const alarm of alarms) {
    //   if (alarm.name.includes(workflowId)) {
    //     await browser.alarms.clear(alarm.name);
    //   }
    // }

    const { visitWebTriggers, onStartupTriggers, shortcuts } =
      await browser.storage.local.get([
        'shortcuts',
        'visitWebTriggers',
        'onStartupTriggers',
      ]);

    const keyboardShortcuts = Array.isArray(shortcuts) ? {} : shortcuts || {};
    Object.keys(keyboardShortcuts).forEach((shortcutId) => {
      if (!shortcutId.includes(workflowId)) return;

      delete keyboardShortcuts[shortcutId];
    });

    const startupTriggers = (onStartupTriggers || []).filter(
      (id) => !id.includes(workflowId)
    );
    const filteredVisitWebTriggers = visitWebTriggers.filter(
      (item) => !item.id.includes(workflowId)
    );

    await removeFromWorkflowQueue(workflowId);

    await browser.storage.local.set({
      shortcuts: keyboardShortcuts,
      onStartupTriggers: startupTriggers,
      visitWebTriggers: filteredVisitWebTriggers,
    });

    // const browserContextMenu =
    //   BROWSER_TYPE === 'firefox' ? browser.menus : browser.contextMenus;
    // const removeFromContextMenu = async () => {
    //   try {
    //     let promises = [];

    //     if (triggers) {
    //       promises = triggers.map(async (trigger) => {
    //         if (trigger.type !== 'context-menu') return;

    //         const triggerId = `trigger:${workflowId}:${trigger.id}`;
    //         await browserContextMenu.remove(triggerId);
    //       });
    //     }

    //     promises.push(browserContextMenu.remove(workflowId));

    //     await Promise.allSettled(promises);
    //   } catch (error) {
    //     // Do nothing
    //   }
    // };
    // if (browserContextMenu) await removeFromContextMenu();
  } catch (error) {
    console.error(error);
  }
}


export async function registerWorkflowTrigger(workflowId, { data }) {
  try {
    await cleanWorkflowTriggers(workflowId, data && data?.triggers);

    if (data.triggers) {
      for (const trigger of data.triggers) {
        const handler = workflowTriggersMap[trigger.type];
        if (handler)
          await handler(`trigger:${workflowId}:${trigger.id}`, trigger.data);
      }
    } else if (workflowTriggersMap[data.type]) {
      await workflowTriggersMap[data.type](workflowId, data);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}