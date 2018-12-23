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

## Fetching data locally

The data import functionality uses a queue (Amazon SQS) where documents that are about to be imported are put. A lambda function consumes these queue messages and populates the database accordingly. This should give us greater stability and the ability to import data for a long period. There are two main parts of the import functionality:

1. A publication service searches the parliament public API and adds a queue message for each found document.
1. A subscription service gets triggered whenever there is a new message on the queue. It fetches the full content of the document, transposes it to the WDIP data format, and saves it to the Elastic Search database.

The publication service can be triggered by a REST call, supplying a date range:

    curl -X POST http://localhost:3001/admin/import?fromDate=2018-01-01&toDate=2018-02-01

### Import queue status

There is a queue status function that gets triggered every minute. It queries the queue for status information such as number of unprocessed messages and saves it to the Elastic Search database. This allows us to monitor the import progress and chart it using Kibana.

## Runtime config

When starting the complete docker compose environment, a runtime service is started to take care of setting up development defaults. This allows us to use standard Docker images and should make it a bit easier to share a working development environment.

The runtime config currently updates:

* Kibana dashboard with jobs and queue visualizations

### Updating Kibana settings

If you want to update the default Kibana configuration, do the following:

1. Make changes in the Kibana interface
1. Export the changes by running the following command, updating it appropriately:

    ```bash
    curl -X POST "http://localhost:5601/api/saved_objects/_bulk_get" -H 'kbn-xsrf: true' -H 'Content-Type: application/json' -d'
    [
        {
            "type": "index-pattern",
            "id": "47d82ec0-050b-11e9-9624-e1344b4a29b4"
        },
        {
            "type": "index-pattern",
            "id": "a75cd810-0172-11e9-8792-11383dceacf8"
        },
        {
            "type": "dashboard",
            "id": "3389d330-0176-11e9-8792-11383dceacf8"
        },
        {
            "type":"visualization",
            "id":"7d2da2c0-050c-11e9-9624-e1344b4a29b4"
        },
        {
            "type":"visualization",
            "id":"01ef09a0-050c-11e9-9624-e1344b4a29b4"
        },
        {
            "type":"visualization",
            "id":"7a60c8d0-0177-11e9-8792-11383dceacf8"
        }
    ]
    '
    ```

1. Put the result in the `./config/runtime/kibana/default.json` and manually make sure
    * that the file starts with the array of saved objects (ie remove the topmost node).
    * all `updated_at` fields are removed.
1. Test your changes by running `docker-compose up runtime-config`.
1. Commit your changes.
1. At next start of the runtime config service, the new settings will be applied. Note that this will be pushed to other developers as well, overwriting the Kibana objects if they already exist, so be mindful of your changes.