
/*
Will need URL.createObjectURL() to create a url to download

 */
function placeholder() {
    return true
}

browser.runtime.onMessage.addListener(notify);

function reportError(error) {
    console.error(`background.js error: ${error}`);
}

function notify(message) {
    if (message.target == "background") {
        if (message.command == "check_storage") {
            browser.storage.local.get()
                .then((itemsObject) => {
                    console.log("background retrieved: ", itemsObject);
                    download(itemsObject);
                })
                .catch(reportError)
        } else {
            browser.tabs.query({active: true, currentWindow: true})
                .then((tabs) => {
                    browser.tabs.sendMessage(tabs[0].id, {
                        "target": "kindle_page",
                        "message": "background got message: " + message.message
                    });
                })
                .catch(reportError);
        }
    }
    // console.log("background got message: " + message.message)
}

// function download(obj) {
//     let url = browser.URL.createObjectURL(obj);
//     console.log("download url: ", url);
// }