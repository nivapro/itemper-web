FROM debian:latest

RUN apt-get update && apt-get install -yq \
    && rm -rf /var/lib/apt/lists/*

# Defines our working directory in container
WORKDIR /itemper

COPY package*.json ./

RUN npm install --production

RUN npm run build

COPY ./dist .

CMD ["cp", "-r /itemper /usr/share/nginx/html/"]