#!/bin/bash

# Assume Build itemper web front-end
if [ ! -d dist ]  
then  
echo "./dist does not exist"
exit 1  
fi 
# Login to docker hub
cat  ~/.docker-pwd.txt | docker login --username tova --password-stdin

# Build and tag image
docker build . --file Dockerfile.development --tag itemper

version=v$(node -p "require('./package.json').version")

docker tag itemper tova/itemper-web:${version} 
docker tag itemper tova/itemper-web:latest 

# Push image to Docker hub
docker push tova/itemper-web:${version} 
docker push tova/itemper-web:latest
