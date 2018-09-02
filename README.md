# AWS Motioner Data or WDIP - Who Dunnit In Politics

## Setting up the development tools

The following tools are needed for development:

1. Install NodeJS 8.1 from https://nodejs.org/en/download.

1. Homebrew package manager (in order to install AWS CLI below)

    On MacOS, run

    ```/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"```

1. AWS CLI

    Use Homebrew to install the AWS CLI

    ```brew install awscli```

    See https://docs.aws.amazon.com/cli/latest/userguide/installing.html for more information if you would like to use the Python package manager PIP instead.

1. Add the following configuration in ~/.aws/credentials, replacing with the correct (and secret!) values:

    ```text
    [default]
    aws_access_key_id = any_value_will_do
    aws_secret_access_key = any_value_will_do

    [wdip-test]
    aws_access_key_id = INSERT-ACCESS-KEY-ID-HERE
    aws_secret_access_key = INSERT-SECRET-KEY-HERE
    ```

2. Add the following configuration in ~/.aws/config:

    ```text
    [default]
    region=eu-west-1
    output=json
    ```

1. Install the serverless framework (needed mainly for deployment)

    ```sudo npm install serverless -g```

1. Install Docker for running DynamoDB at https://www.docker.com/products/docker-desktop. 

1. Set up DynamoDB locally

    The application is using DynamoDB for persistent storage. In the repository root, run the following command to start the database and an admin interface:

    ```docker-compose up```

    Optionally, verify that the database is running by going to http://localhost:8001 or by running

    ```aws dynamodb list-tables --endpoint-url http://localhost:8000```

    This should give something similar to

    ```json
    {
        "TableNames": []
    }
    ```

1. Initialize the local database

    ```bash
    cd local
    npm run create
    ```

    Optionally verify in the admin GUI or the AWS CLI as above. 

## Deploying the backend

Using the [serverless](https://www.serverless.com) framework, run the following command to deploy a new version to AWS Lambda:

```bash
cd fetch-motions
serverless deploy -v
```

## Running the application

In order to serve the lambda functions on your local machine, run

```bash
cd fetch-motions
serverless offline -P 3001
```

or, to run lambda directly in terminal

```bash
cd fetch-motions
SLS_DEBUG=* serverless invoke local --function fetchMotions
```

The functions' REST endpoints will be served on localhost port 3001, for example http://localhost:3001/hello.