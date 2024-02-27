import type { ToolRow } from "@opengpts/types";
import { BASE_URL } from "~src/constant";





/**
 * 获取所有工具的数据。
 * @returns {Promise<Array>} 工具数据数组的Promise。
 */
export const fetchExtensionTools = async () => {
    try {
        console.log('baseurl', BASE_URL)
        const response = await fetch(`${BASE_URL}/api/tools`);
        console.log('response', response)
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        if (result.code !== 0) {
            throw new Error('Failed to fetch tools data');
        }
        return result.data as ToolRow[]
    } catch (error) {
        console.error("Failed to fetch tools data:", error);
        throw error;
    }
};

/**
 * 获取内置工具列表。
 * 此函数的结构与 fetchToolsData 相似，假设有一个专门的API端点。
 * @returns {Promise<Array>} 内置工具数据数组的Promise。
 */
export const fetchBuiltinsTools = async () => {
    try {
        const response = await fetch(`${base_url}/api/tools/builtins`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        if (result.code !== 0) {
            throw new Error('Failed to fetch builtins tools data');
        }
        const data = result.data;
        return data;
    } catch (error) {
        console.error("Failed to fetch builtins tools data:", error);
        throw error;
    }
};



/**
 * Calls a tool with the specified name and parameters.
 * @param tool_name - The name of the tool to call.
 * @param params - The parameters to pass to the tool.
 * @returns The data returned by the tool.
 * @throws If the network response is not ok or if the tool call fails.
 */
export const callTool = async (tool_name: string, params: any) => {
    try {
        const response = await fetch(`${base_url}/api/tools/call`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tool_name,
                data: {
                    ...params
                }
            }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        if (result.code !== 0) {
            throw new Error('Failed to call tool');
        }
        console.log('result', result)
        console.log('result.data', result.data)
        return result.data;
    } catch (error) {
        console.error("Failed to call tool:", error);
        throw error;
    }
};


export const getTool = async (name: string) => {
    try {
        const response = await fetch(`${base_url}/api/tools/${name}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        if (result.code !== 0) {
            throw new Error('Failed to fetch tool data');
        }
        return result.data;
    } catch (error) {
        console.error("Failed to fetch tool data:", error);
        throw error;
    }
}
