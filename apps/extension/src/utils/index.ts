import { ofetch } from 'ofetch'

const request = ofetch.create({
    // baseURL: "`https://chat.openai.com",
    retry: 3,
    headers:{
        'content-type': 'application/json',
    },
    retryDelay: 500, // ms
    timeout: 100000,
    parseResponse: JSON.parse,
});

export {
    request
}