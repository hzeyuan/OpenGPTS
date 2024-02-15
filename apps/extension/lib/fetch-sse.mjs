export function createParser(onParse) {
    let isFirstChunk
    let bytes
    let buffer
    let startingPosition
    let startingFieldLength
    let eventId
    let eventName
    let data
    let extra
    reset()
    return {
        feed,
        reset,
    }
    function reset() {
        isFirstChunk = true
        bytes = []
        buffer = ''
        startingPosition = 0
        startingFieldLength = -1
        eventId = void 0
        eventName = void 0
        data = ''
    }

    function feed(chunk) {
        bytes = bytes.concat(Array.from(chunk))
        buffer = new TextDecoder().decode(new Uint8Array(bytes))
        if (isFirstChunk && hasBom(buffer)) {
            buffer = buffer.slice(BOM.length)
        }
        isFirstChunk = false
        const length = buffer.length
        let position = 0
        let discardTrailingNewline = false
        while (position < length) {
            if (discardTrailingNewline) {
                if (buffer[position] === '\n') {
                    ++position
                }
                discardTrailingNewline = false
            }
            let lineLength = -1
            let fieldLength = startingFieldLength
            let character
            for (let index = startingPosition; lineLength < 0 && index < length; ++index) {
                character = buffer[index]
                if (character === ':' && fieldLength < 0) {
                    fieldLength = index - position
                } else if (character === '\r') {
                    discardTrailingNewline = true
                    lineLength = index - position
                } else if (character === '\n') {
                    lineLength = index - position
                }
            }
            if (lineLength < 0) {
                startingPosition = length - position
                startingFieldLength = fieldLength
                break
            } else {
                startingPosition = 0
                startingFieldLength = -1
            }
            parseEventStreamLine(buffer, position, fieldLength, lineLength)
            position += lineLength + 1
        }
        if (position === length) {
            bytes = []
            buffer = ''
        } else if (position > 0) {
            bytes = bytes.slice(new TextEncoder().encode(buffer.slice(0, position)).length)
            buffer = buffer.slice(position)
        }
    }

    function parseEventStreamLine(lineBuffer, index, fieldLength, lineLength) {
        if (lineLength === 0) {
            if (data.length > 0 || extra) {
                onParse({
                    type: 'event',
                    id: eventId,
                    event: eventName || void 0,
                    data: data.slice(0, -1),
                    extra: extra || void 0,
                    // remove trailing newline
                })

                data = ''
                eventId = void 0
                extra = void 0
            }
            eventName = void 0
            return
        }
        const noValue = fieldLength < 0
        const field = lineBuffer.slice(index, index + (noValue ? lineLength : fieldLength))
        let step = 0
        if (noValue) {
            step = lineLength
        } else if (lineBuffer[index + fieldLength + 1] === ' ') {
            step = fieldLength + 2
        } else {
            step = fieldLength + 1
        }
        const position = index + step
        const valueLength = lineLength - step
        const value = lineBuffer.slice(position, position + valueLength).toString()
        if (field === 'data') {
            data += value ? ''.concat(value, '\n') : '\n'
        } else if (field === 'event') {
            eventName = value
        } else if (field === 'id' && !value.includes('\0')) {
            eventId = value
        } else if (field === 'retry') {
            const retry = parseInt(value, 10)
            if (!Number.isNaN(retry)) {
                onParse({
                    type: 'reconnect-interval',
                    value: retry,
                })
            }
        } else if (field === 'meta') {
            const str = `{"${field}":${value}}`
            extra = extra ?? []
            extra.push(JSON.parse(str))
        }
    }
}
const BOM = [239, 187, 191]
function hasBom(buffer) {
    return BOM.every((charCode, index) => buffer.charCodeAt(index) === charCode)
}



export async function fetchSSE(resource, options) {
    let timeoutId;
    const { onMessage, onStart, onFinish, onError, timeout = 30000, ...fetchOptions } = options

    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error("Request timed out"));
        }, timeout);
    });

    try {
        const resp = await Promise.race([
            fetch(resource, fetchOptions),
            timeoutPromise
        ]).catch(async (err) => {
            // The user aborted a request.
            // Request timed out
            onError && await onError(err);
        });
        if (!resp) return
        if (!resp.ok) {
            await onError(resp)
            return
        }
        const parser = createParser((event) => {
            if (event.type === 'event') {
                if (timeoutId) {
                    clearTimeout(timeoutId); // 当收到消息时，清除超时定时器
                    timeoutId = null; // 重置定时器ID
                }
                onMessage(event.data);
            }
        })
        let hasStarted = false
        const reader = resp.body.getReader()

        try {
            let result
            while (!(result = await reader.read()).done) {
                const chunk = result.value
                if (!hasStarted) {
                    const str = new TextDecoder().decode(chunk)
                    hasStarted = true
                    await onStart(str)

                    let fakeSseData
                    try {
                        const commonResponse = JSON.parse(str)
                        fakeSseData = 'data: ' + JSON.stringify(commonResponse) + '\n\ndata: [DONE]\n\n'
                    } catch (error) {
                        console.debug('not common response', error)
                    }
                    if (fakeSseData) {
                        parser.feed(new TextEncoder().encode(fakeSseData))
                        break
                    }
                }
                parser.feed(chunk)
            }

        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('Fetch was aborted');
            } else {
                throw err; // 抛出其他类型的错误
            }
        }
        onFinish && await onFinish()
    } catch (error) {
        console.log("报错3", error)
        onError && await onError(error);
    } finally {
        if (timeoutId) {
            clearTimeout(timeoutId); // 当收到消息时，清除超时定时器
            timeoutId = null; // 重置定时器ID
        }
    }
}