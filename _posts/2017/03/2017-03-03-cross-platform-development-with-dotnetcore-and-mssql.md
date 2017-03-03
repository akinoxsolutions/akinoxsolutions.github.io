---
layout:     post
title:      "Cross platform development with .NET Core and MSSQL"
subtitle:   "Who thought Microsoft technologies would one day run on a Mac?"
date:       2017-03-03 11:30:00
author:     "Christian Droulers"
header-img: "img/post-bg-reflections.jpg"
---

For new development done at Akinox on our Telemedecine platform, we've chosen [.NET Core](https://www.microsoft.com/net/core)
as the backend (a blog post will eventually explain why). Our frontend is built using [Node.js](https://nodejs.org/en/) and React. The database is on SQL Server since it has been that for a long
time now.

Recently, we've had help from developers who run their development setup on Macs. This was a little
troublesome to setup backend development. It involved setting up a Windows VM on VirtualBox, installing
Visual Studio 2015, SQL Server and possibly other dependencies to build the legacy application where
the database backup and database migrations are currently held. Then, once that was done, network
configuration and port forwarding and so on had to be built. This was a long and complicated process
which also is heavy on a smaller development machine.

With the recent arrival of [MSSQL on Linx](https://www.microsoft.com/en-us/sql-server/sql-server-vnext-including-Linux),
I planned on looking into it. Last week was the final straw when a new developer couldn't get his frontend
to communicate with the backend. I decided to look if there was a docker image for MSSQL.
[There totally was!](https://hub.docker.com/r/microsoft/mssql-server-linux/)

After downloading the huge image with

    docker pull microsoft/mssql-server-linux

I was able to start a working instance with the following command

    docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=AstrongPasswordHere!' -p 1433:1433 -v C:/dev/data/mssql:/var/opt/mssql --name mssql -d microsoft/mssql-server-linux

For those unfamiliar with docker, here's a quick explanation of each parameter:

* `-e 'ACCEPT_EULA=Y'`: Required by the container to start properly.
* `-e 'SA_PASSWORD=AstrongPasswordHere!'`: Setting the password for the SA user. It needs
    to be a strong password or the instance will not start.
* `-p 1433:1433`: This means that port `1433` on localhost will forward to `1433` on the container.
    If you already have `1433` used on localhost, you can change the first port to something else,
    e.g. `11433:1433`.
* `-v C:/dev/data/mssql:/var/opt/mssql`: This maps the local path `C:\dev\data\mssql` to `/var/opt/mssql`
    on the container. It's useful to store data between restarts of the container. Also between upgrades and whatnot. Note that using forward slashes is required on Windows as well!
* `--name mssql`: Friendly name to give the container for re-use later on.
* `-d`: Runs as a deamon, meaning we won't remain attached in the console.
* `microsoft/mssql-server-linux`: Tells docker to use this image for our container.

Since I mapped a local folder, I simply copied a backup of my current database running in
SQL Server to the folder and I was able to use SQL Server Management Studio on my docker instance
to restore the backup.

It's also possible to install `sqlcmd` directly on the container after attaching to it.
[Here are instructions on installing it](https://docs.microsoft.com/en-us/sql/linux/sql-server-linux-setup-tools).

Once install, I had two extra steps before being able to run it.

    locale-gen
    export LC_ALL="en_US.UTF-8"
    /opt/mssql-tools/bin/sqlcmd -S localhost -U SA

Here is a screenshot of what it looks like!

![sqlcmd sample output](/img/posts/mssql-sqlcmd-sample.png)

Restoring my backup was a simple

    RESTORE DATABASE [MyDatabase]
        FROM DISK = N'/var/opt/mssql/backup/mydatabase.bak' WITH
        FILE = 1,
        MOVE N'MyDatabase_Data' TO N'/var/opt/mssql/data/MyDatabase_Data.MDF',
        MOVE N'MyDatabase_Log' TO N'/var/opt/mssql/data/MyDatabase_Log.LDF',
        NOUNLOAD,
        REPLACE,
        STATS = 5

And there you have it! SQL Server in a docker container! This worked much better for our
developer on Mac, removing the necessity of a VM!

It's also practical to make the setup of the application faster and more easily reproducible
since all of it can be automated. I've changed my setup on my laptop to remove SQL Server entirely
since it's lighter to run docker!

It's also a step towards full containerization of our app, which would allow much easier deployments
and a transition to Cloud Hosting without too much hassle.