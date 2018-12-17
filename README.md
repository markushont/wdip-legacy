# AWS Motioner Data or WDIP - Who Dunnit In Politics

## Setting up the development tools

The following tools are needed for development:

1. Enter ```wdip-fe/``` and run ```npm install```

1. Enter ```wdip-be/``` and run ```npm install```

1. Install Docker for running all system components at https://www.docker.com/products/docker-desktop. 

1. In the root directory of the repository, run

    ```docker-compose up```

This brings up the system containing these components:

* WDIP frontend at http://localhost:3000
* WDIP backend at http://localhost:3001
* Elasticsearch at http://localhost:9200
* Kibana at http://localhost:5601

The WDIP frontend and backend components reload automatically on file changes without restarting docker containers or applications. The WDIP backend exposes a debug possibility on port 9229, making it possible to set breakpoints and interactively debug the application. If you use Visueal Studio Code, use the debugger configuration _Attach to WDIP-BE_.

## Optional development tools

The following tools might be handy for development and deployment:

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

1. Install TypeScript

    ```sudo npm install -g typescript```

## Generating API Client

The backend API is defined in an OpenAPI definition file (at wdip-be/api/swagger.yml). This can be used to automatically generate a client component for the frontend application, making it easy to use the backend service by invoking methods and getting typed response objects back. When the API definition changes, you can regenerate the API client by running the following commands:

```bash
# Remove the previous API client
rm -rf wdip-fe/src/service/wdip-be

# Generate the new API client
docker run --rm -v ${PWD}:/local openapitools/openapi-generator-cli generate -i /local/wdip-be/src/api/swagger.yml -g typescript-fetch -o /local/wdip-fe/src/service/wdip-be
```

## Deploying the backend

Using the [serverless](https://www.serverless.com) framework, run the following command to deploy a new version to AWS Lambda:

```bash
cd wdip-be
serverless deploy -v
```

## Fetching data locally, version 1

Add new data to the DB by accessing ```http://localhost:3001/fetch-motions```. This API supports two operations:

Example ```GET``` request:

    curl http://localhost:3001/fetch-motions

Will fetch all motions that have been created since the last time the script was run.

Example ```POST``` request:

    curl -H "Content-Type: application/json" --request POST -d '{"from":"2018-01-01","to":"2018-12-31"}' http://localhost:3001/fetch-motions

Will fetch all motions within the specified date interval.

## Fetching data locally, version 2

The second data import functionality uses a queue (Amazon SQS) where documents that are about to be imported are put. A lambda function consumes these queue messages and populates the database accordingly. This should give us greater stability and the ability to import data for a long period. There are two main parts of the import functionality:

1. A publication service searches the parliament public API and adds a queue message for each found document.
1. A subscription service gets triggered whenever there is a new message on the queue. It fetches the full content of the document, transposes it to the WDIP data format, and saves it to the Elastic Search database.

The publication service can be triggered by a REST call, supplying a date range:

    curl -X POST http://localhost:3001/admin/import?fromDate=2018-01-01&toDate=2018-02-01

### Import queue status

There is a queue status function that gets triggered every minute. It queries the queue for status information such as number of unprocessed messages and saves it to the Elastic Search database. This allows us to monitor the import progress and chart it using Kibana.
