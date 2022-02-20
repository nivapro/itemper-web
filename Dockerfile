FROM debian:latest

RUN apt-get update && apt-get install -yq \
    && rm -rf /var/lib/apt/lists/*

# Defines our working directory in container
WORKDIR /itemper-web

# copy project files and folders to the current working directory
COPY . .

RUN npm install --production

RUN npm run build

CMD ["echo", "cp -r -u /itemper-web/dist/* /usr/share/nginx/html/itemper-web"]