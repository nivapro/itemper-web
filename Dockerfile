FROM debian:latest

RUN apt-get update && apt-get install -yq \
    && rm -rf /var/lib/apt/lists/*

# Defines our working directory in container
WORKDIR /itemper

COPY package*.json ./

RUN npm install --production

# copy project files and folders to the current working directory
COPY . .

RUN npm run build

CMD ["cp", "-r ./dist /usr/share/nginx/html/itemper"]