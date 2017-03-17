---
layout:     post
title:      "Migrating .NET Core project.json to MSBuild format"
subtitle:   "Moving to VS2017 for .NET Core development"
date:       2017-03-17 15:00:00
author:     "Christian Droulers"
header-img: "img/post-bg-boat.jpg"
---

[VS2017](https://www.visualstudio.com/downloads/) is officially out and with it,
the new version of the .NET Core build system: `MSBuild`!

What? They've gone BACK? Yes. `project.json` was basically reimplementing everything already present
in MSBuild so they changed back. Don't worry, they upgraded MSBuild to be much lighter and less
XML verbose. One of my test project has only 65 lines of XML and that includes some whitespace.

So migrating was a little bit of work since the migration tool works well for a vanilla
`project.json`, but I had a few customizations for StyleCop and others. Here's a quick recap of
all the steps I had to go through and some caveats to keep in mind.

## Migrate from `project.json` to `csproj`

After installing the [.NET Core SDK 1.0.1](https://www.microsoft.com/net/core#windowscmd),
the first step is migrating to `csproj`.

First, I had to upgrade the `sdk` property of `global.json`, otherwise
it couldn't find the `migrate` command.

```json
{
    "projects": [ "src", "test" ],
    "sdk": { "version": "1.1.1" }
}
```

Then, in the root folder of your solution:

    dotnet migrate

This will take care of transforming all your `project.json` files to `csproj`.
I had to delete my `.sln` file and create it anew in VS2017, but that might be my fault.

That's the easy part! After that, a simple `dotnet build` worked.

## StyleCop.Analyzers

I use [StyleCop.Analyzers](https://github.com/DotNetAnalyzers/StyleCopAnalyzers)
to lint my code and make sure everyone uses the same style. In each `project.json`,
I had the following to link to shared settings in the root directory:

```json
"buildOptions": {
    "debugType": "portable",
    "additionalArguments": [
        "/ruleset:../../stylecop.ruleset",
        "/additionalfile:../../stylecop.json"
    ],
    "warningsAsErrors": false
}
```

The `migrate` command *did not* take care of that. I had to open each `csproj` file
and add the following:

```xml
<PropertyGroup>
    <CodeAnalysisRuleSet>..\..\stylecop.ruleset</CodeAnalysisRuleSet>
</PropertyGroup>

<ItemGroup>
    <AdditionalFiles Include="..\..\stylecop.json" />
</ItemGroup>
```

Depending on when you migrate, you might have an issue where the JSON file
is not loaded properly and StyleCop reports hundreds of errors.

The issue [is resolved and waiting for merge here](https://github.com/DotNetAnalyzers/StyleCopAnalyzers/issues/2290).

## `dotnet test` and Shippable

I had to upgrade the three following dependencies from NuGet to their latest version.

* `Microsoft.NET.Test.Sdk`: 15.0.0
* `xunit`: 2.2.0
* `xunit.runner.visualstudio`: 2.2.0

`dotnet test` does not have the same xUnit runner anymore. The test results
are output in `TRX` format, which is not compatible with xUnit or jUnit by default.

I had to hunt the Internet for an XSLT file that transformed TRX to jUnit format
so Shippable could understand the test results.
[Here is the result](https://gist.github.com/cdroulers/510d2ecd6ff92002bb39469821a3a1b5) on
GitHub Gist.

## Shippable.yml

A few changes were needed to `shippable.yml` for everything to work. You can see
[my original post explaining]({{ site.baseurl }}{% post_url 2016/10/2016-10-28-dotnet-shippable-build %})
the basics of Shippable.

```yml
language: none

build:
  pre_ci_boot:
    image_name: microsoft/dotnet
    image_tag: 1.1.1-sdk # Changed from 1.1.0-sdk-projectjson
    pull: true
    options: "-e HOME=/root"

  ci:
    - apt-get --assume-yes install xsltproc
    # Removed the sed to treat warnings as errors
    - dotnet restore
     # Re-enable this when StyleCop.Analyzers is updated with the fix.
    - dotnet build # /p:TreatWarningsAsErrors=true
    - cd test/Akinox.Backend.Test.Unit
    # Changed this to output TRX format
    - dotnet test --logger "trx;LogFileName=../../../output.xml"

  on_success:
    - cd ../..
    # Uses new XLST file.
    - xsltproc -o shippable/testresults/result.xml scripts/trx-to-junit.xslt output.xml

  on_failure:
    - cd ../..
    # Uses new XLST file.
    - xsltproc -o shippable/testresults/result.xml scripts/trx-to-junit.xslt output.xml
```

## Conclusion

And with that, I'm at the same point I was before, except in VS2017.
Now on to trying to load the solution with
[VS For Mac](https://www.visualstudio.com/vs/visual-studio-mac/)!

If you've migrated and had problems, please mention them in the comments!

## Relevant links

A few links I found useful while going through the migration.

* [Nate McMaster - project.json to csproj part 1](http://www.natemcmaster.com/blog/2017/01/19/project-json-to-csproj/)
* [Nate McMaster - project.json to csproj part 2](http://www.natemcmaster.com/blog/2017/02/01/project-json-to-csproj-part2/)
* [Microsoft Docs - project.json to csproj](https://docs.microsoft.com/en-us/dotnet/articles/core/tools/project-json-to-csproj)
