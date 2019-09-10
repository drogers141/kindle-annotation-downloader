(function () {
    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;
    window.URL = window.URL || window.webkitURL;


    /**
     * Implement this function to interact with the page.
     * See scrapeStoreAndNotifyBackend()
     * Returns object that works with local storage.
     */
    function pageScrapeFunction() {

    }

    /**
     * Storage key.
     *
     * @type {string}
     */
    const STORAGE_KEY = "Your_Storage_Key";

    /**
     * Filename to download to.
     *
     * @type {string}
     */
    const FILENAME = "Your_filename.json";

    const JS_FILENAME = "This file name for console logging errors";


    /********************************************************
     *   Shouldn't need to change this code
     ********************************************************/

    /**
     * Use this function for error callbacks if you like.
     *
     * @type {Function}
     */
    let reportError = createErrorReportFunction(JS_FILENAME);
    
    /**
     * Calls client scraper function, stores resulting object into local storage with key,
     * then notifies background script to download it to filename in the user's
     * download directory.
     * Right now download options are to download automatically - ie no prompt for the user
     * and to overwrite an existing file with the same name.
     *
     * @param scrapeFunction - called with no params, must return object that works with local
     * storage (jsonifiable)
     * @param storageKey - string for storage key - alphanumeric + underscore are ok
     * @param filename - filename that will be downloaded to in the user's download directory
     * @returns {Promise<void>}
     */
    function scrapeStoreAndNotifyBackend(scrapeFunction, storageKey, filename) {
        return browser.storage.local.set({[sanitizedTitle]: activeBookMeta})
            .then(() => {
                console.log(`stored data with key: ${key} and filename: ${filename}`);
                browser.runtime.sendMessage({
                    "target": "background",
                    "command": "download_stored_object",
                    "storage_key": storageKey,
                    "filename": filename,
                });
            })
            .catch(reportError);
    }

    browser.runtime.onMessage.addListener((message) => {
        if (message.command === "execute") {
            scrapeStoreAndNotifyBackend(pageScrapeFunction, STORAGE_KEY, FILENAME)
                .catch(reportError);
        } else if (message.target === "kindle_page") {
            console.log("got message from background: " + message.message);
        }
    });

    /**
     * Remove illegal characters to form a filename or storage key.
     * Adjust as needed.
     *
     * @param s
     * @returns {void | string}
     */
    function sanitizeStringForName(s) {
        return s.replace(/[^a-z0-9_]/gi, '_');
    }

    function createErrorReportFunction(thisFileName) {
        return function (error) {
            console.error(`${thisFileName} error: ${error}`);
        }
    }

})();
