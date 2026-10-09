
// Open a run time port, And listen to messages (Some kind of messaging protocol)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {

    // Only if the message.type is get-html initiate send back the Response , In this case the response contains an obejct that whithin it you have the full html.
    // Basically a object that holds a single property that holds a string that contains the full html. Object.
    if (message.type !== "get-html") return;

    sendResponse({ data: document.documentElement.outerHTML })
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {

    if (message.type === "get-highlight") return




    sendResponse({ data: "" })
})

window.document.addEventListener(onselect, () => { 

})