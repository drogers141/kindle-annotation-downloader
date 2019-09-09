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

    function reportError(error) {
        console.error(`kindle_page.js error: ${error}`);
    }

    /*
      Returns {"title":, "authorString":, "lastAccessed": datetime str with tz}
      all strings
     */
    function activeBookMeta() {
        let firstNode = $("#annotation-scroller .a-row .a-spacing-base").first();
        let workingMeta = firstNode.children().find(".kp-notebook-metadata").map(function () {
            return $(this).text();
        }).get();
        let [_, title, authors, lastAccessedStr] = workingMeta;
        console.log("lastAccessedStr: ", lastAccessedStr);
        let cleanedDateStr = lastAccessedStr.replace(',', '').split(' ').slice(-3).join(' ');
        let lastAccessedDatetime = moment(cleanedDateStr, "LL").format();
        return {title: title, authorString: authors, lastAccessed: lastAccessedDatetime};
    }

    /*
    Returns {"highlightCount": <int>, "notesCount": <int>}
     */
    function annotationCounts(node) {
        let annotationsSumStr = $("#annotation-scroller .kp-notebook-row-separator").first().children().first().text().split('|').map((s) => s.trim())
        let [highlights, notes] = annotationsSumStr.map((s) => parseInt(s))
        return {"highlightCount": highlights, "notesCount": notes}
    }

    function parseAnnotationNode(node) {
        console.log("node text:\n" + $(node).text());
        let metadata = $(node).find(".kp-notebook-metadata").first().text();
        console.log("highlight metadata: ", metadata);
    }

    function scrapeActiveBook() {
        let meta = activeBookMeta();
        let annotationCts = annotationCounts();
        let annotationNodes = $("#annotation-scroller .kp-notebook-row-separator").slice(1);
        jQuery.each(annotationNodes.slice(1,4), (index, node) => {
            parseAnnotationNode(node);
        })
        return {"metadata": meta, "annotationCounts": annotationCts};
    }

    // todo - use storage change notification instead?
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

get divs of highlights for active book with
​$("#annotation-scroller .kp-notebook-row-separator").length
15
$("#annotation-scroller .kp-notebook-row-separator").length === $("#annotation-scroller .a-row .a-spacing-base").length
true
this gets metadata

this gets count of highlights and notes
$("#annotation-scroller .kp-notebook-row-separator").first().children().first().text()
"11 Highlight(s) |
        6 Note(s)"
string array:
annotationsSumStr = $("#annotation-scroller .kp-notebook-row-separator").first().children().first().text().split('|').map((s)=>s.trim())
Array [ "11 Highlight(s)", "6 Note(s)" ]
counts as ints:
annotationsSumStr.map((s)=> parseInt(s))
Array [ 11, 6 ]

Work with annotation sections:
$("#annotation-scroller .kp-notebook-row-separator").slice(1).length
14
** make sure to catch all cases
highlight and note
only note
only highlight


$(annotationNodes[0]).find(".kp-notebook-metadata").first().text()
"Yellow highlight | Page: 5"

$(annotationNodes[6]).find(".kp-notebook-metadata").first().text()
"Note | Page: 8"

Note that even if the display doesn't show separate metadata for a
highlight and note on the same page, the html does
$(annotationNodes[10]).find(".kp-notebook-metadata").first().text()
"Note | Page: 10"
$(annotationNodes[9]).find(".kp-notebook-metadata").first().text()
"Yellow highlight | Page: 10"

​so this will make parsing regular - yay
  */
