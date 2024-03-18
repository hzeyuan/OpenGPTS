import type PRAWorkflow from "@opengpts/types/rpa/workflow";
import { BASE_URL } from "~src/constant";

export const addWorkflowRequest = async (payload: Partial<PRAWorkflow.WorkflowData>) => {

    const response = await fetch(`${BASE_URL}/api/workflows`, {
        method: 'POST',
        body: JSON.stringify(payload),
    }).catch(err => {
        throw new Error(`request failed: ${err}`)
    })
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const result = await response.json();
    if (result.code !== 0) {
        throw new Error('Failed to add workflow');
    }
    return result.data;

}

export const deleteWorkflowRequest = async (id: string) => {

    const response = await fetch(`${BASE_URL}/api/workflows/${id}`, {
        method: 'DELETE',
    }).catch(err => {
        throw new Error(`request failed: ${err}`)
    })
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const result = await response.json();
    if (result.code !== 0) {
        throw new Error('Failed to delete workflow');
    }
    return result.data;

}

export const getWorkflowsRequest = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/workflows`, {
            method: 'GET',
        })
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        if (result.code !== 0) {
            throw new Error('Failed to get workflows');
        }
        return result.data;
    } catch (error) {
        console.error("Failed to get workflows:", error);
        throw error;
    }
}

export const getWorkFlowByIdRequest = async (id: string) => {
    const response = await fetch(`${BASE_URL}/api/workflows/${id}`, {
        method: 'GET',
    }).catch(err => {
        throw new Error(`request failed: ${err}`)
    }
    )
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const result = await response.json();
    if (result.code !== 0) {
        throw new Error('Failed to get workflow');
    }
    return result.data;
}

export const updateWorkflowRequest = async (id: string, payload: Partial<PRAWorkflow.WorkflowData>) => {
    const response = await fetch(`${BASE_URL}/api/workflows/${id}`, {
        method: 'POST',
        body: JSON.stringify(payload),
    }).catch(err => {
        throw new Error(`request failed: ${err}`)
    })
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const result = await response.json();
    if (result.code !== 0) {
        throw new Error('Failed to update workflow');
    }
    return result.data;
}