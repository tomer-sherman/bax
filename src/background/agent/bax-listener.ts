import { baxAgent } from "./bax"
// Activates on run time like an open port
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {

    if (message.type !== "ask-bax") return;
    
    baxAgent.run(message.prompt).
        then(answer => sendResponse({ answer }))
        .catch(err => sendResponse({ error: err.message }))

    return true
})
