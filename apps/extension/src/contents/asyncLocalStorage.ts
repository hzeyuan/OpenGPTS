


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log('request', request)
        localStorage.setItem(request.key, request.value)
    }
);

