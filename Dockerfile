FROM node:lts-alpine

RUN apt-get update && apt-get install -yq \
    && rm -rf /var/lib/apt/lists/*

# Defines our working directory in container
WORKDIR /itemper-web

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory
COPY . .

# Build itemper-web
RUN npm run build

CMD ["echo", "cp -r -u /itemper-web/dist/* /usr/share/nginx/html/itemper-web"]