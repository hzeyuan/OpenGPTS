import browser from 'webextension-polyfill';
import { startWorkflowExec } from '~src/workflowEngine';

class BackgroundWorkflowUtils {
    static flattenTeamWorkflows(workflows) {
        return Object.values(Object.values(workflows || {})[0] || {});
    }

    static async getWorkflow(workflowId) {
        if (!workflowId) return null;

        if (workflowId.startsWith('team')) {
            const { teamWorkflows } = await browser.storage.local.get(
                'teamWorkflows'
            );
            if (!teamWorkflows) return null;

            const workflows = this.flattenTeamWorkflows(teamWorkflows);

            return workflows.find((item) => item.id === workflowId);
        }

        const { workflows, workflowHosts } = await browser.storage.local.get([
            'workflows',
            'workflowHosts',
        ]);
        let findWorkflow = Array.isArray(workflows)
            ? workflows.find(({ id }) => id === workflowId)
            : workflows[workflowId];

        if (!findWorkflow) {
            findWorkflow = Object.values(workflowHosts || {}).find(
                ({ hostId }) => hostId === workflowId
            );

            if (findWorkflow) findWorkflow.id = findWorkflow.hostId;
        }

        return findWorkflow;
    }



    static executeWorkflow(workflowData, options) {
        console.log(`BackgroundWorkflowUtils.executeWorkflow, workflowData: ${JSON.stringify(workflowData)}`);
        console.log(`BackgroundWorkflowUtils.executeWorkflow, options: ${JSON.stringify(options)}`);
        if (!workflowData || workflowData.isDisabled) return;
        startWorkflowExec(workflowData, options);
    }
}

export default BackgroundWorkflowUtils;
