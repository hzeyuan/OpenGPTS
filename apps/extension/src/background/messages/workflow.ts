
import type { SendToBackgroundViaRelayRequestBody, SendToBackgroundViaRelayResponseBody } from '@opengpts/types';
import { type PlasmoMessaging } from '@plasmohq/messaging';
import { executeWorkflow } from '~src/workflowEngine';
import browser from 'webextension-polyfill';
import { getActiveTab } from '~src/utils/helper';
import BackgroundWorkflowUtils from '../BackgroundWorkflowUtils';
import { sendMessage } from '~src/utils/message';





const handler: PlasmoMessaging.Handler<'workflow', SendToBackgroundViaRelayRequestBody<'executeWorkflow' | 'workflow:execute' | 'workflow:stop'>, SendToBackgroundViaRelayResponseBody> = async (req, res) => {


    const { sender } = req;
    const tabId = req.body?.tabId || sender?.tab?.id;
    if (!tabId) return res.send({ code: -1, message: "tabId is required" })
    if (!req.body?.type) return res.send({ code: -1, message: "type is required" })
    const { type, data } = req.body
    // console.log('sender', sender);
    // console.log("req.body", req.body)
    console.log(`%c [workflow] ${type} data:${JSON.stringify(data)}, sender:${sender}`, 'color: #ff00ff')

    if (type === 'workflow:execute') {
        // const blockId = data.blockId;
        // try {
        //     if (!blockId) return;

        //     const workflowOptions = { blockId, tabId: -1 };

        //     let tab = await getActiveTab();
        //     if (!tab) {
        //         [tab] = await browser.tabs.query({ active: true, url: '*://*/*' });
        //     }
        //     if (tab) {
        //         workflowOptions.tabId = tab.id || -1;
        //     }
        const workflowData = {
            "connectedTable": null,
            "content": null,
            "createdAt": 1709543631070,
            "dataColumns": [],
            "description": "",
            "drawflow": {
                "edges": [
                    {
                        "class": "source-d634ff22-5dfe-44dc-83d2-842412bd9fbf-output-1 target-b9e7e0d4-e86a-4635-a352-31c63723fef4-input-1",
                        "id": "edge-0",
                        "markerEnd": "arrowclosed",
                        "source": "d634ff22-5dfe-44dc-83d2-842412bd9fbf",
                        "sourceHandle": "d634ff22-5dfe-44dc-83d2-842412bd9fbf-output-1",
                        "sourceX": 0,
                        "sourceY": 0,
                        "target": "b9e7e0d4-e86a-4635-a352-31c63723fef4",
                        "targetHandle": "b9e7e0d4-e86a-4635-a352-31c63723fef4-input-1",
                        "targetX": 0,
                        "targetY": 0,
                        "type": "default",
                        "z": 0
                    },
                    {
                        "animated": false,
                        "class": "source-b9e7e0d4-e86a-4635-a352-31c63723fef4-output-1 target-09f3a14c-0514-4287-93b0-aa92b0064fba-input-1",
                        "id": "edge-1",
                        "markerEnd": "arrowclosed",
                        "source": "b9e7e0d4-e86a-4635-a352-31c63723fef4",
                        "sourceHandle": "b9e7e0d4-e86a-4635-a352-31c63723fef4-output-1",
                        "sourceX": 0,
                        "sourceY": 0,
                        "target": "09f3a14c-0514-4287-93b0-aa92b0064fba",
                        "targetHandle": "09f3a14c-0514-4287-93b0-aa92b0064fba-input-1",
                        "targetX": 0,
                        "targetY": 0,
                        "type": "default",
                        "z": 0
                    },
                    {
                        "class": "source-09f3a14c-0514-4287-93b0-aa92b0064fba-output-1 target-5f76370d-aa3d-4258-8319-230fcfc49a3a-input-1",
                        "id": "edge-2",
                        "markerEnd": "arrowclosed",
                        "source": "09f3a14c-0514-4287-93b0-aa92b0064fba",
                        "sourceHandle": "09f3a14c-0514-4287-93b0-aa92b0064fba-output-1",
                        "sourceX": 0,
                        "sourceY": 0,
                        "target": "5f76370d-aa3d-4258-8319-230fcfc49a3a",
                        "targetHandle": "5f76370d-aa3d-4258-8319-230fcfc49a3a-input-1",
                        "targetX": 0,
                        "targetY": 0,
                        "type": "default",
                        "z": 0
                    }
                ],
                "nodes": [
                    {
                        "computedPosition": {
                            "x": 50,
                            "y": 300,
                            "z": 0
                        },
                        "data": {
                            "interval": 10,
                            "type": "manual"
                        },
                        "dimensions": {
                            "height": 72,
                            "width": 192
                        },
                        "handleBounds": {
                            "source": [
                                {
                                    "id": "d634ff22-5dfe-44dc-83d2-842412bd9fbf-output-1",
                                    "position": "right",
                                    "x": 196,
                                    "y": 28,
                                    "width": 16,
                                    "height": 16
                                }
                            ]
                        },
                        "id": "d634ff22-5dfe-44dc-83d2-842412bd9fbf",
                        "label": "trigger",
                        "position": {
                            "x": 50,
                            "y": 300
                        },
                        "selected": false,
                        "type": "BlockBasic"
                    },
                    {
                        "computedPosition": {
                            "x": 353,
                            "y": 298,
                            "z": 0
                        },
                        "data": {
                            "active": true,
                            "customUserAgent": false,
                            "description": "",
                            "disableBlock": false,
                            "inGroup": false,
                            "onError": {},
                            "updatePrevTab": false,
                            "url": "https://google.com",
                            "userAgent": "",
                            "waitTabLoaded": false
                        },
                        "dimensions": {
                            "height": 72,
                            "width": 192
                        },
                        "handleBounds": {
                            "source": [
                                {
                                    "id": "b9e7e0d4-e86a-4635-a352-31c63723fef4-output-1",
                                    "position": "right",
                                    "x": 196,
                                    "y": 28,
                                    "width": 16,
                                    "height": 16
                                }
                            ],
                            "target": [
                                {
                                    "id": "b9e7e0d4-e86a-4635-a352-31c63723fef4-input-1",
                                    "position": "left",
                                    "x": -20,
                                    "y": 28,
                                    "width": 16,
                                    "height": 16
                                }
                            ]
                        },
                        "id": "b9e7e0d4-e86a-4635-a352-31c63723fef4",
                        "label": "new-tab",
                        "position": {
                            "x": 353,
                            "y": 298
                        },
                        "selected": false,
                        "type": "BlockBasic"
                    },
                    {
                        "computedPosition": {
                            "x": 641,
                            "y": 290,
                            "z": 0
                        },
                        "data": {
                            "delay": "120",
                            "description": "Type query",
                            "events": [],
                            "markEl": false,
                            "multiple": false,
                            "selected": true,
                            "selector": "[name='q']",
                            "type": "text-field",
                            "value": "Automa Extension"
                        },
                        "dimensions": {
                            "height": 72,
                            "width": 192
                        },
                        "handleBounds": {
                            "source": [
                                {
                                    "id": "09f3a14c-0514-4287-93b0-aa92b0064fba-output-1",
                                    "position": "right",
                                    "x": 196,
                                    "y": 28,
                                    "width": 16,
                                    "height": 16
                                }
                            ],
                            "target": [
                                {
                                    "id": "09f3a14c-0514-4287-93b0-aa92b0064fba-input-1",
                                    "position": "left",
                                    "x": -20,
                                    "y": 28,
                                    "width": 16,
                                    "height": 16
                                }
                            ]
                        },
                        "id": "09f3a14c-0514-4287-93b0-aa92b0064fba",
                        "label": "forms",
                        "position": {
                            "x": 641,
                            "y": 290
                        },
                        "selected": false,
                        "type": "BlockBasic"
                    },
                    {
                        "computedPosition": {
                            "x": 929,
                            "y": 293,
                            "z": 0
                        },
                        "data": {
                            "description": "Click search",
                            "markEl": false,
                            "multiple": false,
                            "selector": "center:nth-child(1) > .gNO89b"
                        },
                        "dimensions": {
                            "height": 72,
                            "width": 192
                        },
                        "handleBounds": {
                            "source": [
                                {
                                    "id": "5f76370d-aa3d-4258-8319-230fcfc49a3a-output-1",
                                    "position": "right",
                                    "x": 196,
                                    "y": 28,
                                    "width": 16,
                                    "height": 16
                                }
                            ],
                            "target": [
                                {
                                    "id": "5f76370d-aa3d-4258-8319-230fcfc49a3a-input-1",
                                    "position": "left",
                                    "x": -20,
                                    "y": 28,
                                    "width": 16,
                                    "height": 16
                                }
                            ]
                        },
                        "id": "5f76370d-aa3d-4258-8319-230fcfc49a3a",
                        "label": "event-click",
                        "position": {
                            "x": 929,
                            "y": 293
                        },
                        "selected": false,
                        "type": "BlockBasic"
                    }
                ],
                "position": [
                    -1.538468549623417,
                    35.22407674532957
                ],
                "zoom": 0.7999999999999999
            },
            "folderId": null,
            "globalData": "{\n\t\"key\": \"value\"\n}",
            "icon": "riGlobalLine",
            "id": "1Jf-fuxqImPDi3-1Lwqah",
            "isDisabled": false,
            "name": "Google search",
            "settings": {
                "blockDelay": 0,
                "debugMode": true,
                "defaultColumnName": "column",
                "execContext": "popup",
                "executedBlockOnWeb": false,
                "inputAutocomplete": true,
                "insertDefaultColumn": false,
                "notification": true,
                "onError": "stop-workflow",
                "publicId": "",
                "restartTimes": 3,
                "reuseLastState": false,
                "saveLog": true
            },
            "table": [],
            "trigger": null,
            "updatedAt": 1709543644886,
            "version": "1.28.27",
            "isTesting": false
        }
        BackgroundWorkflowUtils.executeWorkflow(
            workflowData,
            workflowData?.options || {}
        );

    }
    // if (type === 'workflow:execute') {
    //     const workflowData = req.body.data;


    // }
    if (type === 'workflow:stop') {
        // workflowState.stop(stateId)
    }

}
export default handler;