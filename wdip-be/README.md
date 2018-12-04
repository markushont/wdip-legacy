# AWS MOTIONER DATA or WDIP - Who Dunnit In Politics

## Introduction
wdip-be serves two different purposes

### Web application API

The api/ folder contains all client-facing APIs.

### Scheduled jobs
The scheduledJobs/ folder contains all jobs that continuously fetch data from Riksdagen and put them to the DB. Examples:

- ```fetchMotions``` is run once a week to fetch the latest motions
- ```refreshPendingMotions``` is also run once a week to update statuses of motions that are pending a final status

The scheduled jobs are built and deployed as cron-controlled AWS lambdas.

## Working with wdip-be

1. Install the required dependencies by running

    ```npm install```

1. If wdip-be was previously started, you may need to restart the service:

    ```docker-compose restart wdip-be```
