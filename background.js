
/*
Will need URL.createObjectURL() to create a url to download

 */

browser.runtime.onMessage.addListener(notify);

function reportError(error) {
    console.error(`background.js error: ${error}`);
}

function notify(message) {
    if (message.target === "background") {
        if (message.command === "download_stored_kindle_metadata") {
            browser.storage.local.get(message.storage_key)
                .then((itemsObject) => {
                    console.log("background retrieved storage");
                    let blob = new Blob([JSON.stringify(itemsObject)]);
                    let url = URL.createObjectURL(blob);
                    let timestampString = moment().format().replace(/:/g, '.')
                    console.log("timestamp: ", timestampString);
                    browser.downloads.download({
                        url: url,
                        filename: message.storage_key + ".json",
                        conflictAction: "overwrite",
                        saveAs: false
                    });
                    // var json = JSON.stringify(itemsObject);
                    // var downloadFile = new File(json, "activeBookMeta.json");

                    // download(itemsObject);
                })
                .catch(reportError);
        } else if (message.command === "download_stored_object") {
            browser.storage.local.get(message.storage_key)
                .then((itemsObject) => {
                    console.log(`background retrieved storage: ${message.storage_key}`);
                    let blob = new Blob([JSON.stringify(itemsObject)]);
                    let url = URL.createObjectURL(blob);
                    let timestampString = moment().format().replace(/:/g, '.')
                    console.log("timestamp: ", timestampString);
                    browser.downloads.download({
                        url: url,
                        filename: message.filename,
                        conflictAction: "overwrite",
                        saveAs: false
                    });
                    console.log(`background downloaded storage to file: ${message.filename}`);
                })
                .catch(reportError);
        } else if (message.command === "download") {
            console.log("downloading with message: ", message);
            // browser.downloads.download(message.url, filename = message.filename)
            //     .then(() => {
            //         console.log("downloaded url: ", message.url)
            //     })
            //     .catch(reportError);
        } else {
            console.log("background got message not matching command");
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
