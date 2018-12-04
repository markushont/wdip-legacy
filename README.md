# AWS Motioner Data or WDIP - Who Dunnit In Politics

## Setting up the development tools

The following tools are needed for development:

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
