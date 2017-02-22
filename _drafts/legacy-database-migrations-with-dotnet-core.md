---
layout:     post
title:      "Legacy database migrations with .NET Core"
subtitle:   "Stop messing around with SQL scripts and write migrations!"
date:       2017-02-22 11:30:00
author:     "Christian Droulers"
header-img: "img/post-bg-fjord.jpg"
---

When starting new development on a legacy application, one of the first steps should be to make
sure that building and running the application is easily reproducable. This implies making sure
dependencies are either checked in or easily downloadable (packages.config, package.json, etc.).

Another step is getting the (probably huge) development database into source control and easily
get it set up on any developer's machine. A good practice for database development is to use
[migrations](https://en.wikipedia.org/wiki/Schema_migration). But unless it's a new project, layout
usually have tons of tables and data in a database and getting that into a migration can be a pain.

There are a few options.

## 1. Exporting Schema only

Using tools like [SSMS](https://en.wikipedia.org/wiki/SQL_Server_Management_Studio), it's possible
to [export the schema only](http://stackoverflow.com/questions/12036458/export-database-schema-into-sql-file).

With that, the first migration in your list should be to run this schema export.

Though that might not be appropriate for some projects since you might need some static data in a lot
of tables or even need some test data that's part of the existing development database.

## 2. Exporting Schema and data

In the same way, it's possible to export all data in the script.

The downside here is that the script becomes pretty big, unless you can manually clean all tables
of unnecessary data. Even then, when you have a large SQL script, most migration engines will chug
slowly at processing each `INSERT` statement for data.

## 3. Using a database backup

Even though a backup is usually not text-based (such as `.bak` for SQL Server), the file-size is
generally acceptable. Using a tool like [7-Zip](https://7-zip.org), it's pretty easy to reduce
significantly the size of the backup. Using the "self-extract" option also makes sure that any
person using the backup won't need 7-Zip installed before getting everything done. Here is a screenshot
of the options used with 7-Zip:

![7-Zip self-extract](/img/posts/7-zip-self-extract.png)