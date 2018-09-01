# AWS Motioner Data or WDIP - Who Dunnit In Politics

### Setting ut the development tools

The following tools are needed for development:

1. NodeJS 8.1

1. Python package manager PIP (in order to install AWS CLI below)

    On MacOS, run

    ```sudo easy_install pip```

1. AWS CLI

    Use the Python package manager PIP to install by running

    ```pip install awscli --upgrade --user```

    See https://docs.aws.amazon.com/cli/latest/userguide/installing.html for more information.

1. Add the following configuration in ~/.aws/credentials, replacing with the correct values:

    ```text
    [profile-test]
    aws_access_key_id = INSERT-ACCESS-KEY-ID-HERE
    aws_secret_access_key = INSERT-SECRET-KEY-HERE
    ```

1. Install the serverless framework (needed mainly for deployment)

    ```sudo npm install serverless -g```

### Deploying the backend

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