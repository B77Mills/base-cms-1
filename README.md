# BaseCMS
[![Build Status](https://img.shields.io/travis/base-cms/base-cms.svg)](https://travis-ci.org/base-cms/base-cms)
[![Docker Pulls](https://img.shields.io/docker/pulls/basecms/base-cms.svg?)](https://hub.docker.com/r/basecms/base-cms/)
[![Image Size](https://img.shields.io/microbadger/image-size/basecms/base-cms/latest.svg)](https://microbadger.com/images/basecms/base-cms)

## Usage
_This repository requires Docker Engine 18.06.0 or greater as Compose file format 3.7 is used._

1. Clone the repository
2. From the project root run `scripts/install.sh` to install dependencies

## Running Services
From the project root, run `scripts/run.sh [SERVICE_NAME]`. For example, to run the dev environment for `graphql-server` run `scripts/run.sh graphql-server`

Available services include:
- `graphql-server`
- `example-website`
- `keyword-analysis`

To bring down all services (and service deps) run `scripts/down.sh`.

## Adding/Removing Dependencies
This repository uses Yarn workspaces for managing packages and services.
- To add dependencies to a workspace run `scripts/workspace.sh [WORKSPACE_NAME] add [package]`
- To remove dependencies from a workspace run `scripts/workspace.sh [WORKSPACE_NAME] remove [package]`

The `WORKSPACE_NAME` is equivalent to the `name` field found in the `package.json` file of the package or service. For example, to add a package to the `graphql-server` service, run `scripts/workspace.sh @parameter1/base-cms-graphql-server add [package]`

## Yarn
Do _NOT_ run Yarn from your local machine. Instead run Yarn commands using `scripts/yarn.sh [command]`


## Terminal Access
To access the terminal inside Docker run `scripts/terminal.sh`
