---
layout:     post
title:      ".NET Core build on Shippable"
subtitle:   "Make sure you know who breaks your build!"
date:       2016-10-28 16:30:00
author:     "Christian Droulers"
header-img: "img/post-bg-fjord.jpg"
---

At Akinox, we use [Shippable](https://app.shippable.com/) for our automated builds. Mainly because
it integrates quite well with [BitBucket](https://bitbucket.org).

Since our new application use .NET Core, we obviously had to do a bit of manual set-up since it's not
in Shippable's supported languages.

Starting from [this issue's](https://github.com/Shippable/support/issues/2870) `shippable.yml` config,
I was able to get our project to build and to get the test results out into Shippable.

Here is what is looks like

{% highlight yml %}
language: none

build:
  pre_ci_boot:
    image_name: microsoft/dotnet
    image_tag: 1.0.0-preview2-sdk
    pull: true
    options: "-e HOME=/root"

  ci:
    - apt-get --assume-yes install xsltproc
    - dotnet restore
    - dotnet build **/project.json
    - cd test/UnitTestProject
    - dotnet test -xml ../../output.xml
    - cd ../..
    - xsltproc -o shippable/testresults/result.xml scripts/xunit-to-junit.xslt output.xml
{% endhighlight %}

Since my tests use xUnit, I have to transform the output to `junit` format for Shippable to understand them.
I found [this great post](http://4a47.blogspot.ca/2014/12/xunitnet-junit-jenkins.html) with the proper xslt which can
[be downloaded here](https://gist.github.com/cdroulers/e23eeb31d6c1c2cade6f680e321aed8d). I only had to change the
version to `1.0` for `xsltproc` to work!