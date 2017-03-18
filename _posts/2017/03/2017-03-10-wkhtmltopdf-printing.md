---
layout:     post
title:      "Using wkthmltopdf to create PDFs of your pages"
subtitle:   "Who hates PDF rendering? I do!"
date:       2017-03-10 15:00:00
author:     "Christian Droulers"
header-img: "img/post-bg-sunset.jpg"
---

It might have happened to you before. Your boss asks you, for some reason, to generate a PDF.

Your mouth says "yes" but your heart screams "NOOOOOOOOOOOOOOOOOO"!

Toolkits to generate PDFs exist, there's many of them. But they're complicated and each of them has quirks
and special handling.

You know what's simple? HTML, CSS and JavaScript. You've probably already got what you want in PDF in web format.
So why don't we just print that? [`wkhtmltopdf`](https://wkhtmltopdf.org/) to the rescue!

This uses [QT](https://www.qt.io/) and the [WebKit](https://webkit.org/) engine
to render an HTML document to PDF. WebKit being a full-featured browser engine means your
JavaScript executes too. That means you can even render your
<abbr title="Single Page Application">SPA</abbr> to PDF!

So for users who don't know or can't use "Print to PDF" in Chrome or other browsers, you can
now easily offer that functionality.

If you don't know about media types for printing, you should probably
[look into them](https://developer.mozilla.org/en-US/docs/Web/CSS/@media) first. Just make sure
that your CSS hides all the fluff around your page (app-bar, menus, footers, etc.) when the
`media-type` is `print` and you should be good to go!

Here is the command I use, formatted for clarity. Escape for your shell of choice!

    ./wkhtmltopdf
        --window-status "rendered"
        --zoom 1
        --dpi 96
        --disable-smart-shrinking
        -B 0
        -T 0
        -L 0
        -R 0
        --print-media-type
        --page-size Letter
        "http://example.org"
        "./example.pdf"

* `--window-status "rendered"`: This makes sure that `window.status` is equal to "rendered"
    before creating the PDF. It's also possible to use `--javascript-delay {delay-in-ms}` if
    there are problems with `window.status`.
* `--zoom 1`: See DPI and Smart Shrinking.
* `--dpi 96`: DPI settings and Smart Shrinking need to be specified for the output to be
    consistent on different computers. I had weird results in production because I had
    tested on my 4K monitor with different DPI in Windows settings .
* `--disable-smart-shrinking`: See DPI
* `-B 0`: Border bottom
* `-T 0`: Border top
* `-L 0`: Border left
* `-R 0`: Border right
* `--print-media-type`: Renders the HTML page with a print media type.
* `--page-size Letter`: Set up the page size for your country.
* `"http://example.org"`: URL to render.
* `"./example.pdf"`: Output file.

With this, I had very little work to get my report to become a PDF. I had to tweak the
`print` stylesheet some, but just to make sure it looked good and fit properly.

Tweaking the `print` stylesheet can be done easily with Chrome Developer tools since you
can tell it to render the page as it would for printing.

![Chrome devtools CSS media](/img/posts/chrome-devtools-css-media.png)

[See here for how to open the rendering tab](http://stackoverflow.com/questions/21247583/not-able-to-find-emulate-css-media-in-google-chrome).

It's a great solution since it also prevents having two different views for the same data and
it's easy to re-use known technologies for rendering the HTML.

**EDIT**: There's a bunch of [docker images](https://hub.docker.com/search/?isAutomated=0&isOfficial=0&page=1&pullCount=0&q=wkhtmltopdf&starCount=0)
available as well, so you might not even need to download anything to use it!

As I've [posted recently about MSSQL on Docker]({{ site.baseurl }}{% link _posts/2017/03/2017-03-03-cross-platform-development-with-dotnetcore-and-mssql.md %}), it's
a good idea to dockerize dependencies!
