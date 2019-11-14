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

    /*
    div #blurNotes covers the Practice Notes
    which includes title, quote from Mingyur Rinpoche
    and the individual log entry notes

    each log entry has text an metadata under div with
    data-id="int string I think"

    $("#blurNotes .col-xs-12.col-sm-5.col-md-4").find("div[data-id]").length
122
$("#blurNotes .col-xs-12.col-sm-5.col-md-4").find("div[data-id]").first().children().map((i, e) => { return e.textContent; })
     */

    function handleMeditationEntry(node) {
        let childrenText = node.children().map((i, e) => { return e.textContent; })
        // let [text, ]
    }
    /**
     * Implement this function to interact with the page.
     * See scrapeStoreAndNotifyBackend()
     * Returns object that works with local storage.
     */
    function pageScrapeFunction() {
        // return {"title": "tergar meditation app data"};
        let entryLogNodes = $("#blurNotes .col-xs-12.col-sm-5.col-md-4").find("div[data-id]");

    }

    /**
     * Storage key.
     *
     * @type {string}
     */
    const STORAGE_KEY = "tergar_meditation_app";

    /**
     * Filename to download to.
     *
     * @type {string}
     */
    const FILENAME = "tergar_meditation_app_scrape.json";

    const JS_FILENAME = "tergar_meditation_app.js";


    /********************************************************
     *   Shouldn't need to change this code
     ********************************************************/

    /**
     * Use this function for error callbacks if you like.
     *
     * @type {Function}
     */
    // let reportError = createErrorReportFunction(JS_FILENAME);

    function reportError(error) {
        console.error(`tergar_meditation_app.js error: ${error}`);
    }

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
        console.log("scrapeStoreAndNotifyBackend() ..");
        let objectToStore = scrapeFunction();
        return browser.storage.local.set({[storageKey]: objectToStore})
            .then(() => {
                console.log(`stored data with key: ${storageKey} and filename: ${filename}`);
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
        } else {
            console.error(`got unexpected message from backend: ${message}`);
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

    // function createErrorReportFunction(thisFileName) {
    //     return function (error) {
    //         console.error(`${thisFileName} error: ${error}`);
    //     }
    // }

})();
