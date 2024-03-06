import browser from 'webextension-polyfill';
import { findTriggerBlock } from "~src/utils/helper";
import BackgroundWorkflowUtils from "./BackgroundWorkflowUtils";
import { registerWorkflowTrigger } from '~src/utils/workflowTrigger';


class BackgroundWorkflowTriggers {
    static async reRegisterTriggers(isStartup = false) {
        const { workflows, workflowHosts, teamWorkflows } =
            await browser.storage.local.get([
                'workflows',
                'workflowHosts',
                'teamWorkflows',
            ]);
        const convertToArr = (value) =>
            Array.isArray(value) ? value : Object.values(value);

        const workflowsArr = convertToArr(workflows);

        if (workflowHosts) {
            workflowsArr.push(...convertToArr(workflowHosts));
        }
        if (teamWorkflows) {
            workflowsArr.push(
                ...BackgroundWorkflowUtils.flattenTeamWorkflows(teamWorkflows)
            );
        }

        for (const currWorkflow of workflowsArr) {
            // eslint-disable-next-line no-continue
            if (currWorkflow.isDisabled) continue;

            let triggerBlock = currWorkflow.trigger;

            if (!triggerBlock) {
                const flow =
                    typeof currWorkflow.drawflow === 'string'
                        ? parseJSON(currWorkflow.drawflow, {})
                        : currWorkflow.drawflow;

                triggerBlock = findTriggerBlock(flow)?.data;
            }

            if (triggerBlock) {
                if (isStartup && triggerBlock.type === 'on-startup') {
                    if (currWorkflow?.isDisabled) return;
                    BackgroundWorkflowUtils.executeWorkflow(currWorkflow);
                } else {
                    if (isStartup && triggerBlock.triggers) {
                        for (const trigger of triggerBlock.triggers) {
                            if (trigger.type === 'on-startup') {
                                await BackgroundWorkflowUtils.executeWorkflow(currWorkflow);
                            }
                        }
                    }

                    await registerWorkflowTrigger(currWorkflow.id, {
                        data: triggerBlock,
                    });
                }
            }
        }
    }

}


export default BackgroundWorkflowTriggers;