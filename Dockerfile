FROM node:lts-alpine

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

CMD ["./deploy.sh", ""]