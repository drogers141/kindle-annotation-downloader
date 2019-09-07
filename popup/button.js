/**
 * CSS to hide everything on the page,
 * except for elements that have the "beastify-image" class.
 */
const hidePage = `body > :not(.beastify-image) {
                    display: none;
                  }`;

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {

    function handleClick(tabs) {
      browser.tabs.sendMessage(tabs[0].id, {
        command: "execute"
      });
      console.log("sent execute command");
    }

    function reportError(error) {
      console.error(`Could not send message: ${error}`);
    }

    if (e.target.classList.contains("button")) {
      browser.tabs.query({active: true, currentWindow: true})
          .then(handleClick)
          .catch(reportError);
    }

    /**
     * Just log the error to the console.
     */
    // function reportError(error) {
    //   console.error(`Could not beastify: ${error}`);
    // }

    /**
     * Get the active tab,
     * then call "beastify()" or "reset()" as appropriate.
     */
    // if (e.target.classList.contains("beast")) {
    //   browser.tabs.query({active: true, currentWindow: true})
    //     .then(beastify)
    //     .catch(reportError);
    // }
    // else if (e.target.classList.contains("reset")) {
    //   browser.tabs.query({active: true, currentWindow: true})
    //     .then(reset)
    //     .catch(reportError);
    // }
  });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute beastify content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs.executeScript({file: "/content_scripts/kindle_page.js"})
.then(listenForClicks)
.catch(reportExecuteScriptError);
