import type { PlasmoMessaging } from "@plasmohq/messaging"
import type { SendToBackgroundViaRelayResponseBody, SendToBackgroundViaRelayRequestBody } from '@opengpts/types';
import { click, clickAtPosition, setValue, scroll } from "~src/utils/rpa/domActions";

const handler: PlasmoMessaging.Handler<'opengpts', SendToBackgroundViaRelayRequestBody, SendToBackgroundViaRelayResponseBody> = async (req, res) => {
    const { sender } = req;
    console.log(`%c [DEBUGGER]`, `color: #ff00ff`, `Received message: ${JSON.stringify(req.body)} from tabId: ${req.sender?.tab?.id}`)
    const tabId = req.body?.tabId || sender?.tab?.id;
    const windowId = req.body?.windowId || sender?.tab?.windowId;

    if (!tabId) {
        res.send({
            message: `TabId is not defined`,
            code: -1
        })
        return
    }

    // const { message } = req.body
    const message = req.body?.message;
    if (!message) {
        res.send({
            message: `No message to execute`,
            code: -1
        })
        return
    }
    if (!message.action) {
        res.send({
            message: `No actions to execute`,
            code: -1
        })
        return
    }

    const { action } = message;
    const { ACTION, ELEMENT, VALUE } = action;
    // instance of the number 
    if (!(typeof ELEMENT === 'object' && ELEMENT !== null)) {
        res.send({
            message: `ELEMENT is not an object`,
            code: -1
        });
        return;
    }
    const uniqueSelector = ELEMENT.uniqueSelector;
    console.log(`%c ACTION: ${ACTION} selector: ${uniqueSelector}`, `color: #ff00ff`);
    try {
        if (ACTION === 'CLICK') {
            if (!action) {
                res.send({
                    message: `No actions to execute`,
                    code: 0
                })
            }
            if (uniqueSelector) {
                await click(tabId!, {
                    uniqueSelector: uniqueSelector
                });
            } else {
                const { x, y } = ELEMENT;
                if (x && y) {
                    await clickAtPosition(tabId!, x, y);
                }else {
                    res.send({
                        message: `If you want to click position, you need to provide a uniqueSelector or x and y`,
                        code: -1
                    });
                    return;
                }
            }

        } else if (ACTION === 'TYPE') {
            console.log('TYPE')
            if (!uniqueSelector) {
                res.send({
                    message: `If you want to type, you need to provide a uniqueSelector`,
                    code: -1
                });
                return;
            }
            await setValue(tabId!, {
                uniqueSelector: uniqueSelector,
                value: VALUE
            });
            console.log('new Date', new Date())

        } else if (ACTION === 'SCROLL') {
            await scroll(tabId, {
                uniqueSelector: uniqueSelector,
                direction: VALUE
            });
        }
        res.send({
            message: `[DEBUGGER] time: ${new Date()} tabId: ${tabId} action: ${ACTION} executed successfully`,
            code: 0,
        })
    } catch (err) {
        res.send({
            message: `error:${err}`,
            code: -1
        })
    }

}


export default handler
