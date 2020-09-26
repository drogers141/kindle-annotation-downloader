# kindle-annotation-downloader

In firefox use about:debugging to load this extension as a temporary extension:
- clone this repo
- navigate to `about:debugging`
- click on `This Firefox` on left side
- click Load Temporary Add-on...
- navigate to the manifest.json in the cloned repo and select it

This will load the extension.

Go to your kindle annotations page:

https://read.amazon.com/notebook

Click on the KAD extension icon and click the popup.  This will download the active book's annotations.
The annotations are downloaded to a json file in your default download directory without prompting.

For now other extensions may interfere with this extension's injection of jquery.

TODO
- fix that.
- change extension to use url-based page icon
