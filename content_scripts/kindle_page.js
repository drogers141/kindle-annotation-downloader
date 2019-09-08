(function() {
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

  function reportError(error) {
    console.error(`kindle_page.js error: ${error}`);
  }

  function scrapeActiveBook() {
    let firstNode = $("#annotation-scroller .a-row .a-spacing-base").first();
    let activeBookMeta = firstNode.children().find(".kp-notebook-metadata").map(function(){ return $(this).text()}).get();

    return activeBookMeta;
  }

  function scrapeStoreAndNotifyBackend() {
    let activeBookMeta = scrapeActiveBook();
    return browser.storage.local.set({"activeBookMeta": activeBookMeta})
        .then(() => {
          console.log("stored active book:\n" + activeBookMeta);
          browser.runtime.sendMessage({
            "target": "background",
            "command": "check_storage",
            "message": "check stored data"
          });
        })
        .catch(reportError);
  }

  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "execute") {
      scrapeStoreAndNotifyBackend()
          .catch(reportError);
    } else if (message.target === "kindle_page") {
      console.log("got message from background: " + message.message);
    }
  });

})();

/*
 $("#kp-notebook-annotations")
 $(".a-row,.a-spacing-base").text()
 $(".a-column,.a-span5").text()

 Not sure why these have the same id..
 Yellow highlight | Location:&nbsp;222
 Yellow highlight | Location:&nbsp;222
 <span id="annotationHighlightHeader" class="a-size-small a-color-secondary kp-notebook-selectable kp-notebook-metadata">Yellow highlight | Location:&nbsp;222</span>
 <span id="annotationHighlightHeader" class="a-size-small a-color-secondary kp-notebook-selectable kp-notebook-metadata">Yellow highlight | Location:&nbsp;230</span>

 To the get the div's for selecting the active book - ie the right column:
 $(".a-row,.kp-notebook-library-each-book")

 each div has an id like:
 #B01N083AYI

 should be able to click this div to change the active book

 number of highlights/notes for active book
 $("#kp-notebook-highlights-count").text()
 $("#kp-notebook-notes-count").text()
 Note that the earlier form of comma-separated selectors retrieves the union, where as space delimited
 is limiting by ancestor descendant
 $("#annotation-scroller .a-row .a-spacing-base")

 Trying to get information on active book - a little sloppier:
 var firstNode = $("#annotation-scroller .a-row .a-spacing-base")[0]

 firstNode.textContent
-> "Your Kindle Notes For:Getting Things Done: The Art of Stress-Free ProductivityDavid Allen and James FallowsLast accessed on Sunday September 1, 2019"

 same as
 var firstNode = $("#annotation-scroller .a-row .a-spacing-base").first()

 get the image of the book cover
 firstNode.children().find("img").attr("src")
-> "https://images-na.ssl-images-amazon.com/images/I/81RFSiwpvyL._SY160.jpg"

 get the metadata from the book, newline-delimited
 firstNode.children().find(".kp-notebook-metadata").map(function(){ return $(this).text()}).get().join("\n")
"Your Kindle Notes For:
Getting Things Done: The Art of Stress-Free Productivity
David Allen and James Fallows
Last accessed on Sunday September 1, 2019"

 get it as an array:
 firstNode.children().find(".kp-notebook-metadata").map(function(){ return $(this).text()}).get()
Array(4) [ "Your Kindle Notes For:", "Getting Things Done: The Art of Stress-Free Productivity", "David Allen and James Fallows", "Last accessed on Sunday September 1, 2019" ]

​
  */
