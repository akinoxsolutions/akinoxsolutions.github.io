---
layout:     post
title:      "HTML Emails :("
subtitle:   "It's 2017 and email is still horrible"
date:       2017-03-29 10:00:00
author:     "Christian Droulers"
header-img: "img/post-bg-reflection-pattern.jpg"
---

Apparently, wanting technology that was drafted in 1997 and finalised in 2011 to work
properly in 2017 is asking too much. Pretty emails that work consistently across different
clients are *very* hard to build. If your application sends transactional emails, this
post is probably relevant to you!

Plain text will (unfortunately) get you only so far. Users expect a little more from email
than simple text. But once you start getting involved in *overly* complicated things like
background colours or even making text centered, you're opening Pandora's box. There is a
plethora of 
[different clients that all handle things differently](https://www.campaignmonitor.com/css/).
Some will respect CSS in the `<head>`, others won't. Some will simply ignore all CSS. The only reliable way is to use basic HTML elements and attributes like it's 1997 all over again.
Also, table for layout is back in action for this wonderful task.

Obviously, writing markup manually for tables and repetitive styles like font-style, weight,
size, family and so on would be way too tedious for anyone. If only someone had done
all this work already...

[Someone did!](http://foundation.zurb.com/emails.html) We're saved!

![Zurb Foundation for Email](/img/posts/zurb-foundation-emails.png)

Zurb's Foundation for Email requires [NodeJS](https://nodejs.org/), which you probably
already have installed if you do frontend development work. There's a
[handy guide](https://foundation.zurb.com/emails/docs/sass-guide.html) available for
starting a new project. The framework uses
[Inky](https://foundation.zurb.com/emails/docs/inky.html) to write HTML like code
that will then be transformed into actual HTML. Then, for a production build, it will
also inline your CSS and minify your HTML. That means you can develop using regular
CSS (event SASS in the default project's configuration) with IDs and classes and whatnot
so you don't repeat everything at development time. Then for production, you get a
cross-client compatible output.

Basically, you turn this

```xml
<wrapper class="header">
  <container>
    <row class="collapse">
      <columns small="6">
        <img src="http://placehold.it/200x50/663399">
      </columns>
      <columns small="6">
        <p class="text-right">BASIC</p>
      </columns>
    </row>
  </container>
</wrapper>

<container>
  <spacer size="16"></spacer>
  <row>
    <columns small="12">
      <h1>Hi, Susan Calvin</h1>
      <p class="lead">Lorem ipsum dolor sit amet</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
      <callout class="primary">
        <p>Lorem ipsum dolor sit amet.</p>
      </callout>
    </columns>
  </row>
</container>
```

into this

![Zurb basic output](/img/posts/zurb-basic-output.png)

All this is styled using SASS and can be previewed and built in the browser with normal
development tools like Chrome's. The project template already supports
[BrowserSync](https://www.npmjs.com/package/browser-sync) which makes it even easier
to write and see as you code.

The basic CSS template can be modified at will or used as is. You can then customise
all your emails as you wish. Simply add a new `html` file and write away. I added
a step in the `gulpfile` to copy my templates' output from the Zurb project to my
actual backend code. As I write the templates, they are automatically updated in my
backend and I can test them out with my unit tests or by using the UI to actually
send them!

Here's the gulp function.

```javascript
function copyToParents(done) {
  return rimraf("../DotNetCoreBackend/Emails/*.cshtml", () => {
    return gulp
      .src("dist/emails/*.html")
      .pipe(
        $.rename({
          extname: ".cshtml"
        })
      )
      .pipe($.replace("@media", "@@media"))
      .pipe(gulp.dest("../DotNetCoreBackend/Emails/Emails"))
      .on("end", done);
  });
}
```

I use [`RazorLight`](https://github.com/toddams/RazorLight) to fill out data in the
templates, so I change the extension while copying them. It's also why I replace
`@media` with the Razor safe `@@media`.

In the end, I end up with good looking HTML emails that are filled with Razor and
can be sent to any user with any email client!