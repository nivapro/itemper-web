FROM node:lts-alpine
RUN apk update && apk upgrade && apk add bash

# Defines our working directory in container
WORKDIR /itemper

# copy project files and folders to the current working directory, including deploy.sh
COPY dist dist/

COPY deploy.sh .

RUN chmod 755 deploy.sh

ENTRYPOINT [ "./deploy.sh" ]
